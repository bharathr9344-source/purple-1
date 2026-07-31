import { createContext, useContext } from "react";

export const HuntContext = createContext(null);

export function useHunt() {
  return useContext(HuntContext);
}
