import { createContext, useContext } from "react";

export const ChatSessionContext = createContext(null);

export function useChatSessionContext() {
  return useContext(ChatSessionContext);
}