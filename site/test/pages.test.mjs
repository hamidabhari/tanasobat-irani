import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains the self-contained site", async () => {
  await access("dist/.nojekyll");

  const html = await readFile("dist/index.html", "utf8");
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<title>Iranian Ratios Bilingual<\/title>/);
  assert.match(html, /<iframe\b/);
  assert.doesNotMatch(html, /(?:api[_-]?key|secret|password)\s*[:=]\s*["'][^"']+/i);
});
