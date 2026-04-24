import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Use dummy values if missing during build/init to prevent crash
  const safeUrl = supabaseUrl && supabaseUrl !== "undefined" ? supabaseUrl : "https://placeholder.supabase.co";
  const safeKey = supabaseKey && supabaseKey !== "undefined" ? supabaseKey : "placeholder";

  if (typeof window === "undefined") {
    return createBrowserClient(safeUrl, safeKey);
  }

  if (!client) {
    client = createBrowserClient(safeUrl, safeKey);
  }

  return client;
}
