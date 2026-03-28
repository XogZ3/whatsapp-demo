import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  timestamp: string;
  buttons?: Array<{ id: string; label: string }>;
}

interface ScriptStep {
  from: "bot" | "user";
  text: string;
  buttons?: Array<{ id: string; label: string }>;
  delay: number;
  triggeredBy?: string;
}

const SCRIPT: ScriptStep[] = [
  {
    from: "bot",
    text: "Hey! Welcome to Glow Studio. I can help you book an appointment.\nWhat service are you looking for?",
    buttons: [
      { id: "service_haircut", label: "Haircut" },
      { id: "service_color", label: "Color" },
      { id: "service_nails", label: "Nails" },
    ],
    delay: 1200,
  },
  {
    from: "user",
    text: "Haircut",
    delay: 2000,
    triggeredBy: "service_haircut",
  },
  {
    from: "bot",
    text: "Got it, haircut! Do you have a preferred stylist?",
    buttons: [
      { id: "any_stylist", label: "Any available" },
      { id: "stylist_noor", label: "Noor" },
      { id: "stylist_marco", label: "Marco" },
    ],
    delay: 1500,
  },
  {
    from: "user",
    text: "Any available",
    delay: 2000,
    triggeredBy: "any_stylist",
  },
  {
    from: "bot",
    text: "When works for you?",
    buttons: [
      { id: "datetime_thu3", label: "Thu 3:00 PM" },
      { id: "datetime_fri2", label: "Fri 2:00 PM" },
      { id: "datetime_sat10", label: "Sat 10:00 AM" },
    ],
    delay: 1500,
  },
  {
    from: "user",
    text: "Thu 3:00 PM",
    delay: 2500,
    triggeredBy: "datetime_thu3",
  },
  {
    from: "bot",
    text: "Here's your booking:\n\n✂️ Haircut\n📅 Thursday, March 28 at 3:00 PM\n💇 Stylist: Noor (first available)\n⏱️ Duration: ~45 min\n💰 AED 120",
    buttons: [
      { id: "confirm", label: "Confirm" },
      { id: "change", label: "Change" },
    ],
    delay: 1500,
  },
  {
    from: "user",
    text: "Confirm",
    delay: 2000,
    triggeredBy: "confirm",
  },
  {
    from: "bot",
    text: "You're all set! 🎉\n\nI'll send you a reminder the day before. To reschedule or cancel, just message me anytime.",
    delay: 1200,
  },
];

function getTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Props {
  interactive?: boolean;
}

export default function WhatsAppDemo({ interactive = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [waitingForChoice, setWaitingForChoice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addMessage = useCallback(
    (step: ScriptStep) => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          from: step.from,
          text: step.text,
          timestamp: getTime(),
          buttons: step.buttons,
        },
      ]);
      setTimeout(scrollToBottom, 50);
    },
    [scrollToBottom]
  );

  const advanceScript = useCallback(
    (fromIndex: number) => {
      if (fromIndex >= SCRIPT.length) return;

      const step = SCRIPT[fromIndex];

      if (interactive && step.triggeredBy) {
        // In interactive mode, wait for user to click
        setWaitingForChoice(true);
        return;
      }

      if (step.from === "bot") {
        setIsTyping(true);
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          addMessage(step);
          if (step.buttons && interactive) {
            setWaitingForChoice(true);
          } else {
            setScriptIndex(fromIndex + 1);
          }
        }, step.delay);
      } else {
        timeoutRef.current = setTimeout(() => {
          addMessage(step);
          setScriptIndex(fromIndex + 1);
        }, step.delay);
      }
    },
    [interactive, addMessage]
  );

  useEffect(() => {
    if (!waitingForChoice && scriptIndex < SCRIPT.length) {
      advanceScript(scriptIndex);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scriptIndex, waitingForChoice, advanceScript]);

  const handleButtonClick = (buttonId: string, label: string) => {
    if (!waitingForChoice) return;

    // Remove buttons from last bot message
    setMessages((prev) => {
      const updated = [...prev];
      const lastBotIdx = updated.findLastIndex((m) => m.from === "bot");
      if (lastBotIdx >= 0) {
        updated[lastBotIdx] = { ...updated[lastBotIdx], buttons: undefined };
      }
      return updated;
    });

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length,
        from: "user",
        text: label,
        timestamp: getTime(),
      },
    ]);

    setWaitingForChoice(false);

    // Find the next step that this button triggers, or advance past the user step
    const nextIdx = SCRIPT.findIndex(
      (s, i) => i >= scriptIndex && s.triggeredBy === buttonId
    );
    if (nextIdx >= 0) {
      // Skip the user message step (we already added it), go to next bot message
      setScriptIndex(nextIdx + 1);
    } else {
      setScriptIndex(scriptIndex + 1);
    }

    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[14px] border-gray-800 bg-gray-800 shadow-xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-800" />

        {/* Screen */}
        <div className="relative h-[600px] overflow-hidden rounded-[1.5rem] bg-white">
          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 pt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-white">
              B
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Glow Studio
              </div>
              <div className="text-xs text-emerald-100">online</div>
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex h-[calc(100%-120px)] flex-col gap-2 overflow-y-auto bg-[#ECE5DD] p-3"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5cec3' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                    msg.from === "bot"
                      ? "mr-auto bg-white text-gray-900"
                      : "ml-auto bg-[#DCF8C6] text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>
                  <span className="mt-1 block text-right text-[10px] text-gray-500">
                    {msg.timestamp}
                  </span>
                </div>
                {msg.buttons && (
                  <div className="mt-1 flex max-w-[85%] flex-col gap-1">
                    {msg.buttons.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleButtonClick(btn.id, btn.label)}
                        className={`rounded-lg border border-[#25D366] bg-white px-3 py-2 text-center text-sm font-medium text-[#075E54] shadow-sm transition-colors ${
                          interactive && waitingForChoice
                            ? "cursor-pointer hover:bg-emerald-50"
                            : "cursor-default"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto max-w-[85%] rounded-lg bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div className="absolute bottom-0 flex w-full items-center gap-2 bg-[#F0F0F0] px-3 py-2">
            <div className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-gray-400">
              Type a message...
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
