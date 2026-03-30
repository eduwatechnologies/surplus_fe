"use client";
import { X } from "lucide-react";

interface TopSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function TopSheetModal({
  isOpen,
  onClose,
  title = "More Options",
  children,
}: TopSheetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 transition-opacity duration-300 opacity-100">
      <div className="fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-lg p-6 transform transition-transform duration-300 translate-y-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
