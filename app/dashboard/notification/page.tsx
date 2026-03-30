"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Check } from "lucide-react";
import { AppDispatch, RootState } from "@/redux/store";
import ApHeader from "@/components/Apheader";
import { EmptyTransaction } from "@/components/empty";
import { getAllNotification } from "@/redux/features/notifications/notificationSlice";

export default function NotificationPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { notifications: notifies } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(getAllNotification());
  }, [dispatch]);

  return (
    <div>
      <ApHeader title="Notifications" />
      <div className="py-4 px-2 space-y-4">
        {notifies?.length === 0 ? (
          <EmptyTransaction />
        ) : (
          notifies?.map((notification: any) => (
            <div
              key={notification?._id}
              className={`p-4 rounded-md shadow-md border transition-all duration-300 ${
                notification?.read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{notification?.title}</p>
                  <p className="text-sm text-gray-600">
                    {notification?.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification?.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification?.read && <Check className="text-green-500" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
