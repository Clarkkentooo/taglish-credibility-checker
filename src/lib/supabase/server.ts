import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === "your_supabase_url_here") {
    const cookieStore = await cookies();
    return {
      auth: {
        async getUser() {
          const loggedIn = cookieStore.get("tsektxt_logged_in")?.value === "true";
          if (loggedIn) {
            return {
              data: {
                user: {
                  id: "mock-user-id",
                  email: "testuser@gmail.com",
                  user_metadata: { full_name: "Demo reviewer" },
                },
              },
              error: null,
            };
          }
          return { data: { user: null }, error: null };
        },
        async signOut() {
          cookieStore.delete("tsektxt_logged_in");
          return { error: null };
        },
      },
    } as any;
  }

  const cookieStore = await cookies();
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
