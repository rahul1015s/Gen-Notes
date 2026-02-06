import React, { useEffect, useMemo, useRef, useState } from "react";
import { Widget, WidgetContent, WidgetFooter, WidgetHeader, WidgetTitle } from "@/components/ui/widget";
import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon, RotateCcw, Timer } from "lucide-react";

export default function ClockWidget({ className, showSeconds = true, title = "Clock" }) {
  const [now, setNow] = useState(new Date());
  const [mode, setMode] = useState("clock"); // "clock" | "pomodoro"
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("work"); // "work" | "break"
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const intervalRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (mode !== "pomodoro") return;
    if (!isRunning || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [mode, isRunning]);

  useEffect(() => {
    if (mode !== "pomodoro") return;
    if (timeLeft > 0) return;
    const nextPhase = phase === "work" ? "break" : "work";
    const nextSeconds = nextPhase === "work" ? workMinutes * 60 : breakMinutes * 60;
    setPhase(nextPhase);
    setTimeLeft(nextSeconds);
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(nextPhase === "work" ? "Back to focus" : "Time for a break", {
          body: nextPhase === "work" ? "Start your next focus session." : "Take a short break.",
        });
      }
    }
  }, [timeLeft, mode, phase, workMinutes, breakMinutes]);

  const timeText = useMemo(() => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
    };
    return new Intl.DateTimeFormat(undefined, options).format(now);
  }, [now, showSeconds]);

  const dateText = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(now);
  }, [now]);

  const pomodoroText = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const toggleRun = async () => {
    if (mode !== "pomodoro") return;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    setIsRunning((prev) => !prev);
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(workMinutes * 60);
  };

  const applyDurations = (nextWork, nextBreak) => {
    setWorkMinutes(nextWork);
    setBreakMinutes(nextBreak);
    if (!isRunning) {
      setPhase("work");
      setTimeLeft(nextWork * 60);
    }
  };

  return (
    <Widget className={cn("gap-3 w-full", className)} design="mumbai">
      <WidgetHeader className="items-center">
        <div className="flex items-center gap-2">
          <WidgetTitle className="text-sm text-base-content/70">{title}</WidgetTitle>
          <button
            type="button"
            className={cn(
              "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border",
              mode === "pomodoro"
                ? "border-base-300 text-base-content/70 dark:text-white"
                : "border-base-200 text-base-content/50 dark:text-white"
            )}
            onClick={() => {
              setMode((prev) => (prev === "clock" ? "pomodoro" : "clock"));
              setIsRunning(false);
              setPhase("work");
              setTimeLeft(workMinutes * 60);
            }}
          >
            <Timer className="inline-block w-3 h-3 mr-1" />
            {mode === "clock" ? "Pomodoro" : "Clock"}
          </button>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-base-content/50 dark:text-white">
          {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </span>
      </WidgetHeader>
      <WidgetContent>
        <div className="flex h-full w-full flex-col items-center justify-center">
          {mode === "clock" ? (
            <>
              <div className="text-4xl font-semibold text-base-content dark:text-white">{timeText}</div>
              <div className="mt-1 text-xs text-base-content/60 dark:text-white">{dateText}</div>
            </>
          ) : (
            <>
              <div className="text-4xl font-semibold text-base-content dark:text-white">{pomodoroText}</div>
              <div className="mt-1 text-xs text-base-content/60 dark:text-white">
                {phase === "work" ? "Focus" : "Break"} • {workMinutes}/{breakMinutes} min
              </div>
            </>
          )}
        </div>
      </WidgetContent>
      <WidgetFooter>
        {mode === "clock" ? (
          <div className="text-[11px] text-base-content/50 dark:text-white">Local time</div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content dark:text-white"
              onClick={() => applyDurations(Math.max(5, workMinutes - 5), breakMinutes)}
              disabled={isRunning}
            >
              -5 Work
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content dark:text-white"
              onClick={() => applyDurations(workMinutes, Math.min(30, breakMinutes + 5))}
              disabled={isRunning}
            >
              +5 Break
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              className="btn btn-outline btn-xs text-base-content dark:text-white"
              onClick={resetPomodoro}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary btn-xs text-white"
              onClick={toggleRun}
            >
              {isRunning ? <PauseIcon className="w-3 h-3 mr-1" /> : <PlayIcon className="w-3 h-3 mr-1" />}
              {isRunning ? "Pause" : "Start"}
            </button>
          </div>
        )}
      </WidgetFooter>
    </Widget>
  );
}
