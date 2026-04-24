import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return client;
}
