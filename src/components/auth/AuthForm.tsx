import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full glass">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Noesis · Study Co-pilot
            </span>
          </div>
          <h1 className="text-3xl font-light text-foreground">
            {mode === "signin" ? "Welcome back." : "Begin your path."}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin"
              ? "Sign in to sync your study plan."
              : "Create an account to track goals across devices."}
          </p>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Arjun"
                className="w-full bg-transparent border border-glass-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border border-glass-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent border border-glass-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition glow-primary"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to Noesis?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
