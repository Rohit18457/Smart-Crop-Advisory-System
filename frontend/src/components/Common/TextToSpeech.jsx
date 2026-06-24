import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TextToSpeech = ({ text, className = "" }) => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    // If component unmounts, stop speaking
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Listen for speech synthesis end events globally just in case
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const getLanguageCode = () => {
    switch(i18n.language) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-IN';
    }
  };

  const handleSpeak = () => {
    if (!isSupported) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any ongoing speech first

    // Strip markdown formatting if present
    const cleanText = text.replace(/[*_#`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getLanguageCode();
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported || !text) return null;

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isSpeaking 
          ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
          : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
      } ${className}`}
      title={isSpeaking ? "Stop Reading" : "Read Aloud"}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
};

export default TextToSpeech;
