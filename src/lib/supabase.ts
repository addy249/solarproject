import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type LeadInsert = {
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  state: string;
  home_type: string;
  services: string[];
  owns_home: boolean;
  bill_range: string;
  timeframe: string;
  notes: string;
  estimated_rebate_focus: string;
};

const localKey = "green-grid-energy-leads";

export async function saveLead(lead: LeadInsert) {
  if (supabase) {
    const { error } = await supabase.from("leads").insert(lead);
    if (error) throw error;
    return { mode: "supabase" as const };
  }

  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  localStorage.setItem(
    localKey,
    JSON.stringify([{ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...lead }, ...existing]),
  );
  return { mode: "local" as const };
}

export async function getLocalLeads() {
  return JSON.parse(localStorage.getItem(localKey) || "[]");
}
