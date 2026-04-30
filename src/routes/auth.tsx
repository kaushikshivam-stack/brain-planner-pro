import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/AuthForm";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Noesis Study Planner" },
      { name: "description", content: "Sign in or create an account to sync your study planner across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <>
      <AuthForm />
      <Toaster />
    </>
  );
}
