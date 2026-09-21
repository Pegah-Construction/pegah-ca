// Strips the trailing image field from each line of the `servicesList` setting,
// so each service card falls back to the bundled photo in public/services.
// Mirrors looksLikeImage / parseServiceLine in lib/settings.ts.
const fs = require("fs");
const path = require("path");
// The script lives in the scratchpad, so resolve the client from the project.
const { createRequire } = require("module");
const projectRequire = createRequire(path.join(process.cwd(), "package.json"));
const { PrismaClient } = projectRequire("@prisma/client");

const APPLY = process.argv.includes("--apply");
const BACKUP = process.argv[process.argv.indexOf("--backup") + 1];

const looksLikeImage = (s) =>
  /^(https?:\/\/|\/|uploads\/)/i.test(s) || /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(s);

const stripImage = (line) => {
  const parts = line.split("|").map((p) => p.trim());
  const rest = parts.slice(1);
  const last = rest[rest.length - 1] ?? "";
  if (rest.length >= 2 && looksLikeImage(last)) {
    return [parts[0], ...rest.slice(0, -1)].join(" | ");
  }
  return line.trim();
};

(async () => {
  const db = new PrismaClient({ log: ["error"] });
  try {
    const row = await db.setting.findUnique({ where: { key: "servicesList" } });
    if (!row) {
      console.log("no servicesList row in the DB — cards are on the code defaults, nothing to clear");
      return;
    }

    if (BACKUP) {
      fs.writeFileSync(BACKUP, row.value, "utf8");
      console.log(`backed up current value -> ${path.resolve(BACKUP)}`);
    }

    const before = row.value;
    const after = before
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map(stripImage)
      .join("\n");

    console.log("\n--- BEFORE ---\n" + before);
    console.log("\n--- AFTER ---\n" + after);

    if (before === after) {
      console.log("\nno image fields found — nothing to change");
      return;
    }
    if (!APPLY) {
      console.log("\ndry run — re-run with --apply to write");
      return;
    }

    await db.setting.update({ where: { key: "servicesList" }, data: { value: after } });
    const check = await db.setting.findUnique({ where: { key: "servicesList" } });
    console.log("\nwritten. verified value matches:", check.value === after);
  } finally {
    await db.$disconnect();
  }
})();
