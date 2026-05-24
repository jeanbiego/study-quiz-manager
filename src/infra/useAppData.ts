import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppData } from '../domain/types';
import { EMPTY_APP_DATA, loadAppData, normalizeImportedAppData, saveAppData } from './storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    if (typeof localStorage === 'undefined') {
      return EMPTY_APP_DATA;
    }

    return loadAppData();
  });

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const replaceData = useCallback((nextData: unknown) => {
    setData(normalizeImportedAppData(nextData));
  }, []);

  return useMemo(
    () => ({
      data,
      setData,
      replaceData,
    }),
    [data, replaceData],
  );
}
