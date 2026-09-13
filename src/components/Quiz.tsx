import { useMemo, useState } from "react";
import { WORDS, type Word } from "@/data/words";
import { shuffle } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Question = {
  word: Word;
  prompt: string;
  hint: string;
  options: string[];
  answer: string;
};

function buildQuestions(words: Word[]): Question[] {
  const enToRu = words.map((w) => {
    const wrong = shuffle(WORDS.filter((x) => x.ru !== w.ru))
      .slice(0, 3)
      .map((x) => x.ru);
    return {
      word: w,
      prompt: w.en,
      hint: "выбери перевод",
      options: shuffle([w.ru, ...wrong]),
      answer: w.ru,
    };
  });

  const ruToEn = words.map((w) => {
    const wrong = shuffle(WORDS.filter((x) => x.en !== w.en))
      .slice(0, 3)
      .map((x) => x.en);
    return {
      word: w,
      prompt: w.ru,
      hint: "выбери слово на английском",
      options: shuffle([w.en, ...wrong]),
      answer: w.en,
    };
  });

  return shuffle([...enToRu.slice(0, 5), ...ruToEn.slice(0, 5)]);
}

export function Quiz({
  words,
  onFinish,
}: {
  words: Word[];
  onFinish: (wrongIds: number[]) => void;
}) {
  const questions = useMemo(() => buildQuestions(words), [words]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);

  const q = questions[index]!;

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    if (option !== q.answer) setWrong((w) => (w.includes(q.word.id) ? w : [...w, q.word.id]));
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(wrong);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>закрепление</span>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{q.hint}</p>
        <p className="mt-3 text-2xl font-light text-foreground">{q.prompt}</p>
      </div>

      <div className="space-y-3">
        {q.options.map((option, i) => {
          const isAnswer = option === q.answer;
          const isPicked = option === picked;
          return (
            <button
              key={`${option}-${i}`}
              onClick={() => choose(option)}
              disabled={picked !== null}
              className={cn(
                "w-full rounded-2xl border px-5 py-4 text-left text-base transition-colors",
                picked === null && "border-border bg-card hover:bg-accent",
                picked !== null && isAnswer && "border-primary bg-accent text-accent-foreground",
                picked !== null &&
                  isPicked &&
                  !isAnswer &&
                  "border-destructive bg-destructive/10 text-foreground",
                picked !== null && !isAnswer && !isPicked && "border-border bg-card opacity-50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked !== null ? (
        <div className="animate-fade-in space-y-3">
          <div className="rounded-2xl bg-secondary p-4 text-sm">
            <p className="text-foreground">{q.word.ex}</p>
            <p className="mt-1 text-muted-foreground">{q.word.exRu}</p>
          </div>
          <Button size="lg" className="w-full rounded-full" onClick={next}>
            {index + 1 >= questions.length ? "завершить тест" : "дальше"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
