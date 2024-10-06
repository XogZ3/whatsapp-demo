import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/libs/utils';

export function Sidebar({
  clientList,
  onSelectClient,
  onSelectedClient,
}: {
  clientList: any;
  onSelectClient: (clientId: string) => void;
  onSelectedClient: string | null;
}) {
  if (!clientList) {
    return <Skeleton className="h-full w-56 min-w-56 shrink-0" />;
  }

  return (
    <div className="w-56 min-w-56 shrink-0 flex-col border-r p-4 sm:flex">
      <nav className="flex w-full grow flex-col items-start justify-between">
        <div className="w-full space-y-2">
          <ul>
            {clientList.map((client: any) => (
              // Replace <li> with <button> for accessibility and interactivity
              <li
                key={client.id}
                className={cn(
                  onSelectedClient === client.id && 'text-blue-500',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectClient(client.id)}
                  className="w-full p-2 text-left hover:bg-gray-400 hover:text-current"
                  aria-label={`Select client ${client.name}`}
                >
                  <strong>ID:</strong> {client.id} <br />
                  <strong>Name:</strong> {client.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
