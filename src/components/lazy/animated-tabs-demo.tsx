"use client";

import { type FormEvent } from "react";

import { AnimatedTabs, type AnimateMode } from "@/components/lazy-ui/animated-tabs";

type Props = {
  className?: string;
  animate?: AnimateMode;
};

export function AnimatedTabsDemo({ className, animate }: Props) {
  return (
    <AnimatedTabs
      animate={animate}
      className={className}
      tabs={[
        { value: "login", label: "Login", content: <LoginForm /> },
        { value: "signup", label: "Signup", content: <SignupForm /> },
      ]}
    />
  );
}

function noop(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

function LoginForm() {
  return (
    <form onSubmit={noop} className="space-y-3 p-5">
      <Field label="Email" type="email" placeholder="you@example.com" />
      <Field label="Password" type="password" placeholder="••••••••" />
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

function SignupForm() {
  return (
    <form onSubmit={noop} className="space-y-3 p-5">
      <Field label="Name" type="text" placeholder="Jane Doe" />
      <Field label="Email" type="email" placeholder="you@example.com" />
      <Field label="Password" type="password" placeholder="At least 8 chars" />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: "email" | "password" | "text";
  placeholder: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-[11px] text-neutral-200 placeholder:text-neutral-600 focus:border-white/20 focus:outline-none"
      />
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-md bg-white py-2 text-[11px] font-medium text-black transition hover:bg-neutral-200"
    >
      {children}
    </button>
  );
}
