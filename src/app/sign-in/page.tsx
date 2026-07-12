import { AuthPage } from "@/components/auth/AuthPage";

export default function SignInPage() {
  return (
    <AuthPage
      title="Sign in"
      description="Authentication is mocked for this milestone. Use demo@tsek.local / demo123 to open seeded demo data, or any other email to use your local session."
      describedBy="auth-demo-note"
      googleLabel="Sign in with Google"
      fields={[
        {
          label: "Email",
          name: "email",
          type: "email",
          autoComplete: "email",
          placeholder: "demo@tsek.local",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          autoComplete: "current-password",
          placeholder: "Any password",
        },
      ]}
      submitLabel="Continue"
      footerText="New here?"
      footerHref="/sign-up"
      footerLinkLabel="Create a demo account"
    />
  );
}
