import { supabase } from "../integrations/supabase/client";
import type { TrainingDrill } from "./types";

export interface SavedDrill {
  id: string;
  name: string;
  drill: TrainingDrill;
  parSeconds?: number;
  createdAt: string;
}

function fromRow(row: {
  id: string;
  name: string;
  drill: unknown;
  par_seconds: number | null;
  created_at: string;
}): SavedDrill {
  return {
    id: row.id,
    name: row.name,
    drill: row.drill as TrainingDrill,
    parSeconds: row.par_seconds ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listSavedDrills(userId: string): Promise<SavedDrill[]> {
  const { data, error } = await supabase
    .from("saved_drills")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load saved drills", error);
    return [];
  }
  return data.map(fromRow);
}

export async function saveDrill(
  userId: string,
  name: string,
  drill: TrainingDrill,
): Promise<SavedDrill | null> {
  const { data, error } = await supabase
    .from("saved_drills")
    .upsert(
      {
        user_id: userId,
        name: name.trim(),
        name_normalized: name.trim().toLowerCase(),
        drill,
        par_seconds: drill.parSeconds ?? null,
      },
      { onConflict: "user_id,name_normalized" },
    )
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to save drill", error);
    return null;
  }
  return fromRow(data);
}

export async function deleteSavedDrill(id: string): Promise<boolean> {
  const { error } = await supabase.from("saved_drills").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete saved drill", error);
    return false;
  }
  return true;
}
