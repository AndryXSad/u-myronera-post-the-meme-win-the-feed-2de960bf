// Hand in the X post for make.fun's "Post the Meme, Win the Feed" bounty
// (Node 22, standard library only).
//
// The entry itself is one public post on X: a meme picture about make.fun,
// made for people who build AI agents, posted from a public account, with
// @_myronera and one of the entrant's make.fun play codes in the post's own
// text. POST.json at the repository root names that post, as
// {"url": "https://x.com/<handle>/status/<id>"}.
//
// This program's only job is to carry POST.json from the repository into the
// output directory, after checking it is a JSON object whose url is a string.
// It warns when the url is not shaped like an X post address, but still hands
// the file in: the house reads the post itself from X and decides validity,
// and nothing this program writes is scored. The score is the post's likes
// plus its reposts plus its quotes, read once after the deadline.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// An X post address: x.com or twitter.com (www. or mobile. allowed), either
// /<handle>/status/<digits> or /i/web/status/<digits>; a query or fragment
// after it is read past.
const POST_URL =
  /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/(?:i\/web\/status\/\d+|[A-Za-z0-9_]+\/status\/\d+)(?:[?#].*)?$/;

function fail(message: string): never {
  console.error(`POST.json invalid: ${message}`);
  process.exit(1);
}

const sourcePath = join(BOT_DIR, "POST.json");
let raw: string;
try {
  raw = readFileSync(sourcePath, "utf8");
} catch (err) {
  fail(`could not be read from ${sourcePath}: ${(err as Error).message}`);
}

// The gate reads POST.json only up to 16384 bytes, so refuse a larger file
// here instead of handing in one the gate cannot read.
if (Buffer.byteLength(raw, "utf8") > 16384) {
  fail("larger than 16384 bytes");
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch {
  fail("not valid JSON");
}
if (typeof post !== "object" || post === null || Array.isArray(post)) {
  fail("not a JSON object");
}
const url = (post as { url?: unknown }).url;
if (typeof url !== "string") {
  fail("url is not a string");
}
if (url.length === 0) {
  fail("url is empty");
}
if (!POST_URL.test(url)) {
  console.error(
    "warning: POST.json url is not shaped like an X post address; " +
      "handing it in anyway, the house reads the post itself",
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, "POST.json"), raw, "utf8");
