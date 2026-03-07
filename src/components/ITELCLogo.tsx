import React from "react";
import { BookOpen } from "lucide-react";

interface ITELCLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ITELCLogo: React.FC<ITELCLogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-xl gap-1.5",
    md: "text-3xl gap-2",
    lg: "text-5xl gap-3",
  };

  const iconSize = {
    sm: 20,
    md: 28,
    lg: 44,
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      <BookOpen size={iconSize[size]} className="text-primary" strokeWidth={2.5} />
      <span className="font-heading font-extrabold tracking-wider text-primary">
        ITELC
      </span>
    </div>
  );
};

export default ITELCLogo;
