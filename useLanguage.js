import { useState, useCallback } from "react";

const STORAGE_KEY = "arcana_lang";

export function useLanguage() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "it";
  });

  const setLang = useCallback((newLang) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  }, []);

  return { lang, setLang };
}
