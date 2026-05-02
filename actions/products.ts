"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProducts(filters?: { category?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data, error: error?.message };
}

export async function createProductAction(data: any) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();
  return { data: product, error: error?.message };
}

export async function updateProductAction(id: string, data: any) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  return { data: product, error: error?.message };
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { success: !error, error: error?.message };
}
