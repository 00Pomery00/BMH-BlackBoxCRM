import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;

const projectRoot = path.resolve(__dirname, "..", "..");
const catalogDir = path.join(projectRoot, "catalog", "objects");
const mockDir = path.join(projectRoot, "backend", "mock");

app.use(express.json());

app.get("/api/objects", (req, res) => {
  try {
    if (!fs.existsSync(catalogDir)) return res.json([]);
    const files = fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"));
    const manifests = files.map((f) => JSON.parse(fs.readFileSync(path.join(catalogDir, f), "utf8")));
    res.json(manifests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/objects/:id", (req, res) => {
  const id = req.params.id;
  const file = path.join(catalogDir, `${id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "not found" });
  const content = JSON.parse(fs.readFileSync(file, "utf8"));
  res.json(content);
});

app.get("/api/mock/:id", (req, res) => {
  const id = req.params.id;
  const file = path.join(mockDir, `${id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "not found" });
  const content = JSON.parse(fs.readFileSync(file, "utf8"));
  res.json(content);
});

app.listen(port, () => {
  console.log(`CRM Blackbox backend running on http://localhost:${port}`);
});

export default app;
