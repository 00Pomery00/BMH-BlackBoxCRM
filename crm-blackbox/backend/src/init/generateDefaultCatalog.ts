import fs from "fs";
import path from "path";
import { manifestSchema } from "./manifestSchema";

const root = path.resolve(__dirname, "..", "..", "..");
const catalogDir = path.join(root, "catalog", "objects");
const mockDir = path.join(root, "backend", "mock");

const defaultObjects = [
  "users",
  "roles",
  "dashboard",
  "customers",
  "contacts",
  "deals",
  "activities",
  "tasks",
  "notes",
  "files",
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, { encoding: "utf8" });
    console.log(`Created ${filePath}`);
    return true;
  }
  return false;
}

function manifestFor(id: string) {
  return {
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    icon: "Objects",
    defaultView: "table",
    allowedWidgets: ["list", "kanban", "stats", "custom"],
    fields: [
      { id: "name", type: "string", label: "Name" },
      { id: "createdAt", type: "datetime", label: "Created At" },
    ],
  };
}

function mockFor(id: string) {
  const samples = [] as any[];
  for (let i = 1; i <= 5; i++) {
    samples.push({ id: `${id}-${i}`, name: `${id} sample ${i}`, createdAt: new Date().toISOString() });
  }
  return samples;
}

function main() {
  ensureDir(catalogDir);
  ensureDir(mockDir);

  let created = 0;
  for (const id of defaultObjects) {
    const manifestPath = path.join(catalogDir, `${id}.json`);
    const mockPath = path.join(mockDir, `${id}.json`);

    const generated = manifestFor(id);
    const m = JSON.stringify(generated, null, 2);
    const mo = JSON.stringify(mockFor(id), null, 2);

    // If manifest exists, validate it; backup & replace if invalid
    if (fs.existsSync(manifestPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        const parsed = manifestSchema.safeParse(content);
        if (!parsed.success) {
          const bak = manifestPath + ".invalid.bak";
          fs.copyFileSync(manifestPath, bak);
          fs.writeFileSync(manifestPath, m, { encoding: "utf8" });
          console.log(`Replaced invalid manifest ${manifestPath}, backup -> ${bak}`);
          created++;
        }
      } catch (err) {
        const bak = manifestPath + ".error.bak";
        fs.copyFileSync(manifestPath, bak);
        fs.writeFileSync(manifestPath, m, { encoding: "utf8" });
        console.log(`Error reading manifest ${manifestPath}, replaced and backup -> ${bak}`);
        created++;
      }
    } else {
      if (writeIfMissing(manifestPath, m)) created++;
    }

    if (writeIfMissing(mockPath, mo)) created++;
  }

  if (created === 0) {
    console.log("Default catalog appears to be already generated.");
  } else {
    console.log(`Default catalog generation finished. New files: ${created}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error generating default catalog:", err);
    process.exit(1);
  }
}

export default main;
