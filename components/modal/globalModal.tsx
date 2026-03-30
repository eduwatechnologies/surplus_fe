"use client";
import { X } from "lucide-react";

interface GlobalModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const GlobalModal: React.FC<GlobalModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center z-100 bg-black/40  transition-opacity duration-300 opacity-100">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 shadow-lg min-h-[40vh] max-h-[60vh] overflow-y-auto transition-transform duration-300 translate-y-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default GlobalModal;
