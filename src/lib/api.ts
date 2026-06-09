import type { PosMap, SavedDesign } from "./types";

const BASE = "/api/designs";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchDesigns(): Promise<SavedDesign[]> {
  return json<SavedDesign[]>(await fetch(BASE));
}

export async function createDesign(input: {
  name: string;
  preset: string;
  pos: PosMap;
}): Promise<SavedDesign> {
  return json<SavedDesign>(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function renameDesign(id: string, name: string): Promise<SavedDesign> {
  return json<SavedDesign>(
    await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
}

export async function deleteDesign(id: string): Promise<void> {
  return json<void>(await fetch(`${BASE}/${id}`, { method: "DELETE" }));
}

export async function importDesigns(designs: SavedDesign[]): Promise<SavedDesign[]> {
  return json<SavedDesign[]>(
    await fetch(`${BASE}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(designs),
    })
  );
}
