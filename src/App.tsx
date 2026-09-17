import React, { useState, useEffect } from "react";
import { ChatSession, ChatMessage, BookRecord, LanguageOption, UserAccount } from "./types";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatScreen } from "./components/ChatScreen";
import { KnowledgeBaseModal } from "./components/KnowledgeBaseModal";
import { TripleCalendarModal } from "./components/TripleCalendarModal";
import { SettingsModal } from "./components/SettingsModal";
import { FavoritesModal } from "./components/FavoritesModal";
import { AuthScreen } from "./components/AuthScreen";
import { getLocalUserFromSession, clearLocalSession } from "./utils/localAuth";

const SESSIONS_STORAGE_KEY = "islami_chat_sessions_v2";
const LANG_STORAGE_KEY = "islami_chat_lang_v2";

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<LanguageOption>(() => {
    return (localStorage.getItem(LANG_STORAGE_KEY) as LanguageOption) || "urdu";
  });

  // 2. Chat Sessions state - Always opens with a fresh new chat on app launch
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the most recent session already contains messages, start a fresh new chat!
          if (parsed[0].messages && parsed[0].messages.length > 0) {
            const freshSession: ChatSession = {
              id: "session-" + Date.now(),
              title: "نئی گفتگو",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: [],
            };
            return [freshSession, ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading saved sessions:", e);
    }

    const defaultSession: ChatSession = {
      id: "session-" + Date.now(),
      title: "نئی گفتگو",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    return [defaultSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || "session-default";
  });

  // 3. Books Knowledge Base state
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("saved_islamic_messages");
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getLocalUserFromSession();
  });

  const handleLogout = () => {
    clearLocalSession();
    setCurrentUser(null);
  };

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  }, [sessions]);

  // Save language
  const handleLanguageChange = (newLang: LanguageOption) => {
    setLanguage(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  // Fetch books from server
  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      if (data.success && Array.isArray(data.books)) {
        setBooks(data.books);
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Current active session
  const currentSession =
    sessions.find((s) => s.id === currentSessionId) ||
    sessions[0] || {
      id: "session-fallback",
      title: "نئی گفتگو",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

  // Create a new chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: "session-" + Date.now(),
      title: "نئی گفتگو",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Delete a chat session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: "session-" + Date.now(),
          title: "نئی گفتگو",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  // Clear current chat messages
  const handleClearChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [], updatedAt: new Date().toISOString() }
          : s
      )
    );
  };

  // Handle Send Message with real-time streaming
  const handleSendMessage = async (text: string, image?: string | null) => {
    if ((!text || !text.trim()) && !image) return;
    if (isLoading) return;

    const trimmedText = text ? text.trim() : "";
    const targetSessionId = currentSessionId;
    const userMsgId = "msg-" + Date.now();
    const assistantMsgId = "msg-ai-" + (Date.now() + 1);

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: trimmedText,
      imageUrl: image || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: "assistant",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      citations: [],
      isAI: true,
    };

    // Determine auto-title if first message
    const isFirstMessage = currentSession.messages.length === 0;
    const sessionTitle = isFirstMessage
      ? (trimmedText ? trimmedText.slice(0, 32) + (trimmedText.length > 32 ? "..." : "") : "تصویر کے حوالے سے رہنمائی")
      : currentSession.title;

    // Immediately update state with user message AND assistant placeholder
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: sessionTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMessage, assistantPlaceholder],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    let accumulatedText = "";
    let citations: any[] = [];
    let isAI = true;
    let alUlamaSource: any = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          message: trimmedText,
          image: image || null,
          history: currentSession.messages,
          language,
          stream: true,
          apiKey: localStorage.getItem("custom_gemini_api_key") || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));

                if (data.reset) {
                  accumulatedText = "";
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === targetSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, text: "" } : m
                          ),
                        };
                      }
                      return s;
                    })
                  );
                }

                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === targetSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, text: accumulatedText } : m
                          ),
                        };
                      }
                      return s;
                    })
                  );
                }

                if (data.citations) {
                  citations = data.citations;
                }
                if (data.alUlamaSource !== undefined) {
                  alUlamaSource = data.alUlamaSource;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === targetSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, alUlamaSource } : m
                          ),
                        };
                      }
                      return s;
                    })
                  );
                }
                if (data.isAI !== undefined) {
                  isAI = data.isAI;
                }
                if (data.done && data.reply) {
                  accumulatedText = data.reply;
                  if (data.alUlamaSource !== undefined) {
                    alUlamaSource = data.alUlamaSource;
                  }
                }
              } catch (parseErr) {}
            }
          }
        }

        // Final sync of assistant message
        const finalText =
          accumulatedText.trim() ||
          "معذرت، جواب تیار کرنے میں مسئلہ آیا۔ براہ کرم دوبارہ کوشش فرمائیں۔";

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, text: finalText, citations, isAI, alUlamaSource }
                    : m
                ),
              };
            }
            return s;
          })
        );
      } else {
        // Fallback for non-streaming response
        const data = await res.json();
        const finalText =
          data.reply ||
          "معذرت، جواب تیار کرنے میں مسئلہ آیا۔ براہ کرم دوبارہ کوشش فرمائیں۔";
        const fetchedSource = data.alUlamaSource || null;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        text: finalText,
                        citations: data.citations || [],
                        alUlamaSource: fetchedSource,
                        hasBookContext: data.hasBookContext || false,
                        isAI: data.isAI || false,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } catch (err: any) {
      console.error("Chat request error:", err);
      const errorMsg = `❌ **خرابی / Connection Error:** رابطہ قائم نہیں ہو سکا۔ برائے مہربانی اپنا انٹرنیٹ کنکشن چیک کریں یا دوبارہ کوشش فرمائیں۔\n\n_${err?.message || "Network Error"}_`;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: s.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      text: errorMsg,
                      citations: [],
                      isAI: false,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 0. If user is not logged in, show AuthScreen (Login via Google/Gmail or Email)
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(_token, user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen h-[100dvh] w-screen max-w-[100vw] bg-[#050c0a] text-slate-100 font-sans overflow-hidden">
      {/* 1. Left/Right Sidebar (ChatGPT History & Tools) */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favoritesCount}
        booksCount={books.length}
        language={language}
        onChangeLanguage={handleLanguageChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatScreen
          session={currentSession}
          books={books}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onClearChat={handleClearChat}
          language={language}
          onNewChat={handleNewChat}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          favoritesCount={favoritesCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSidebarOpen={isSidebarOpen}
        />
      </main>

      {/* 3. Knowledge Base Manager Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        books={books}
        onRefreshBooks={fetchBooks}
      />

      {/* 4. Triple Islamic Calendar Modal */}
      <TripleCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onAskChat={handleSendMessage}
      />

      {/* 5. Gemini AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 6. Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => {
          setIsFavoritesOpen(false);
          try {
            const saved = localStorage.getItem("saved_islamic_messages");
            setFavoritesCount(saved ? JSON.parse(saved).length : 0);
          } catch {}
        }}
      />
    </div>
  );
}
