import React from "react";
import { Lock, CheckCircle2, ChevronRight } from "lucide-react";

interface LessonCardProps {
  weekNumber: number;
  title: string;
  progress: number; // 0-100
  isLocked?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  weekNumber,
  title,
  progress,
  isLocked = false,
  isCompleted = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`card-hover group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card p-5 text-left transition-all duration-300 ${
        isLocked
          ? "cursor-not-allowed border-border opacity-60"
          : "cursor-pointer border-border hover:border-primary/30"
      } ${isCompleted ? "border-success/30" : ""}`}
    >
      {/* Week number */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Semana {weekNumber}
        </span>
        {isLocked && <Lock size={14} className="text-muted-foreground" />}
        {isCompleted && <CheckCircle2 size={16} className="text-success" />}
        {!isLocked && !isCompleted && (
          <ChevronRight
            size={16}
            className="text-muted-foreground transition-transform group-hover:translate-x-1"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-4 font-heading text-base font-bold text-foreground leading-snug">
        {title}
      </h3>

      {/* Progress bar */}
      <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
};

export default LessonCard;
