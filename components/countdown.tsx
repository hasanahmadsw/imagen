"use client";

import { Clock } from "lucide-react";

import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type CountdownProps = Omit<
  ComponentProps<"div">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> &
  UseCountdownOptions;

export function Countdown({
  loading = false,
  onTick,
  resetOnLoadingChange = true,
  className,
  ...props
}: CountdownProps) {
  const { formattedSeconds, formattedMilliseconds, elapsedTime } = useCountdown(
    {
      loading,
      onTick,
      resetOnLoadingChange,
    }
  );

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1 font-medium",
        loading 
          ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 shadow-sm" 
          : "bg-muted border border-border",
        className
      )}
      key={elapsedTime === 0 ? "countdown-0" : "countdown"}
      layoutId="countdown"
      {...props}
    >
      <Clock
        className={cn(
          "h-3 w-3 transition-colors",
          loading ? "text-blue-600 dark:text-blue-400 animate-[spin_3s_linear_infinite]" : "text-muted-foreground"
        )}
      />
      <div>
        <div
          className="flex items-baseline font-semibold tracking-tight"
          style={{ fontVariantNumeric: "tabular-nums" } as React.CSSProperties}
        >
          <div className="flex items-baseline gap-0.5">
            <span
              className={cn(
                "text-lg transition-colors duration-200",
                loading ? "text-blue-700 dark:text-blue-300" : "text-foreground"
              )}
            >
              {formattedSeconds}
            </span>
            <span
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                loading ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
              )}
            >
              s
            </span>
          </div>
          <span
            className={cn(
              "mx-1 transition-colors duration-200",
              loading ? "text-blue-500/60 dark:text-blue-400/60" : "text-muted-foreground/40"
            )}
          >
            .
          </span>
          <div className="flex items-baseline">
            <span
              className={cn(
                "text-lg transition-colors duration-200",
                loading ? "text-blue-600 dark:text-blue-400" : "text-foreground"
              )}
            >
              {formattedMilliseconds}
            </span>
            <span
              className={cn(
                "ml-0.5 text-xs font-medium transition-colors duration-200",
                loading ? "text-blue-500 dark:text-blue-400" : "text-muted-foreground"
              )}
            >
              ms
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export interface UseCountdownOptions {
  loading?: boolean;
  onTick?: (seconds: number, milliseconds: number) => void;
  resetOnLoadingChange?: boolean;
}

export interface UseCountdownReturn {
  elapsedTime: number;
  milliseconds: number;
  formattedSeconds: string;
  formattedMilliseconds: string;
  isRunning: boolean;
  reset: () => void;
  start: () => void;
  stop: () => void;
}

export function useCountdown({
  loading = false,
  onTick,
  resetOnLoadingChange = true,
}: UseCountdownOptions = {}): UseCountdownReturn {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const reset = useCallback(() => {
    setElapsedTime(0);
    setMilliseconds(0);
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Handle loading prop changes
  useEffect(() => {
    if (loading) {
      if (resetOnLoadingChange) {
        reset();
      }
      start();
    } else {
      stop();
    }
  }, [loading, resetOnLoadingChange, reset, start, stop]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let msTimer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      msTimer = setInterval(() => {
        setMilliseconds((prev) => (prev + 10) % 1000);
      }, 10);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (msTimer) clearInterval(msTimer);
    };
  }, [isRunning]);

  // Tick callback effect
  useEffect(() => {
    if (onTick) {
      onTick(elapsedTime, milliseconds);
    }
  }, [elapsedTime, milliseconds, onTick]);

  const formattedSeconds = elapsedTime.toString().padStart(2, "0");
  const formattedMilliseconds = Math.floor(milliseconds / 10)
    .toString()
    .padStart(2, "0");

  return {
    elapsedTime,
    milliseconds,
    formattedSeconds,
    formattedMilliseconds,
    isRunning,
    reset,
    start,
    stop,
  };
}
