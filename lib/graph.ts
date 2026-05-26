import { ACTORS_NAMES, FILMOGRAPHY, MOVIES, MOVIES_BY_ID, type Movie } from "@/data/movies";

export type GraphNode = {
  id: string;
  type: "movie" | "actor";
  label: string;
  year?: number;
  hue?: number;
  // computed at runtime by force-graph: x, y, vx, vy, fx, fy
};

export type GraphLink = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

/**
 * Build the "cast cloud" graph for a focal movie: focal movie -> its cast ->
 * every other movie that cast has appeared in.
 */
export function buildMovieGraph(movieId: string): GraphData {
  const focal = MOVIES_BY_ID[movieId];
  if (!focal) return { nodes: [], links: [] };

  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const seenLinks = new Set<string>();

  const addNode = (n: GraphNode) => {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
  };
  const addLink = (source: string, target: string) => {
    const k = source < target ? `${source}|${target}` : `${target}|${source}`;
    if (seenLinks.has(k)) return;
    seenLinks.add(k);
    links.push({ source, target });
  };

  addNode({
    id: `movie:${focal.id}`,
    type: "movie",
    label: focal.title,
    year: focal.year,
    hue: focal.hue,
  });

  for (const actorId of focal.cast) {
    const actorNodeId = `actor:${actorId}`;
    addNode({
      id: actorNodeId,
      type: "actor",
      label: ACTORS_NAMES[actorId] || actorId,
    });
    addLink(`movie:${focal.id}`, actorNodeId);

    for (const otherMovieId of FILMOGRAPHY[actorId] || []) {
      if (otherMovieId === focal.id) continue;
      const other = MOVIES_BY_ID[otherMovieId];
      if (!other) continue;
      const otherNodeId = `movie:${other.id}`;
      addNode({
        id: otherNodeId,
        type: "movie",
        label: other.title,
        year: other.year,
        hue: other.hue,
      });
      addLink(actorNodeId, otherNodeId);
    }
  }

  return { nodes: Array.from(nodeMap.values()), links };
}

/**
 * BFS shortest path between two movies, alternating movie -> actor -> movie ...
 * Returns an ordered list of nodes (movie, actor, movie, actor, ..., movie)
 * or null if disconnected.
 */
export type PathStep =
  | { type: "movie"; id: string; title: string; year: number }
  | { type: "actor"; id: string; name: string };

export function findPath(fromMovieId: string, toMovieId: string): PathStep[] | null {
  if (fromMovieId === toMovieId) {
    const m = MOVIES_BY_ID[fromMovieId];
    return m ? [{ type: "movie", id: m.id, title: m.title, year: m.year }] : null;
  }
  if (!MOVIES_BY_ID[fromMovieId] || !MOVIES_BY_ID[toMovieId]) return null;

  // Nodes encoded as "m:<id>" or "a:<id>".
  const start = `m:${fromMovieId}`;
  const goal = `m:${toMovieId}`;
  const prev = new Map<string, string | null>();
  prev.set(start, null);

  const queue: string[] = [start];
  while (queue.length) {
    const node = queue.shift()!;
    if (node === goal) break;

    if (node.startsWith("m:")) {
      const movie = MOVIES_BY_ID[node.slice(2)];
      if (!movie) continue;
      for (const actorId of movie.cast) {
        const next = `a:${actorId}`;
        if (!prev.has(next)) {
          prev.set(next, node);
          queue.push(next);
        }
      }
    } else {
      const actorId = node.slice(2);
      for (const movieId of FILMOGRAPHY[actorId] || []) {
        const next = `m:${movieId}`;
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
      const m = MOVIES_BY_ID[nid.slice(2)]!;
      return { type: "movie", id: m.id, title: m.title, year: m.year };
    }
    const aid = nid.slice(2);
    return { type: "actor", id: aid, name: ACTORS_NAMES[aid] || aid };
  });
}

export function pickRandomMovie(exclude?: string): Movie {
  let m: Movie;
  do {
    m = MOVIES[Math.floor(Math.random() * MOVIES.length)];
  } while (exclude && m.id === exclude);
  return m;
}
