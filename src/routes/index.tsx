import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/study/Header";
import { ScheduleList } from "@/components/study/ScheduleList";
import { SubjectsPanel } from "@/components/study/SubjectsPanel";
import { AnalyticsChart } from "@/components/study/AnalyticsChart";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { AICopilot } from "@/components/study/AICopilot";
import { Toaster } from "@/components/ui/sonner";
import { RewardPopup } from "@/components/study/RewardPopup";
import { ParticlesBackground } from "@/components/study/ParticlesBackground";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ParticlesBackground />
      <div className="min-h-dvh w-full px-4 sm:px-8 py-8 max-w-7xl mx-auto aurora-bg relative">
        <Header />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-4">
          <ScheduleList />
        </div>
        <div className="lg:col-span-5">
          <SubjectsPanel />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <AnalyticsChart />
          <PomodoroTimer />
        </div>
      </main>

      <section className="pb-10">
        <AICopilot />
      </section>

      <footer className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 py-6">
        Noesis · Smart Study Planner
      </footer>

        <Toaster />
        <RewardPopup />
      </div>
    </>
  );
}
