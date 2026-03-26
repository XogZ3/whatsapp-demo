'use client';

import { BellIcon } from 'lucide-react';
import React, { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<any>([
    {
      id: 1,
      text: 'Video is ready',
      date: '07-07-2024',
      read: true,
    },
    {
      id: 2,
      text: 'Video is queued',
      date: '07-07-2024',
      read: false,
    },
  ]);

  const handleNotificationClick = (id: number) => {
    setNotifications((prevNotifications: any) =>
      prevNotifications.map((notification: any) =>
        notification.id === id
          ? { ...notification, read: !notification.read } // Toggle the read state
          : notification,
      ),
    );
  };

  const hasUnreadNotifications = notifications.some(
    (notification: any) => !notification.read,
  );

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex size-10 items-center justify-center hover:bg-accent hover:text-accent-foreground sm:border sm:border-input sm:bg-background">
          <div
            className={`absolute right-1 top-1 my-1 size-[6px] rounded-full sm:-right-2 sm:-top-2 sm:size-3 ${hasUnreadNotifications ? 'bg-green-500' : 'hidden'}`}
          />
          <BellIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          {notifications.map((item: any) => (
            <DropdownMenuItem
              // eslint-disable-next-line react/no-array-index-key
              key={item.id}
              onClick={() => handleNotificationClick(item.id)}
              className="flex cursor-pointer items-start gap-2 px-3 py-2 transition hover:bg-neutral-50"
            >
              <div
                className={`my-1 size-3 rounded-full ${!item.read ? 'bg-green-500' : 'bg-neutral-200'}`}
              />
              <div className="flex flex-col items-start justify-center">
                <p>{item.text}</p>
                <p className="text-xs text-neutral-500">{item.date}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationsMenu;
