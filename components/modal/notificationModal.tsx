"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Notification {
  title: string;
  message: string;
}

interface NotificationModalProps {
  notification: Notification | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!notification || !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 opacity-100">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full relative transform transition-transform duration-300 scale-100">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <p className="text-lg font-bold mb-2 text-center">
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 text-center">
          {notification.message}
        </p>
      </div>
    </div>
  );
};
