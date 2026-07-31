import { createContext, useContext } from "react";

export const LearningContext = createContext(null);

export function useLearning() {
  return useContext(LearningContext);
}
