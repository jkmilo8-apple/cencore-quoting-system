"use server";

import { createClient } from "@/lib/supabase/server";

export async function getClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  return { data, error: error?.message };
}

export async function createClientAction(data: any) {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .insert(data)
    .select()
    .single();
  return { data: client, error: error?.message };
}
