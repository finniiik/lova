import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { WORDS } from "@/data/words";
import { byId, loadProgress, type Progress as AppProgress } from "@/lib/progress";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
  head: () => ({
    meta: [
      { title: "прогресс — love vocab" },
      { name: "description", content: "Прогресс изучения 170 английских слов." },
      { property: "og:title", content: "прогресс — love vocab" },
      { property: "og:description", content: "Прогресс изучения 170 английских слов." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProgressPage() {
  const [progress, setProgress] = useState<AppProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  const completed = progress.learned.length;
  const total = WORDS.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
          назад
        </Link>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">прогресс</p>
      </header>

      <div className="space-y-8">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">день</p>
          <p className="mt-1 text-3xl font-extralight text-foreground">
            {Math.min(progress.day, Math.ceil(total / 5))} / {Math.ceil(total / 5)}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">слова</p>
          <p className="mt-1 text-3xl font-extralight text-foreground">
            {completed} / {total}
          </p>
          <div className="mt-4">
            <Progress value={percent} className="h-2" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{percent}% пройдено</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">дней подряд</p>
            <p className="mt-2 text-3xl font-extralight text-foreground">{progress.streak}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">на повторении</p>
            <p className="mt-2 text-3xl font-extralight text-foreground">{progress.review.length}</p>
          </div>
        </div>

        {progress.review.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">на повторении</p>
            <div className="space-y-2">
              {progress.review.slice(0, 20).map((id) => {
                const word = byId(id);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <span className="text-foreground">{word.en}</span>
                    <span className="text-sm text-muted-foreground">{word.ru}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
