import { useEffect, useState } from "react";

interface UseLocalStorageStateWithGenericProps<T> {
  initialValue: T;
  key: string;
}

export const useLocalStorageStateWithGeneric = <T>({
  key,
  initialValue
}: UseLocalStorageStateWithGenericProps<T>) => {
  const [value, setValue] = useState<T>(() => {
    const storageValue = window.localStorage.getItem(key);
    if (storageValue === "undefined") return undefined;

    return storageValue !== null ? JSON.parse(storageValue) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
