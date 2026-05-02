"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCommercialConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commercial_config")
    .select("*");
  return { data, error: error?.message };
}

export async function updateCommercialConfig(updates: { key: string; value: string }[]) {
  const supabase = await createClient();
  
  // Update one by one or using upsert if supported/needed
  for (const update of updates) {
    const { error } = await supabase
      .from("commercial_config")
      .upsert(update, { onConflict: "key" });
    
    if (error) return { error: error.message };
  }

  return { success: true };
}
