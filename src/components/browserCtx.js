import { createContext, useContext } from "react";

export const BrowserCtx = createContext(null);

export function useBrowser() {
  return useContext(BrowserCtx);
}
