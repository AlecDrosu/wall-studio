import { useEffect, useRef, useState } from "react";
import * as api from "../lib/api";
import { FR, IDS } from "../lib/constants";
import { frac } from "../lib/geometry";
import type { PosMap, SavedDesign } from "../lib/types";

type Props = {
  pos: PosMap;
  preset: string;
  onLoad: (design: SavedDesign) => void;
};

/** Width × height of the bounding box of a saved arrangement, for the subtitle. */
function spanLabel(pos: PosMap): string {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  IDS.forEach((i) => {
    const p = pos[i];
    if (!p) return;
    const f = FR[i];
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + f.w);
    maxY = Math.max(maxY, p.y + f.h);
  });
  if (!isFinite(minX)) return "—";
  return `${frac(maxX - minX)}″ × ${frac(maxY - minY)}″`;
}

export function SavedDesignsPanel({ pos, preset, onLoad }: Props) {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setDesigns(await api.fetchDesigns());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the server");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave() {
    const nm = name.trim() || `Design ${designs.length + 1}`;
    try {
      const created = await api.createDesign({ name: nm, preset, pos });
      setDesigns((d) => [created, ...d]);
      setName("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteDesign(id);
      setDesigns((d) => d.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function startRename(d: SavedDesign) {
    setEditingId(d.id);
    setEditName(d.name);
  }

  async function commitRename() {
    if (!editingId) return;
    const nm = editName.trim();
    if (nm) {
      try {
        const updated = await api.renameDesign(editingId, nm);
        setDesigns((d) => d.map((x) => (x.id === updated.id ? updated : x)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rename failed");
      }
    }
    setEditingId(null);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(designs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wall-studio-designs.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : parsed?.designs;
      if (!Array.isArray(list)) throw new Error("File is not a designs array");
      await api.importDesigns(list);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  }

  return (
    <div className="panel">
      <h2>Saved designs</h2>
      <p className="hint">Snapshot the current layout to a SQLite database to compare options later.</p>

      <div className="saverow">
        <input
          type="text"
          placeholder={`Design ${designs.length + 1}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button className="btn" onClick={handleSave}>
          Save
        </button>
      </div>

      {error && (
        <div className="warn" style={{ marginBottom: 12 }}>
          ⚠ <span>{error}</span>
        </div>
      )}

      {designs.length === 0 ? (
        <div className="save-empty">No saved designs yet.</div>
      ) : (
        <div className="saves">
          {designs.map((d) => (
            <div className="save-item" key={d.id}>
              <div className="meta">
                {editingId === d.id ? (
                  <input
                    className="nm-edit"
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="nm">{d.name}</div>
                    <div className="sub">
                      {spanLabel(d.pos)}
                      {d.preset ? ` · ${d.preset}` : ""}
                    </div>
                  </>
                )}
              </div>
              <button className="btn ghost iconbtn" title="Load" onClick={() => onLoad(d)}>
                ↧
              </button>
              <button className="btn ghost iconbtn" title="Rename" onClick={() => startRename(d)}>
                ✎
              </button>
              <button className="btn ghost iconbtn" title="Delete" onClick={() => handleDelete(d.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="save-tools">
        <button className="btn ghost" onClick={handleExport} disabled={designs.length === 0}>
          ⭳ Export
        </button>
        <button className="btn ghost" onClick={() => fileInput.current?.click()}>
          ⭱ Import
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </div>
    </div>
  );
}
