"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, InputHTMLAttributes } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { isDemoCredentials, setSessionMode } from "@/lib/session";

type AuthField = {
  label: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
};

type AuthPageProps = {
  title: string;
  description: string;
  describedBy: string;
  googleLabel: string;
  fields: AuthField[];
  submitLabel: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
};

const inputClassName =
  "auth-input mt-2 min-h-12 w-full rounded-full border border-border/90 bg-white px-5 text-base text-ink shadow-sm transition duration-200 ease-out placeholder:text-muted/55 hover:border-muted/45 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15";

export function AuthPage({
  title,
  description,
  describedBy,
  googleLabel,
  fields,
  submitLabel,
  footerText,
  footerHref,
  footerLinkLabel,
}: AuthPageProps) {
  const router = useRouter();

  function continueAsUser() {
    setSessionMode("user");
    router.push("/dashboard");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setSessionMode(isDemoCredentials(email, password) ? "demo" : "user");
    router.push("/dashboard");
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-surface text-ink">
      <AuthIllustration />
      <div className="relative z-10 grid h-[100dvh] grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(23rem,0.95fr)]">
        <div aria-hidden="true" className="hidden lg:block" />
        <section className="auth-panel flex h-[100dvh] items-center justify-center px-5 py-4 sm:px-8 lg:justify-start lg:px-7 xl:px-12 2xl:px-16">
          <div className="auth-card-enter w-full max-w-[29.5rem] rounded-[1.75rem] border border-border/55 bg-white/95 p-6 shadow-[0_24px_80px_rgb(20_18_35_/_0.07)] backdrop-blur sm:p-8 lg:p-9">
            <BrandLogo />
            <h1 className="auth-title mt-8 text-[2.45rem] font-black leading-none md:text-[2.75rem]">{title}</h1>
            <p id={describedBy} className="auth-description mt-4 max-w-[24rem] text-base leading-6 text-muted">
              {description}
            </p>

            <Button type="button" variant="secondary" className="auth-google-button mt-7 w-full gap-3 border-border/65 bg-white text-base shadow-sm hover:border-muted/35" onClick={continueAsUser}>
              <Image src="/google-icon-logo.svg" alt="" width={20} height={20} aria-hidden="true" className="h-5 w-5" />
              {googleLabel}
            </Button>

            <AuthDivider />

            <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-5" aria-describedby={describedBy}>
              {fields.map((field) => (
                <label key={field.name} className="auth-field block text-base font-semibold text-ink">
                  {field.label}
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type ?? "text"}
                    autoComplete={field.autoComplete}
                    className={inputClassName}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <Button type="submit" className="auth-submit min-h-12 w-full px-4 text-base">
                {submitLabel}
              </Button>
            </form>

            <p className="auth-footer mt-6 text-base text-muted">
              {footerText}{" "}
              <Link href={footerHref} className="font-semibold text-primary underline-offset-4 transition hover:text-ink hover:underline">
                {footerLinkLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthDivider() {
  return (
    <div className="auth-divider my-7 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
      <span className="h-px flex-1 bg-border" />
      <span>Or use email</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function AuthIllustration() {
  return (
    <div aria-hidden="true" className="auth-illustration-enter pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/caps-illus/signin-illustration.svg"
        alt=""
        width={938}
        height={1132}
        priority
        className="absolute left-1/2 top-[43%] h-auto w-[54rem] max-w-none -translate-x-1/2 sm:top-[45%] sm:w-[64rem] md:top-[50%] md:w-[70rem] lg:left-[22%] lg:top-1/2 lg:w-[65vw] lg:-translate-y-1/2 xl:left-[23%] xl:w-[68vw] 2xl:left-[21%] 2xl:w-[71vw]"
        sizes="(min-width: 1024px) 68vw, 64rem"
      />
    </div>
  );
}
