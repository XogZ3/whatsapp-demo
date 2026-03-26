'use client';

import React, { useEffect, useState } from 'react';

import MessageArea from './MessageArea';
import { Sidebar } from './Sidebar';

function WhatsAppMessagesUI() {
  const [clients, setClients] = useState<any>();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Fetch clients
    const fetchClientList = async () => {
      const response = await fetch(
        '/api/getClientList?api_key=7x3i2TvUdHPEozST',
      );
      const data = await response.json();
      setClients(data?.clients);
    };
    fetchClientList();
  }, []);

  useEffect(() => {
    // Fetch initial messages for selected client
    if (selectedClient) {
      const fetchMessages = async (clientid: string) => {
        const response = await fetch(
          `/api/getClientMessages?api_key=7x3i2TvGokPEozST&clientid=${clientid}&limit=10`,
        );
        const data = await response.json();
        setMessages(data?.messages || []);
        setLastMessageId(data?.lastMessageId || null);
      };
      fetchMessages(selectedClient);
    }
  }, [selectedClient]);

  const loadMoreMessages = async () => {
    if (!selectedClient || !lastMessageId || loadingMore) return;

    setLoadingMore(true);
    const response = await fetch(
      `/api/getClientMessages?api_key=7x3i2TvGokPEozST&clientid=${selectedClient}&limit=10&startAfter=${lastMessageId}`,
    );
    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, ...(data?.messages || [])]);
    setLastMessageId(data?.lastMessageId || null);
    setLoadingMore(false);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden sm:flex-row">
      <Sidebar
        clientList={clients}
        onSelectClient={setSelectedClient}
        onSelectedClient={selectedClient}
      />
      <div className="flex flex-1 flex-col">
        {/* {lastMessageId && (
          <button
            onClick={loadMoreMessages}
            disabled={loadingMore}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        )} */}
        <MessageArea
          messages={messages}
          onLoadMore={loadMoreMessages}
          loadingStatus={loadingMore}
          loadingLastMessageId={lastMessageId}
        />
      </div>
    </div>
  );
}

export default WhatsAppMessagesUI;
