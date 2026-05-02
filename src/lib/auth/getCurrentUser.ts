import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
};

// Single helper used by every page (via Navbar) to resolve the visitor's
// auth + role + display name. Cached implicitly per request because Next
// dedupes the supabase server client + getUser() within a single render.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    fullName: (profile?.full_name as string | null) ?? null,
    isAdmin: profile?.role === "admin",
  };
}
