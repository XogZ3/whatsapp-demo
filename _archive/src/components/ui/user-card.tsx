import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { CoinsIcon } from 'lucide-react';
import React from 'react';

import { Skeleton } from './skeleton';

function getInitials(fullName: string) {
  if (!fullName) return '';

  // Split the name into an array of words, trimming any extra spaces.
  const words = fullName.trim().split(/\s+/);

  // Use optional chaining to safely access the first character.
  const firstInitial = words[0]?.[0]?.toUpperCase() || '';
  const lastInitial =
    words.length > 1 ? words[words.length - 1]?.[0]?.toUpperCase() || '' : '';

  // Combine and return the initials.
  return firstInitial + lastInitial;
}

interface UserCardProps {
  userImageUrl: string;
  userName: string;
  // userEmail: string;
}

const UserCard = ({
  isLoading,
  userImageUrl,
  userName,
  // userEmail
}: {
  isLoading: boolean;
  userImageUrl: string;
  userName: string;
  // userEmail: string;
}) => {
  const avatarInitials = getInitials(userName || '');
  return (
    <div className="flex w-full flex-row items-center justify-center gap-4 rounded-[8px] border border-input bg-background p-4">
      {isLoading ? (
        <Skeleton role="status" className="min-h-[48px] min-w-[193px]">
          <span className="sr-only">Loading...</span>
        </Skeleton>
      ) : (
        <>
          <div className="flex size-12 items-center justify-center">
            <Avatar>
              <>
                <AvatarImage
                  className="size-full rounded-full"
                  src={userImageUrl}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </>
            </Avatar>
          </div>
          <div>
            <p className="font-bold">{userName}</p>
            {/* <p className="text-sm">{userEmail}</p> */}
          </div>
        </>
      )}
    </div>
  );
};

const MobileUserCard = ({ userImageUrl, userName }: UserCardProps) => {
  const avatarInitials = getInitials(userName || '');
  return (
    <div className="flex w-fit flex-row items-center justify-center gap-4 rounded-full border border-input bg-background p-1">
      <div className="flex size-8 items-center justify-center">
        <Avatar>
          <AvatarImage
            className="size-full rounded-full"
            src={userImageUrl}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>{avatarInitials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

const UserCredits = ({ numberOfCredits = 100 }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-2 rounded-full border border-slate-500/60 px-4 py-2">
      <CoinsIcon className="p-px text-purple-500" />
      <p>{numberOfCredits}</p>
    </div>
  );
};

export { MobileUserCard, UserCard, UserCredits };
