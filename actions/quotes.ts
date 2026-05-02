"use server";

import { createClient } from "@/lib/supabase/server";

export async function getQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      clients (*)
    `)
    .order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getQuote(id: string) {
  const supabase = await createClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select(`
      *,
      clients (*)
    `)
    .eq("id", id)
    .single();

  if (quoteError) return { error: quoteError.message };

  const { data: items, error: itemsError } = await supabase
    .from("quote_items")
    .select(`
      *,
      products (*)
    `)
    .eq("quote_id", id);

  return { data: { ...quote, items }, error: itemsError?.message };
}

export async function createQuoteAction(data: any) {
  const supabase = await createClient();
  
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      client_id: data.client_id,
      total_amount: data.total_amount,
      notes: data.notes,
      urgent_delivery: data.urgent_delivery,
      status: "pending"
    })
    .select()
    .single();

  if (quoteError) return { error: quoteError.message };

  const itemsWithQuoteId = data.items.map((item: any) => ({
    ...item,
    quote_id: quote.id
  }));

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(itemsWithQuoteId);

  return { data: quote, error: itemsError?.message };
}
