import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-all duration-200"
      >
        <Globe className="h-[18px] w-[18px]" />
        <span className="hidden md:block text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-premium border border-surface-100 z-50 py-2 animate-slide-down">
          <div className="px-3 pb-2 mb-1 border-b border-surface-100">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Select Language</p>
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              id={`lang-${language.code}`}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                transition-colors duration-150
                ${i18n.language === language.code 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-surface-700 hover:bg-surface-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {i18n.language === language.code && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;