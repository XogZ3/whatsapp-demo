import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/utils';

// Define the props interface for the message data
interface MessageAreaProps {
  messages: any[] | null | undefined; // Allow messages to be array, null, or undefined
  onLoadMore: () => void; // Callback to load more messages
  loadingStatus: boolean;
  loadingLastMessageId: string | null;
}

const MessageArea: React.FC<MessageAreaProps> = ({
  messages,
  onLoadMore,
  loadingStatus,
  loadingLastMessageId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [hasLoadedInitialMessages, setHasLoadedInitialMessages] =
    useState(false); // Track if initial messages are loaded

  // Scroll to the bottom only when new messages are added
  useEffect(() => {
    if (!hasLoadedInitialMessages && messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setHasLoadedInitialMessages(true);
  }, [hasLoadedInitialMessages, messages]);

  // Ensure messages is always an array before sorting and rendering
  const sortedMessages = Array.isArray(messages)
    ? [...messages].sort((a, b) => a.timestamp - b.timestamp)
    : [];

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Load more button */}
      {messages && loadingLastMessageId && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingStatus}
          className="mb-2 rounded bg-blue-500 p-2 text-white"
        >
          {loadingStatus ? 'Loading...' : 'Load More'}
        </button>
      )}

      {sortedMessages.map((message) => {
        const { id, contact, timestamp, type } = message;
        const isSystemMessage = message.recipient_type === 'individual';
        const isInteractiveMessage =
          message?.interactive || message?.message?.interactive;

        return (
          <div
            key={id}
            className={`mb-4 flex flex-col ${isSystemMessage ? '' : 'items-end'}`}
          >
            <div
              className={cn(
                'flex items-start',
                isInteractiveMessage && 'hidden',
              )}
            >
              {/* Display sender name */}
              {isSystemMessage ? (
                <div className="mr-2 text-left font-bold">FotoLabs AI</div>
              ) : (
                <div className="ml-2 text-right font-bold">
                  {contact?.profile?.name || contact?.wa_id}
                </div>
              )}
              <div className="text-sm text-gray-500">
                {/* Display formatted timestamp */}
                {new Date(timestamp).toLocaleString('en-GB')}
              </div>
            </div>

            <div
              className={`ml-4 max-w-md rounded p-2 shadow-sm ${
                isSystemMessage ? 'items-start' : 'items-end'
              }`}
            >
              {/* Handle different message types */}
              {type === 'text' && message.text?.body && (
                <p>{message.text.body}</p>
              )}

              {message.message &&
                message.message.type === 'text' &&
                message.message?.text?.body && (
                  <p>{message.message?.text?.body}</p>
                )}

              {/* {message.message &&
                message.message.type === 'image' &&
                message.message?.image?.id && (
                  <ul>
                    <li>id: {message.message?.image?.id}</li>
                    <li>mime_type: {message.message?.image?.mime_type}</li>
                    <li>sha256: {message.message?.image?.sha256}</li>
                  </ul>
                )} */}

              {type === 'image' && message.image?.link && (
                <>
                  <Image
                    src={message.image?.link}
                    width={300}
                    height={300}
                    alt={timestamp.toString()}
                  />
                  {message.image?.caption && <p>{message.image?.caption}</p>}
                </>
              )}

              {isInteractiveMessage && (
                <p className="mb-2">{message.interactive.body.text}</p>
              )}
            </div>
          </div>
        );
      })}
      {/* Invisible div to maintain scroll position at the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageArea;
