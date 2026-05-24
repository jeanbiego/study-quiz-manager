import { createContext, useContext } from 'react';
import type React from 'react';
import type { AppData } from '../domain/types';

export type AppDataContextValue = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  replaceData: (nextData: unknown) => void;
};

export const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function useAppDataContext(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppDataContext must be used within AppDataContext.Provider');
  }

  return value;
}
