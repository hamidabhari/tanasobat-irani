import { cp, mkdir, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("index.html", "dist/index.html");
await cp("drawing", "dist/drawing", { recursive: true });
await cp("foundations", "dist/foundations", { recursive: true });
for (const folder of ["shared", "margins", "karbandi", "assets"]) {
  await cp(folder, `dist/${folder}`, { recursive: true });
}
await writeFile("dist/.nojekyll", "");
