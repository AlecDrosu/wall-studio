import express from "express";
import {
  listDesigns,
  createDesign,
  renameDesign,
  deleteDesign,
  importDesigns,
} from "./db.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT ?? 3001);

function isPosMap(v: unknown): v is Record<number, { x: number; y: number }> {
  if (!v || typeof v !== "object") return false;
  return Object.values(v).every(
    (p) =>
      p &&
      typeof p === "object" &&
      typeof (p as { x: unknown }).x === "number" &&
      typeof (p as { y: unknown }).y === "number"
  );
}

app.get("/api/designs", (_req, res) => {
  res.json(listDesigns());
});

app.post("/api/designs", (req, res) => {
  const { name, preset, pos } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || !isPosMap(pos)) {
    return res.status(400).json({ error: "name (string) and pos (PosMap) are required" });
  }
  res.status(201).json(createDesign({ name: name.trim(), preset: String(preset ?? ""), pos }));
});

app.put("/api/designs/:id", (req, res) => {
  const { name } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name (string) is required" });
  }
  const updated = renameDesign(req.params.id, name.trim());
  if (!updated) return res.status(404).json({ error: "not found" });
  res.json(updated);
});

app.delete("/api/designs/:id", (req, res) => {
  deleteDesign(req.params.id);
  res.status(204).end();
});

app.post("/api/designs/import", (req, res) => {
  const body = req.body;
  const list = Array.isArray(body) ? body : Array.isArray(body?.designs) ? body.designs : null;
  if (!list) return res.status(400).json({ error: "expected an array of designs" });
  const valid = list.filter(
    (d: unknown) =>
      d &&
      typeof d === "object" &&
      typeof (d as { name: unknown }).name === "string" &&
      isPosMap((d as { pos: unknown }).pos)
  );
  if (!valid.length) return res.status(400).json({ error: "no valid designs in payload" });
  res.status(201).json(importDesigns(valid));
});

app.listen(PORT, () => {
  console.log(`[wall-studio] API listening on http://localhost:${PORT}`);
});
