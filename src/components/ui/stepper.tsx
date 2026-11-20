import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
  label: string;
}

export function Stepper({ steps, current, label }: StepperProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex items-start gap-2">
        {steps.map((step, index) => {
          const state = index < current ? "complete" : index === current ? "current" : "upcoming";
          return (
            <li
              key={step}
              className="flex flex-1 flex-col items-center gap-2 text-center"
              aria-current={state === "current" ? "step" : undefined}
              data-state={state}
            >
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    index === 0 ? "invisible" : index <= current ? "bg-brand-600" : "bg-ink-200",
                  )}
                />
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    state === "complete" && "border-brand-600 bg-brand-600 text-white",
                    state === "current" && "border-brand-600 bg-white text-brand-700",
                    state === "upcoming" && "border-ink-200 bg-white text-ink-400",
                  )}
                >
                  {state === "complete" ? <Check aria-hidden className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    index === steps.length - 1
                      ? "invisible"
                      : index < current
                        ? "bg-brand-600"
                        : "bg-ink-200",
                  )}
                />
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  state === "upcoming" ? "text-ink-400" : "text-ink-800",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
