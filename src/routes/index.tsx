import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { WORDS, type Word } from "@/data/words";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Quiz } from "@/components/Quiz";
import { WordCard } from "@/components/WordCard";
import {
  emptyProgress,
  loadProgress,
  makePool,
  PASSWORD,
  saveProgress,
  byId,
  todayKey,
  yesterdayKey,
  TOTAL,
  TOTAL_DAYS,
  type Progress as AppProgress,
  type Phase,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "love vocab — 170 английских слов" },
      {
        name: "description",
        content:
          "Личный словарь из 170 английских слов и выражений о любви, TikTok English и dreamy эстетике. 5 новых слов каждый день.",
      },
      { property: "og:title", content: "love vocab — 170 английских слов" },
      {
        property: "og:description",
        content:
          "Личный словарь из 170 английских слов и выражений. 5 новых слов каждый день.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Index() {
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  if (!progress.unlocked) {
    return (
      <PasswordGate
        input={input}
        setInput={setInput}
        error={error}
        setError={setError}
        onUnlock={() => {
          const next = { ...progress, unlocked: true };
          saveProgress(next);
          setProgress(next);
        }}
      />
    );
  }

  if (progress.learned.length >= TOTAL) {
    return <FinalScreen />;
  }

  switch (progress.phase) {
    case "select":
      return <SelectScreen progress={progress} setProgress={setProgress} />;
    case "learn":
      return <LearnScreen progress={progress} setProgress={setProgress} />;
    case "quiz":
      return <QuizScreen progress={progress} setProgress={setProgress} />;
    case "done":
      return <DoneScreen progress={progress} setProgress={setProgress} />;
    default:
      return <HomeScreen progress={progress} setProgress={setProgress} />;
  }
}

function PasswordGate({
  input,
  setInput,
  error,
  setError,
  onUnlock,
}: {
  input: string;
  setInput: (v: string) => void;
  error: boolean;
  setError: (v: boolean) => void;
  onUnlock: () => void;
}) {
  const [shake, setShake] = useState(false);

  function check() {
    if (input.trim().toLowerCase() === PASSWORD) {
      onUnlock();
      return;
    }
    setError(true);
    setShake(true);
    setInput("");
    setTimeout(() => setShake(false), 400);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div
        className={cn(
          "w-full max-w-sm animate-fade-in space-y-8 text-center",
          shake && "animate-shake",
        )}
      >
        <div className="space-y-2">
          <p className="text-3xl font-normal tracking-tight text-foreground">love vocab</p>
          <p className="text-sm text-muted-foreground">введи пароль, чтобы войти</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            placeholder="пароль"
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-center text-base text-foreground outline-none ring-ring transition-shadow focus:ring-2"
          />
          {error ? (
            <p className="text-sm text-destructive">неверный пароль, попробуй ещё раз</p>
          ) : null}
          <Button size="lg" className="w-full rounded-full" onClick={check}>
            войти
          </Button>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({
  progress,
  setProgress,
}: {
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}) {
  const completed = progress.learned.length;
  const percent = Math.round((completed / TOTAL) * 100);
  const reviewCount = progress.review.length;

  function start() {
    const pool = progress.pool && progress.pool.length > 0 ? progress.pool : makePool(progress.learned);
    const next = { ...progress, pool, phase: "select" as Phase };
    saveProgress(next);
    setProgress(next);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link to="/progress" className="text-sm text-muted-foreground underline underline-offset-4">
          прогресс
        </Link>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          day {progress.day} / {TOTAL_DAYS}
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-float mb-10">
          <MoonIcon className="h-16 w-16 text-primary/80" />
        </div>
        <h1 className="animate-fade-in text-3xl font-normal leading-snug tracking-tight text-foreground">
          любовь моя,
          <br />
          сегодня узнаешь
          <br />5 слов
        </h1>

        <div className="mt-10 w-full max-w-xs animate-fade-in space-y-6">
          <Button size="lg" className="w-full rounded-full py-6 text-base" onClick={start}>
            начать
          </Button>

          {reviewCount > 0 ? (
            <button
              onClick={() => {
                const next = { ...progress, phase: "learn" as Phase, chosen: progress.review.slice(0, 5) };
                saveProgress(next);
                setProgress(next);
              }}
              className="block w-full rounded-full border border-border bg-card py-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              повторить слова ({reviewCount})
            </button>
          ) : null}
        </div>
      </main>

      <footer className="mt-8 animate-fade-in space-y-2 text-center text-xs text-muted-foreground">
        <p>
          {completed} / {TOTAL} слов · {percent}%
        </p>
        <Progress value={percent} className="h-1" />
      </footer>
    </div>
  );
}

function SelectScreen({
  progress,
  setProgress,
}: {
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}) {
  const pool = progress.pool || [];
  const [selected, setSelected] = useState<number[]>(progress.chosen || []);

  const words = useMemo(() => pool.map(byId), [pool]);

  function toggle(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  function startLearn() {
    const next = { ...progress, chosen: selected, phase: "learn" as Phase };
    saveProgress(next);
    setProgress(next);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          выбрано {selected.length} / 5
        </p>
        <h2 className="mt-2 text-2xl font-normal tracking-tight text-foreground">
          Выбери 5 слов, которые хочешь узнать сегодня
        </h2>
      </header>

      <div className="space-y-3">
        {words.map((word) => {
          const isSelected = selected.includes(word.id);
          return (
            <button
              key={word.id}
              onClick={() => toggle(word.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors",
                isSelected
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              <span className="text-base font-medium text-foreground">{word.en}</span>
              <span className="text-sm text-muted-foreground">{word.ru}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={selected.length !== 5}
          onClick={startLearn}
        >
          учить выбранные
        </Button>
      </div>
    </div>
  );
}

function LearnScreen({
  progress,
  setProgress,
}: {
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}) {
  const chosen = progress.chosen || [];
  const words = useMemo(() => chosen.map(byId), [chosen]);

  if (words.length === 0) {
    const next = { ...progress, phase: "home" as Phase };
    saveProgress(next);
    setProgress(next);
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          изучение · {words.length} слов
        </p>
        <button
          onClick={() => {
            const next = { ...progress, phase: "quiz" as Phase };
            saveProgress(next);
            setProgress(next);
          }}
          className="text-sm text-primary underline underline-offset-4"
        >
          к тесту
        </button>
      </header>

      <div className="space-y-6">
        {words.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>

      <div className="mt-10">
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={() => {
            const next = { ...progress, phase: "quiz" as Phase };
            saveProgress(next);
            setProgress(next);
          }}
        >
          пройти тест
        </Button>
      </div>
    </div>
  );
}

function QuizScreen({
  progress,
  setProgress,
}: {
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}) {
  const chosen = progress.chosen || [];
  const words = useMemo(() => chosen.map(byId), [chosen]);

  if (words.length === 0) {
    const next = { ...progress, phase: "home" as Phase };
    saveProgress(next);
    setProgress(next);
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-10">
      <h2 className="mb-6 text-2xl font-normal tracking-tight text-foreground">
        Проверь, что запомнила
      </h2>
      <Quiz
        words={words}
        onFinish={(wrongIds) => {
          const nextReview = new Set(progress.review);
          wrongIds.forEach((id) => nextReview.add(id));
          const next = { ...progress, phase: "done" as Phase, review: Array.from(nextReview) };
          saveProgress(next);
          setProgress(next);
        }}
      />
    </div>
  );
}

function DoneScreen({
  progress,
  setProgress,
}: {
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}) {
  const learned = new Set(progress.learned);
  const chosen = progress.chosen || [];
  chosen.forEach((id) => learned.add(id));

  const completed = learned.size;
  const percent = Math.round((completed / TOTAL) * 100);

  function finishDay() {
    const today = todayKey();
    const yesterday = yesterdayKey();
    const streak = progress.lastDayDate === yesterday ? progress.streak + 1 : progress.lastDayDate === today ? progress.streak : 1;

    const next: AppProgress = {
      ...progress,
      learned: Array.from(learned),
      chosen: null,
      pool: null,
      phase: "home",
      day: Math.min(progress.day + 1, TOTAL_DAYS),
      lastDayDate: today,
      streak,
    };
    saveProgress(next);
    setProgress(next);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="animate-fade-in space-y-8">
        <div className="text-6xl">✨</div>
        <h2 className="text-3xl font-normal leading-snug tracking-tight text-foreground">
          ты умничка сегодня,
          <br />
          горжусь тобой
        </h2>
        <p className="text-muted-foreground">Сегодня изучено: 5 слов</p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {completed} / {TOTAL} слов · {percent}%
          </p>
          <Progress value={percent} className="h-1" />
        </div>

        <Button size="lg" className="w-full rounded-full" onClick={finishDay}>
          завершить день
        </Button>
      </div>
    </div>
  );
}

function FinalScreen() {
  function reset() {
    saveProgress(emptyProgress());
    window.location.reload();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="animate-fade-in space-y-8">
        <RoseIcon className="mx-auto h-16 w-16 text-primary/80" />
        <h2 className="text-3xl font-normal leading-snug tracking-tight text-foreground">
          ты прошла весь словарь
        </h2>
        <p className="text-xl text-foreground">170 / 170</p>
        <p className="text-muted-foreground">ты умничка сегодня, горжусь тобой</p>
        <Button size="lg" variant="outline" className="w-full rounded-full" onClick={reset}>
          начать заново
        </Button>
      </div>
    </div>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function RoseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2c-1.5 1.5-2 3.5-2 5.5 0 2 1 3.5 2 5 1-1.5 2-3 2-5 0-2-.5-4-2-5.5Z" />
      <path d="M12 12.5c-2-1-4-1-6 0-2 1-3 3-3 5.5 0 2.5 2 4 4.5 4 2.5 0 4-1.5 4.5-4 .5 2.5 2 4 4.5 4 2.5 0 4.5-1.5 4.5-4 0-2.5-1-4.5-3-5.5-2-1-4-1-6 0Z" />
      <path d="M12 12.5v9" />
    </svg>
  );
}
