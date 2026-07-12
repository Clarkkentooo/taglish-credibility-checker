import { AuthPage } from "@/components/auth/AuthPage";

export default function SignUpPage() {
  return (
    <AuthPage
      title="Create an account"
      description="Account creation is mocked for this milestone. Continue to a local browser session without seeded demo data."
      describedBy="signup-demo-note"
      googleLabel="Sign up with Google"
      fields={[
        {
          label: "Name",
          name: "name",
          autoComplete: "name",
          placeholder: "Demo reviewer",
        },
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
          autoComplete: "new-password",
          placeholder: "Any password",
        },
      ]}
      submitLabel="Start demo"
      footerText="Already have an account?"
      footerHref="/sign-in"
      footerLinkLabel="Sign in"
    />
  );
}
