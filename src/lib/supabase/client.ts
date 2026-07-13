import { createBrowserClient } from "@supabase/ssr";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;
type MockSignUpOptions = { data?: { full_name?: string } };

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === "your_supabase_url_here") {
    // Return a mocked client when Supabase is not configured
    return {
      auth: {
        async getUser() {
          const loggedIn = typeof window !== "undefined" && localStorage.getItem("tsektxt_logged_in") === "true";
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
        async signUp({ email, options }: { email: string; password?: string; options?: MockSignUpOptions }) {
          if (typeof window !== "undefined") {
            localStorage.setItem("tsektxt_logged_in", "true");
            localStorage.setItem(
              "tsektxt_user",
              JSON.stringify({ email, full_name: options?.data?.full_name || "Demo reviewer" })
            );
            document.cookie = "tsektxt_logged_in=true; path=/";
          }
          return { data: { user: { id: "mock-user-id", email } }, error: null };
        },
        async signInWithPassword({ email }: { email: string; password?: string }) {
          if (typeof window !== "undefined") {
            localStorage.setItem("tsektxt_logged_in", "true");
            localStorage.setItem("tsektxt_user", JSON.stringify({ email, full_name: "Demo reviewer" }));
            document.cookie = "tsektxt_logged_in=true; path=/";
          }
          return { data: { user: { id: "mock-user-id", email } }, error: null };
        },
        async signOut() {
          if (typeof window !== "undefined") {
            localStorage.removeItem("tsektxt_logged_in");
            localStorage.removeItem("tsektxt_user");
            document.cookie = "tsektxt_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          }
          return { error: null };
        },
      },
    } as unknown as BrowserSupabaseClient;
  }

  return createBrowserClient(url, anonKey);
}
