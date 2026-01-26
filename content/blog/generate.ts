import fs from "node:fs";
import path from "node:path";

const outputDir = path.join(process.cwd(), "content", "blog", "posts");
const date = new Date().toISOString().slice(0, 10);

const keywords = ["momentum", "breakout", "risk sizing", "regime"];
const content = `# Market methodology update (${date})

Keywords of the day: ${keywords.join(", ")}.

This post highlights how Horizon Services evaluates trend regimes and avoids
repainting by only acting on closed bars.
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${date}.md`), content);

console.log("Generated post", date);
