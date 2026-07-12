import { AuthPage } from "@/components/auth/AuthPage";

export default function SignInPage() {
  return (
    <AuthPage
      title="Sign in"
      description="Authentication is mocked for this frontend milestone. Use any email and password to enter the demo dashboard."
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
      submitLabel="Continue to demo dashboard"
      footerText="New here?"
      footerHref="/sign-up"
      footerLinkLabel="Create a demo account"
    />
  );
}
