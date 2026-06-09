import Database from "better-sqlite3";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type DesignRow = {
  id: string;
  name: string;
  created_at: number;
  preset: string;
  pos: string; // JSON-encoded PosMap
};

export type Design = {
  id: string;
  name: string;
  createdAt: number;
  preset: string;
  pos: Record<number, { x: number; y: number }>;
};

const DB_PATH = path.join(process.cwd(), "wall-studio.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS designs (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    preset     TEXT NOT NULL DEFAULT '',
    pos        TEXT NOT NULL
  );
`);

function rowToDesign(r: DesignRow): Design {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    preset: r.preset,
    pos: JSON.parse(r.pos),
  };
}

const stmtList = db.prepare("SELECT * FROM designs ORDER BY created_at DESC");
const stmtGet = db.prepare("SELECT * FROM designs WHERE id = ?");
const stmtInsert = db.prepare(
  "INSERT INTO designs (id, name, created_at, preset, pos) VALUES (@id, @name, @created_at, @preset, @pos)"
);
const stmtRename = db.prepare("UPDATE designs SET name = ? WHERE id = ?");
const stmtDelete = db.prepare("DELETE FROM designs WHERE id = ?");

export function listDesigns(): Design[] {
  return (stmtList.all() as DesignRow[]).map(rowToDesign);
}

export function createDesign(input: {
  name: string;
  preset: string;
  pos: Record<number, { x: number; y: number }>;
}): Design {
  const row: DesignRow = {
    id: randomUUID(),
    name: input.name,
    created_at: Date.now(),
    preset: input.preset ?? "",
    pos: JSON.stringify(input.pos),
  };
  stmtInsert.run(row);
  return rowToDesign(row);
}

export function renameDesign(id: string, name: string): Design | null {
  stmtRename.run(name, id);
  const r = stmtGet.get(id) as DesignRow | undefined;
  return r ? rowToDesign(r) : null;
}

export function deleteDesign(id: string): void {
  stmtDelete.run(id);
}

/** Bulk import — inserts each design with a fresh id so collisions can't occur. */
export function importDesigns(
  designs: Array<{
    name: string;
    preset?: string;
    pos: Record<number, { x: number; y: number }>;
    createdAt?: number;
  }>
): Design[] {
  const insert = db.transaction((items: typeof designs) => {
    const out: Design[] = [];
    for (const d of items) {
      const row: DesignRow = {
        id: randomUUID(),
        name: d.name,
        created_at: typeof d.createdAt === "number" ? d.createdAt : Date.now(),
        preset: d.preset ?? "",
        pos: JSON.stringify(d.pos),
      };
      stmtInsert.run(row);
      out.push(rowToDesign(row));
    }
    return out;
  });
  return insert(designs);
}
