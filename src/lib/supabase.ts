import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const meetingInviteFunctionName =
  (import.meta.env.VITE_MEETING_INVITE_FUNCTION as string | undefined) || "send-meeting-invite";

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

export type LeadRecord = LeadInsert & {
  id: string;
  created_at?: string;
  status?: string;
  meeting_requests?: MeetingRequestRecord[];
};

export type MeetingRequestRecord = {
  id: string;
  lead_id: string;
  booking_url: string;
  email_status: "pending" | "sent" | "failed" | "pending_config";
  email_error?: string | null;
  sent_at?: string | null;
  created_at?: string;
};

export type ProductCategoryRecord = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  typical_incentive_note: string;
  created_at?: string;
};

const localKey = "green-grid-energy-leads";

export async function getProductCategories() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("product_categories")
    .select("id, slug, name, description, typical_incentive_note, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as ProductCategoryRecord[];
}

export async function saveLead(lead: LeadInsert) {
  const leadId = crypto.randomUUID();

  if (supabase) {
    const { error } = await supabase.from("leads").insert({ id: leadId, ...lead });
    if (error) throw error;

    const { data: inviteData, error: inviteError } = await supabase.functions.invoke(meetingInviteFunctionName, {
      body: { leadId },
    });

    return {
      mode: "supabase" as const,
      leadId,
      inviteStatus: inviteError ? "failed" : (inviteData?.emailStatus as string | undefined),
      inviteError: inviteError?.message,
    };
  }

  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  const bookingUrl = import.meta.env.VITE_BOOKING_URL || "Add VITE_BOOKING_URL to send a real booking link";
  localStorage.setItem(
    localKey,
    JSON.stringify([
      {
        id: leadId,
        created_at: new Date().toISOString(),
        meeting_requests: [
          {
            id: crypto.randomUUID(),
            lead_id: leadId,
            booking_url: bookingUrl,
            email_status: "pending_config",
            created_at: new Date().toISOString(),
          },
        ],
        ...lead,
      },
      ...existing,
    ]),
  );
  return { mode: "local" as const, leadId, inviteStatus: "pending_config" };
}

export async function getLocalLeads() {
  return JSON.parse(localStorage.getItem(localKey) || "[]");
}
