import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Rocket, BookType, CalendarClock, Timer, Bot, Trophy } from "lucide-react";

export function UserGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="size-10 rounded-xl glass flex items-center justify-center text-primary hover:text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
          aria-label="User Guide"
          title="User Guide"
        >
          <BookOpen className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-primary/20">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-light text-foreground flex items-center gap-2">
            <BookOpen className="text-primary size-6" /> Neosis User Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to use your new AI-powered brain planner.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6 h-[calc(85vh-100px)]">
          <div className="space-y-8 pr-4">
            
            {/* Getting Started */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <Rocket className="size-5" /> 1. Getting Started
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to <strong>Neosis</strong>, your futuristic, AI-powered study companion. The Dashboard is your command center. Here you will find your Subjects, your Schedule, the Pomodoro Timer, your progress Analytics, and the Gemini AI Co-pilot.
              </p>
            </section>

            {/* Setting Up Subjects */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-accent flex items-center gap-2">
                <BookType className="size-5" /> 2. Setting Up Your Subjects
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Navigate to the <strong>Subjects Panel</strong>.</li>
                <li>Click the <strong>Add Subject</strong> button.</li>
                <li>Set your <strong>Goal Hours</strong> for the semester or month.</li>
                <li>Mark it as <strong>Weak</strong> if you need the AI to prioritize it.</li>
              </ul>
            </section>

            {/* Creating Study Schedule */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-warning flex items-center gap-2">
                <CalendarClock className="size-5" /> 3. Creating Your Schedule
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Go to the <strong>Schedule List</strong> and add a new block.</li>
                <li>Select the Subject, Time, and specific Topic (e.g., "Math: Algebra").</li>
                <li>As you finish topics, check them off! You must complete all blocks for the day to keep your <strong>Streak</strong> alive.</li>
              </ul>
            </section>

            {/* Pomodoro Timer */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <Timer className="size-5" /> 4. Using the Pomodoro Timer
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Before starting, always select the <strong>Subject</strong> you are studying so your hours are tracked.</li>
                <li>Work during the focus session without distractions.</li>
                <li>The timer logs your session automatically, updating your progress bars.</li>
              </ul>
            </section>

            {/* AI Co-pilot */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-accent flex items-center gap-2">
                <Bot className="size-5" /> 5. The AI Co-pilot
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Don't know what to study? Scroll down to the AI Co-pilot. Ask it to generate a study plan. It will analyze your weak subjects and missed schedules, and create a perfect routine that you can instantly add to your Schedule List.
              </p>
            </section>

            {/* Gamification */}
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-warning flex items-center gap-2">
                <Trophy className="size-5" /> 6. Rewards & Streaks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Neosis gamifies your study experience. Complete 100% of your daily tasks to increase your streak. Gain XP and watch your stats grow in the Analytics Chart. Stay consistent!
              </p>
            </section>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
