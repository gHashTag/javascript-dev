import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const client = (req: any) => {
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(
    SUPABASE_URL ?? "",
    SUPABASE_ANON_KEY ??
      "",
    { global: { headers: { Authorization: authHeader } } },
  );
  return supabaseClient;
};
