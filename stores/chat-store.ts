import { create } from "zustand";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface ExtractedData {
  name?: string | null;
  tagline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  highlights?: string[] | null;
  contact?: { email?: string; wechat?: string; phone?: string } | null;
  use_case?: string | null;
  tone?: string | null;
  language?: string | null;
  is_ready?: boolean;
}

interface ChatState {
  conversationId: string | null;
  messages: Message[];
  extractedData: ExtractedData | null;
  isLoading: boolean;
  isReadyToGenerate: boolean;
  hint: string;
  error: string | null;

  setConversationId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  appendToLastMessage: (chunk: string) => void;
  setExtractedData: (data: ExtractedData) => void;
  setIsLoading: (loading: boolean) => void;
  setIsReadyToGenerate: (ready: boolean) => void;
  setHint: (hint: string) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversationId: null,
  messages: [],
  extractedData: null,
  isLoading: false,
  isReadyToGenerate: false,
  hint: "",
  error: null,

  setConversationId: (id) => set({ conversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant"
      ) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    }),
  appendToLastMessage: (chunk) =>
    set((state) => {
      const messages = [...state.messages];
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant"
      ) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content: messages[messages.length - 1].content + chunk,
        };
      }
      return { messages };
    }),
  setExtractedData: (data) => set({ extractedData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsReadyToGenerate: (ready) => set({ isReadyToGenerate: ready }),
  setHint: (hint) => set({ hint }),
  setError: (error) => set({ error }),
}));
