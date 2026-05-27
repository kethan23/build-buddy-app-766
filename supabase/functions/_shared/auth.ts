import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireUser(req: Request) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return { user: null, error: "Missing authorization header" };
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, error: "Unauthorized" };
  return { user: data.user, error: null };
}
