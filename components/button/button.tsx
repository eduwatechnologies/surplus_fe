"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import classNames from "classnames";

interface IProps {
  title?: string | React.ReactNode;
  btnType?: "primary" | "outline" | "danger";
  loading?: boolean;
  type?: "submit" | "button";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ApButton: React.FC<IProps> = ({
  title,
  type = "button",
  className = "",
  loading = false,
  onClick,
  disabled = false,
  btnType = "primary",
  children,
}) => {
  const btnClassName = classNames(
    "inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
    {
      // Default styles based on btnType
      "bg-green-600 text-white hover:bg-black/90 mt-2":
       btnType === "primary",
      "border border-black text-black hover:bg-black hover:text-white":
        btnType === "outline",
      "bg-red-600 text-white hover:bg-red-700": btnType === "danger",
    },
    className
  );

  return (
    <button
      type={type}
      className={btnClassName}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        title || children
      )}
    </button>
  );
};
