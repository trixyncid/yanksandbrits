"use client";

import { Check, CircleAlert, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ToastInput = { tone: "success" | "error"; text: string; title?: string };
type Toast = ToastInput & { id: number };

// Errors stay longer: they usually mean the editor has to do something.
const duration = { success: 4500, error: 9000 } as const;
const maxVisible = 3;

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/** Shows a toast in the CMS corner. Must be used under ToastProvider (the admin root layout). */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside ToastProvider.");
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const show = useCallback((toast: ToastInput) => {
    const id = ++nextId.current;
    // A repeat of the same message replaces the old one instead of stacking.
    setToasts((current) => [...current.filter((item) => item.text !== toast.text), { ...toast, id }].slice(-maxVisible));
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const reduce = useReducedMotion();
  return (
    // The region stays mounted so screen readers pick up toasts added to it. Newest sits on top.
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-3 top-3 z-[var(--z-modal)] flex flex-col-reverse items-center gap-2.5 sm:top-5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.16 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="pointer-events-auto w-full sm:w-[24rem]"
          >
            <ToastCard toast={toast} onDismiss={() => onDismiss(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}

/** "Saved. The story is live." reads as a title and its detail; a single sentence gets a generic title. */
function headline(toast: ToastInput) {
  if (toast.title) return { title: toast.title, text: toast.text };
  const [, first, rest] = toast.text.match(/^([^.]+)\.\s+(.+)$/) ?? [];
  if (first && rest) return { title: first, text: rest };
  return { title: toast.tone === "error" ? "Something went wrong" : "Done", text: toast.text };
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const error = toast.tone === "error";
  const [paused, setPaused] = useState(false);
  const remaining = useRef<number>(duration[toast.tone]);
  const close = useRef(onDismiss);
  useEffect(() => {
    close.current = onDismiss;
  });

  // Counts down only while the pointer and focus are elsewhere, so a toast never vanishes mid-read.
  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = window.setTimeout(() => close.current(), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused]);

  const Icon = error ? CircleAlert : Check;
  const { title, text } = headline(toast);

  return (
    <div
      role={error ? "alert" : "status"}
      aria-atomic="true"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative flex items-start gap-3 overflow-hidden rounded-[1.25rem] bg-white py-3.5 pr-3 pl-3.5 font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.18)] ring-1 ring-cms-gray-25"
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", error ? "bg-danger/10 text-danger" : "bg-cms-blue-10 text-cms-blue")}>
        <Icon className="size-[1.05rem]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        {text ? <p className="mt-0.5 text-sm leading-5 text-cms-ink/65">{text}</p> : null}
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="-mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-cms-ink/45 transition-colors hover:bg-cms-field hover:text-cms-ink">
        <X className="size-4" aria-hidden="true" />
      </button>
      {/* Time left before it closes; stops while paused. */}
      <span
        className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left motion-reduce:hidden", error ? "bg-danger/40" : "bg-cms-blue/40")}
        style={{ animation: `cms-toast-timer ${duration[toast.tone]}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
        aria-hidden="true"
      />
    </div>
  );
}
