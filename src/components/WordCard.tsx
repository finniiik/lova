import { useState } from "react";
import type { Word } from "@/data/words";
import { Button } from "@/components/ui/button";

export function WordCard({ word }: { word: Word }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-fade-in rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-center text-3xl font-medium tracking-tight text-foreground">{word.en}</p>

      {!open ? (
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="rounded-full px-8" onClick={() => setOpen(true)}>
            показать ответ
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-5 animate-fade-in">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">перевод</p>
            <p className="mt-1 text-lg text-foreground">{word.ru}</p>
          </div>

          {word.full ? (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">расшифровка</p>
              <p className="mt-1 text-base italic text-foreground">{word.full}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              как понимать это слово
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{word.note}</p>
          </div>

          <div className="rounded-2xl bg-secondary p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">пример</p>
            <p className="mt-1 text-base text-foreground">{word.ex}</p>
            <p className="mt-2 text-sm text-muted-foreground">{word.exRu}</p>
          </div>
        </div>
      )}
    </div>
  );
}
