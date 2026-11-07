import { useEffect, useState } from "react";
import type { LaunchCountdown } from "@/types/launch";

export interface CountdownTimerProps {
  targetDate: string;
  countdown: LaunchCountdown;
  meetingTitle?: string;
  meetingLocation?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

function calculateTimeRemaining(targetIso: string): TimeRemaining {
  const targetMs = new Date(targetIso).getTime();
  const nowMs = Date.now();
  const diffMs = targetMs - nowMs;

  if (Number.isNaN(targetMs) || diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isCompleted: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isCompleted: false,
  };
}

function formatTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export default function CountdownTimer({
  targetDate,
  countdown,
  meetingTitle,
  meetingLocation,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate),
  );

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetDate));

    const intervalId = window.setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetDate]);

  const blocks = [
    { key: "days", value: formatTwoDigits(timeLeft.days), label: countdown.labels.days },
    { key: "hours", value: formatTwoDigits(timeLeft.hours), label: countdown.labels.hours },
    { key: "minutes", value: formatTwoDigits(timeLeft.minutes), label: countdown.labels.minutes },
    { key: "seconds", value: formatTwoDigits(timeLeft.seconds), label: countdown.labels.seconds },
  ];

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className="mt-10 sm:mt-12"
    >
      {timeLeft.isCompleted ? (
        <div className="mx-auto max-w-xl rounded-sm border border-slate-200 bg-slate-50 px-6 py-5 text-center shadow-xs">
          <p className="font-heading text-sm font-bold tracking-wider text-[#004b97] uppercase sm:text-base">
            {countdown.completedMessage}
          </p>
        </div>
      ) : (
        <div className="flex items-stretch justify-center gap-2 sm:gap-4">
          {blocks.map((block, index) => (
            <div key={block.key} className="flex items-center gap-2 sm:gap-4">
              <div className="min-w-[70px] rounded-sm border border-slate-200 bg-white p-4 text-center shadow-xs sm:min-w-[100px] sm:p-6">
                <span className="font-heading block text-3xl leading-none font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-5xl">
                  {block.value}
                </span>
                <span className="font-heading mt-2 block text-[10px] font-semibold tracking-widest text-slate-500 uppercase sm:text-xs">
                  {block.label}
                </span>
              </div>

              {index < blocks.length - 1 && (
                <span
                  aria-hidden="true"
                  className="font-heading hidden self-center text-2xl text-slate-300 sm:block sm:text-4xl"
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {(meetingTitle || meetingLocation) && (
        <p className="mt-5 font-sans text-xs text-slate-500 sm:text-sm">
          {meetingTitle && (
            <span className="font-semibold text-slate-700">{meetingTitle}</span>
          )}
          {meetingTitle && meetingLocation && (
            <span className="mx-2 text-slate-300" aria-hidden="true">
              —
            </span>
          )}
          {meetingLocation && <span>{meetingLocation}</span>}
        </p>
      )}
    </div>
  );
}
