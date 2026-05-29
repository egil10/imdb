import type { Actor, Dataset } from "./dataset";
import { pickRandomActor } from "./dataset";

export type GraphNode = {
  id: string;
  type: "movie" | "actor";
  label: string;
  year?: number;
  hue?: number;
  // Popularity weight — used by NetworkGraph to scale node radius.
  // For movies: log10(votes). For actors: log10(filmography size).
  weight?: number;
};

export type GraphLink = { source: string; target: string };
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

// What the canvas is currently centered on. The graph can be driven by either
// a film (its cast + their filmographies) or an actor (their whole career).
export type Focus =
  | { kind: "movie"; id: string }
  | { kind: "actor"; id: string };

// Soft ceiling on how many nodes a single focal-film view should contain.
// We expand every cast member's full filmography, but if the total would blow
// past this budget we trim each actor proportionally so the canvas stays
// legible and the layout stays fast. A lone film with a small cast shows
// *everything*; a star-studded one shares the budget across the cast.
const MOVIE_VIEW_NODE_BUDGET = 650;
// Never show fewer than this many films per actor, even in a crowded cast —
// otherwise the budget trim could starve everyone down to a couple of films.
const MIN_FILMS_PER_ACTOR = 10;

import { hueFor } from "./dataset";

// Map raw popularity to a 0..1 "weight" the renderer uses for node radius.
// votes ranges from ~5k to ~3M, so log10(votes) ranges ~3.7 to ~6.5 — we
// rescale that to 0..1 so the smallest dot is still visible.
function weightForVotes(votes: number): number {
  const v = Math.max(1, votes || 1);
  const x = (Math.log10(v) - 3.5) / (6.5 - 3.5);
  return Math.max(0, Math.min(1, x));
}
function weightForActorFilms(count: number): number {
  if (count <= 1) return 0;
  const x = (Math.log10(count) - 0) / (Math.log10(100) - 0);
  return Math.max(0, Math.min(1, x));
}

// Which node categories are visible on the canvas. The focal node is always
// kept regardless of filters.
export type GraphFilters = { actors: boolean; films: boolean };

// Hide whole node categories so the user can declutter the view (e.g. drop the
// outer film ring to see just a film and its cast). Links to hidden nodes are
// removed, and any non-focal node left with no links is pruned.
export function applyGraphFilters(
  g: GraphData,
  focalId: string | undefined,
  filters: GraphFilters,
): GraphData {
  if (filters.actors && filters.films) return g;

  const keep = new Set<string>();
  for (const n of g.nodes) {
    if (n.id === focalId) keep.add(n.id);
    else if (n.type === "actor" && filters.actors) keep.add(n.id);
    else if (n.type === "movie" && filters.films) keep.add(n.id);
  }

  const links = g.links.filter((l) => keep.has(l.source) && keep.has(l.target));

  const linked = new Set<string>();
  for (const l of links) {
    linked.add(l.source);
    linked.add(l.target);
  }
  const nodes = g.nodes.filter(
    (n) => keep.has(n.id) && (n.id === focalId || linked.has(n.id)),
  );
  return { nodes, links };
}

// Dispatch to the right builder based on what the user is focused on.
export function buildGraph(d: Dataset, focus: Focus): GraphData {
  return focus.kind === "actor"
    ? buildActorGraph(d, focus.id)
    : buildMovieGraph(d, focus.id);
}

export function buildMovieGraph(d: Dataset, movieId: string): GraphData {
  const focal = d.moviesById[movieId];
  if (!focal) return { nodes: [], links: [] };

  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const seenLinks = new Set<string>();

  const addNode = (n: GraphNode) => {
    if (!nodes.has(n.id)) nodes.set(n.id, n);
  };
  const addLink = (a: string, b: string) => {
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seenLinks.has(k)) return;
    seenLinks.add(k);
    links.push({ source: a, target: b });
  };

  addNode({
    id: `movie:${focal.id}`,
    type: "movie",
    label: focal.title,
    year: focal.year,
    hue: hueFor(focal),
    weight: weightForVotes(focal.votes),
  });

  // Share the node budget across the cast: a tiny cast can each show their
  // whole career; a packed one gets a fair per-actor slice (never below the
  // floor). Films are pre-sorted by votes, so trimming keeps the best-known.
  const castSize = Math.max(1, focal.cast.length);
  const perActorCap = Math.max(
    MIN_FILMS_PER_ACTOR,
    Math.floor(MOVIE_VIEW_NODE_BUDGET / castSize),
  );

  for (const actorId of focal.cast) {
    const actorNodeId = `actor:${actorId}`;
    const filmCount = (d.filmography[actorId] || []).length;
    addNode({
      id: actorNodeId,
      type: "actor",
      label: d.actorNamesById[actorId] || actorId,
      weight: weightForActorFilms(filmCount),
    });
    addLink(`movie:${focal.id}`, actorNodeId);

    const films = (d.filmography[actorId] || []).filter((mid) => mid !== focal.id);
    for (const mid of films.slice(0, perActorCap)) {
      const m = d.moviesById[mid];
      if (!m) continue;
      const mNodeId = `movie:${m.id}`;
      addNode({
        id: mNodeId,
        type: "movie",
        label: m.title,
        year: m.year,
        hue: hueFor(m),
        weight: weightForVotes(m.votes),
      });
      addLink(actorNodeId, mNodeId);
    }
  }

  return { nodes: Array.from(nodes.values()), links };
}

// Actor-centric view: the actor sits at the middle and *every* film in their
// filmography radiates out as its own node — 30 films → 30 spokes. This is the
// "show me everything on Cillian Murphy" view.
export function buildActorGraph(d: Dataset, actorId: string): GraphData {
  const films = d.filmography[actorId];
  if (!films) return { nodes: [], links: [] };

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const actorNodeId = `actor:${actorId}`;

  nodes.push({
    id: actorNodeId,
    type: "actor",
    label: d.actorNamesById[actorId] || actorId,
    weight: weightForActorFilms(films.length),
  });

  for (const mid of films) {
    const m = d.moviesById[mid];
    if (!m) continue;
    nodes.push({
      id: `movie:${m.id}`,
      type: "movie",
      label: m.title,
      year: m.year,
      hue: hueFor(m),
      weight: weightForVotes(m.votes),
    });
    links.push({ source: actorNodeId, target: `movie:${m.id}` });
  }

  return { nodes, links };
}

export type PathStep =
  | { type: "movie"; id: string; title: string; year: number }
  | { type: "actor"; id: string; name: string };

export function findPath(d: Dataset, fromId: string, toId: string): PathStep[] | null {
  if (fromId === toId) {
    const m = d.moviesById[fromId];
    return m ? [{ type: "movie", id: m.id, title: m.title, year: m.year }] : null;
  }
  if (!d.moviesById[fromId] || !d.moviesById[toId]) return null;

  const start = `m:${fromId}`;
  const goal = `m:${toId}`;
  const prev = new Map<string, string | null>();
  prev.set(start, null);

  // Head-pointer queue keeps this BFS linear (Array.shift is O(n)).
  const queue: string[] = [start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    if (node === goal) break;
    if (node.startsWith("m:")) {
      const movie = d.moviesById[node.slice(2)];
      if (!movie) continue;
      for (const aid of movie.cast) {
        const next = `a:${aid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
        }
      }
    } else {
      const aid = node.slice(2);
      for (const mid of d.filmography[aid] || []) {
        const next = `m:${mid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
          if (next === goal) {
            queue.length = 0;
            break;
          }
        }
      }
    }
  }
  if (!prev.has(goal)) return null;

  const chain: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    chain.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  return chain.map((nid): PathStep => {
    if (nid.startsWith("m:")) {
      const m = d.moviesById[nid.slice(2)]!;
      return { type: "movie", id: m.id, title: m.title, year: m.year };
    }
    const aid = nid.slice(2);
    return { type: "actor", id: aid, name: d.actorNamesById[aid] || aid };
  });
}

// ── Six Degrees: actor → actor through shared films ─────────────────────────
// The game now travels between two *actors*, hopping through the films they
// share with the cast in between (actor → film → actor → film → … → actor).

export type ActorChallenge = {
  from: Actor;
  to: Actor;
  optimal: PathStep[]; // actor, movie, actor, … , actor
};

// Number of films ("degrees") separating the two actors along a path.
export function hopsOf(path: PathStep[]): number {
  return path.filter((s) => s.type === "movie").length;
}

// Shortest actor → actor path over the bipartite graph. The returned chain
// alternates actor, movie, actor, … and always starts and ends on an actor.
export function findActorPath(
  d: Dataset,
  fromActorId: string,
  toActorId: string,
): PathStep[] | null {
  if (fromActorId === toActorId) {
    const name = d.actorNamesById[fromActorId];
    return name !== undefined
      ? [{ type: "actor", id: fromActorId, name }]
      : null;
  }

  const start = `a:${fromActorId}`;
  const goal = `a:${toActorId}`;
  const prev = new Map<string, string | null>();
  prev.set(start, null);

  const queue: string[] = [start];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    if (node === goal) break;
    if (node.startsWith("a:")) {
      const aid = node.slice(2);
      for (const mid of d.filmography[aid] || []) {
        const next = `m:${mid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
        }
      }
    } else {
      const movie = d.moviesById[node.slice(2)];
      if (!movie) continue;
      for (const aid of movie.cast) {
        const next = `a:${aid}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
          if (next === goal) {
            head = queue.length; // stop the outer loop
            break;
          }
        }
      }
    }
  }
  if (!prev.has(goal)) return null;

  const chain: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    chain.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  return chain.map((nid): PathStep => {
    if (nid.startsWith("m:")) {
      const m = d.moviesById[nid.slice(2)]!;
      return { type: "movie", id: m.id, title: m.title, year: m.year };
    }
    const aid = nid.slice(2);
    return { type: "actor", id: aid, name: d.actorNamesById[aid] || aid };
  });
}

// Pick two actors from the giant component (so a path is guaranteed) whose
// shortest connection lands in a fun 2–4 film range, retrying for a bit.
export function pickSolvableActorChallenge(
  d: Dataset,
  minHops = 2,
  maxHops = 4,
): ActorChallenge {
  let fallback: ActorChallenge | null = null;
  for (let i = 0; i < 40; i++) {
    const a = pickRandomActor(d);
    const b = pickRandomActor(d, a.id);
    const path = findActorPath(d, a.id, b.id);
    if (!path) continue;
    const hops = hopsOf(path);
    if (hops >= minHops && hops <= maxHops) return { from: a, to: b, optimal: path };
    if (!fallback && hops > 0) fallback = { from: a, to: b, optimal: path };
  }
  if (fallback) return fallback;
  const a = pickRandomActor(d);
  const b = pickRandomActor(d, a.id);
  return { from: a, to: b, optimal: findActorPath(d, a.id, b.id) ?? [] };
}
