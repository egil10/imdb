#!/usr/bin/env node
// Build a curated JSON dataset of popular films + cast from the IMDb non-commercial
// datasets (datasets.imdbws.com).
//
// Filter: titleType=movie, numVotes >= MIN_VOTES, ranked by vote count, top
// MAX_MOVIES kept. Cast = up to MAX_CAST actors/actresses by ordering.
//
// Output: data/imdb.json — { movies: [...], actors: [...] }.

import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import readline from "node:readline";
import { resolve } from "node:path";

const MIN_VOTES = 25_000;
const MAX_MOVIES = 6000;
const MAX_CAST = 10;

const FILES = {
  ratings: "https://datasets.imdbws.com/title.ratings.tsv.gz",
  basics: "https://datasets.imdbws.com/title.basics.tsv.gz",
  principals: "https://datasets.imdbws.com/title.principals.tsv.gz",
  names: "https://datasets.imdbws.com/name.basics.tsv.gz",
};

const CACHE = resolve("./.cache");
mkdirSync(CACHE, { recursive: true });

const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const human = (n) => (n / 1024 / 1024).toFixed(1) + " MB";

async function download(url, path) {
  if (existsSync(path) && statSync(path).size > 1000) {
    log(`cached ${path} (${human(statSync(path).size)})`);
    return;
  }
  log(`fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(path));
  log(`saved ${path} (${human(statSync(path).size)})`);
}

async function* streamTsvGz(path) {
  const stream = createReadStream(path).pipe(createGunzip());
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let header = null;
  for await (const line of rl) {
    const cols = line.split("\t");
    if (!header) {
      header = cols;
      continue;
    }
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = cols[i];
    yield row;
  }
}

// 0. download all
const paths = {
  ratings: resolve(CACHE, "ratings.tsv.gz"),
  basics: resolve(CACHE, "basics.tsv.gz"),
  principals: resolve(CACHE, "principals.tsv.gz"),
  names: resolve(CACHE, "names.tsv.gz"),
};
log("step 0: download");
await download(FILES.ratings, paths.ratings);
await download(FILES.basics, paths.basics);
await download(FILES.names, paths.names);
await download(FILES.principals, paths.principals);

// 1. ratings: keep titles with >= MIN_VOTES
log(`step 1: ratings (votes >= ${MIN_VOTES.toLocaleString()})`);
/** @type {Map<string, { rating: number, votes: number }>} */
const ratings = new Map();
let nRatings = 0;
for await (const r of streamTsvGz(paths.ratings)) {
  nRatings++;
  const votes = parseInt(r.numVotes, 10);
  if (!Number.isFinite(votes) || votes < MIN_VOTES) continue;
  ratings.set(r.tconst, { rating: parseFloat(r.averageRating), votes });
}
log(`  scanned ${nRatings.toLocaleString()}, kept ${ratings.size.toLocaleString()}`);

// 2. basics: keep movie titles among the rated set
log("step 2: basics (titleType=movie)");
/** @type {Map<string, { title: string, year: number, runtime: number, genres: string }>} */
const titles = new Map();
let nBasics = 0;
for await (const t of streamTsvGz(paths.basics)) {
  nBasics++;
  if (t.titleType !== "movie") continue;
  if (!ratings.has(t.tconst)) continue;
  titles.set(t.tconst, {
    title: t.primaryTitle,
    year: parseInt(t.startYear, 10) || 0,
    runtime: parseInt(t.runtimeMinutes, 10) || 0,
    genres: t.genres === "\\N" ? "" : t.genres,
  });
}
log(`  scanned ${nBasics.toLocaleString()}, kept ${titles.size.toLocaleString()}`);

// 3. pick top MAX_MOVIES by votes
const topTconsts = [...titles.keys()]
  .sort((a, b) => ratings.get(b).votes - ratings.get(a).votes)
  .slice(0, MAX_MOVIES);
const topSet = new Set(topTconsts);
log(`step 3: kept top ${topSet.size.toLocaleString()} movies`);

// 4. principals: top actors/actresses for each kept title
log("step 4: principals (actor/actress)");
/** @type {Map<string, Array<{ nconst: string, ordering: number }>>} */
const titleCast = new Map();
let nPrincipals = 0;
let kept = 0;
for await (const p of streamTsvGz(paths.principals)) {
  nPrincipals++;
  if (!topSet.has(p.tconst)) continue;
  if (p.category !== "actor" && p.category !== "actress") continue;
  const ord = parseInt(p.ordering, 10);
  if (!Number.isFinite(ord) || ord > 12) continue;
  let arr = titleCast.get(p.tconst);
  if (!arr) titleCast.set(p.tconst, (arr = []));
  arr.push({ nconst: p.nconst, ordering: ord });
  kept++;
  if (nPrincipals % 5_000_000 === 0) log(`  ${nPrincipals.toLocaleString()} rows seen…`);
}
log(`  scanned ${nPrincipals.toLocaleString()}, kept ${kept.toLocaleString()} cast rows`);

// collect needed nconsts
const neededNames = new Set();
for (const [, cast] of titleCast) for (const c of cast) neededNames.add(c.nconst);
log(`  ${neededNames.size.toLocaleString()} unique actor IDs`);

// 5. names
log("step 5: names");
/** @type {Map<string, string>} */
const names = new Map();
let nNames = 0;
for await (const n of streamTsvGz(paths.names)) {
  nNames++;
  if (!neededNames.has(n.nconst)) continue;
  names.set(n.nconst, n.primaryName);
}
log(`  scanned ${nNames.toLocaleString()}, kept ${names.size.toLocaleString()}`);

// 6. assemble output
log("step 6: assembling output");
const movies = topTconsts.map((tc) => {
  const t = titles.get(tc);
  const cast = (titleCast.get(tc) || [])
    .sort((a, b) => a.ordering - b.ordering)
    .slice(0, MAX_CAST)
    .map((c) => c.nconst);
  return {
    id: tc,
    title: t.title,
    year: t.year,
    rating: ratings.get(tc).rating,
    votes: ratings.get(tc).votes,
    genres: t.genres,
    cast,
  };
});

// only keep actors that appear in at least one final movie's cast
const usedActorIds = new Set();
for (const m of movies) for (const c of m.cast) usedActorIds.add(c);

const actors = [...usedActorIds]
  .map((id) => ({ id, name: names.get(id) || id }))
  .sort((a, b) => a.name.localeCompare(b.name));

const out = {
  generatedAt: new Date().toISOString(),
  source: "IMDb non-commercial datasets (datasets.imdbws.com)",
  filter: { minVotes: MIN_VOTES, maxMovies: MAX_MOVIES, maxCast: MAX_CAST },
  movies,
  actors,
};

const outPath = resolve("./data/imdb.json");
writeFileSync(outPath, JSON.stringify(out));
const sz = statSync(outPath).size;
log(`wrote ${outPath} (${human(sz)})`);
log(`movies: ${movies.length.toLocaleString()}, actors: ${actors.length.toLocaleString()}`);
