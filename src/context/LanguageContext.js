import React, { createContext, useState, useContext, useEffect } from 'react';
import * as OpenCC from 'opencc-js';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Default to Simplified Chinese (zh-CN)
  const [language, setLanguage] = useState('zh-CN');
  const [converters, setConverters] = useState({
    twToCn: null,
    cnToTw: null
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initConverters = async () => {
      try {
        // Converter for Traditional -> Simplified
        const twToCn = await OpenCC.Converter({ from: 'tw', to: 'cn' });
        // Converter for Simplified -> Traditional
        const cnToTw = await OpenCC.Converter({ from: 'cn', to: 'tw' });
        
        setConverters({ twToCn, cnToTw });
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize OpenCC converters:", error);
      }
    };
    initConverters();
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'zh-TW' ? 'zh-CN' : 'zh-TW'));
  };

  /**
   * Translate text based on source language and current target language.
   * @param {string} text - The text to translate.
   * @param {string} sourceLang - The source language of the text ('zh-TW' or 'zh-CN'). Defaults to 'zh-TW'.
   * @returns {string} - The translated text.
   */
  const t = (text, sourceLang = 'zh-TW') => {
    if (!text || typeof text !== 'string') return text;
    if (!isReady) return text;
    
    // If source and target are same, return text
    if (language === sourceLang) {
      return text;
    }

    // If target is Simplified and source is Traditional -> Convert TW to CN
    if (language === 'zh-CN' && sourceLang === 'zh-TW') {
      return converters.twToCn(text);
    }

    // If target is Traditional and source is Simplified -> Convert CN to TW
    if (language === 'zh-TW' && sourceLang === 'zh-CN') {
      return converters.cnToTw(text);
    }

    return text;
  };

  // Deprecated: Alias for t(text, 'zh-CN') for backward compatibility if needed, 
  // but better to use t(text, source) directly.
  const tData = (text) => t(text, 'zh-CN');

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, tData, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
};
