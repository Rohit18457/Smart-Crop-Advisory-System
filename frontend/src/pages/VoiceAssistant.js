import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle,
  Send,
  Sparkles,
  Zap,
  BookOpen,
  Lightbulb,
  Bot,
  User
} from 'lucide-react';
import Card from '../components/Common/Card';
import { sendChatMessage } from '../api';

const VoiceAssistant = () => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m AgriSmart AI, your agricultural assistant powered by AI. Ask me anything about crops, diseases, weather, market prices, or farming practices. You can type or use voice input!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Web Speech API for voice input ─────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        setIsListening(false);
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // ── Send message to Groq AI ────────────────────────────────────────────
  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setTranscript('');
    setIsProcessing(true);

    try {
      // Send conversation history for context
      const history = messages.slice(-10).map(m => ({
        type: m.type,
        content: m.content
      }));

      const data = await sendChatMessage(messageText.trim(), history);
      
      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        speakText(data.reply);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Sorry, I encountered an error: ${data.error}. Please try again.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Connection error: ${err.message}. Make sure the backend server is running.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Text-to-Speech ─────────────────────────────────────────────────────
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const quickQuestions = [
    { text: 'What crops grow best in clay soil with high humidity?', emoji: '🌱' },
    { text: 'How to treat late blight in tomatoes?', emoji: '🍅' },
    { text: 'Best fertilizer schedule for wheat?', emoji: '🌾' },
    { text: 'Tips for organic pest control', emoji: '🐛' },
    { text: 'When to harvest rice in Maharashtra?', emoji: '📅' }
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('voiceAssistant')}</h1>
        <p className="text-surface-500 mt-1">AI-powered assistant using Groq LLaMA 3.3 — ask by voice or text</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Controls */}
        <Card title="Voice Controls" icon={Mic} iconBg="bg-violet-100" iconColor="text-violet-600">
          <div className="space-y-5">
            {/* Voice Button */}
            <div className="text-center py-4">
              <div className="relative inline-flex">
                {isListening && (
                  <>
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500 animate-ping opacity-20 m-auto" />
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-red-500 animate-ping opacity-10 m-auto" style={{ animationDelay: '0.3s' }} />
                  </>
                )}
                <button
                  onClick={isListening ? stopListening : startListening}
                  id="voice-input-btn"
                  className={`
                    relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                    ${isListening 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 scale-110' 
                      : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:scale-105'
                    }
                  `}
                >
                  {isListening ? (
                    <MicOff className="h-10 w-10 text-white" />
                  ) : (
                    <Mic className="h-10 w-10 text-white" />
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm text-surface-600 font-medium">
                {isListening ? (
                  <span className="flex items-center justify-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Listening...
                  </span>
                ) : (
                  'Tap to start listening'
                )}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 animate-fade-in">
                <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">You said</p>
                <p className="text-sm text-sky-800 font-medium">"{transcript}"</p>
              </div>
            )}

            {/* Voice Output */}
            <div className="pt-4 border-t border-surface-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-surface-700">Voice Response</span>
                <button
                  onClick={isSpeaking ? stopSpeaking : () => {}}
                  className={`p-2 rounded-xl transition-all ${isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-surface-100 text-surface-400'}`}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-surface-500">
                {isSpeaking ? (
                  <span className="flex items-center gap-2 text-primary-600">
                    <div className="dot-pulse"><span /><span /><span /></div>
                    Speaking response...
                  </span>
                ) : (
                  'Responses will be spoken automatically'
                )}
              </p>
            </div>

            {/* AI Badge */}
            <div className="bg-gradient-to-r from-violet-50 to-primary-50 border border-violet-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-violet-600">Powered by Groq</p>
              <p className="text-[10px] text-surface-500 mt-0.5">LLaMA 3.3 70B Versatile</p>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card title="Chat Assistant" icon={MessageCircle} iconBg="bg-primary-100" iconColor="text-primary-600" noPadding>
            {/* Messages */}
            <div className="h-[420px] overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className="flex items-start gap-2.5 max-w-xs lg:max-w-md">
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`
                        px-4 py-3 rounded-2xl text-sm leading-relaxed
                        ${message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-tr-sm'
                          : 'bg-surface-100 text-surface-800 rounded-tl-sm'
                        }
                      `}
                    >
                      <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                      <p className={`text-[10px] mt-2 ${message.type === 'user' ? 'text-primary-200' : 'text-surface-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center mt-1">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-surface-100 text-surface-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex items-center gap-2">
                        <div className="dot-pulse"><span /><span /><span /></div>
                        <span className="text-sm text-surface-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 pb-6 pt-3 border-t border-surface-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="voice-text-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about crops, diseases, weather, prices..."
                  className="flex-1 input-field"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => handleSendMessage()}
                  id="voice-send-btn"
                  disabled={!inputText.trim() || isProcessing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-4"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Questions */}
      <Card title="Quick Questions" icon={Sparkles} iconBg="bg-amber-100" iconColor="text-amber-600">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(question.text)}
              disabled={isProcessing}
              className="flex items-center gap-3 p-4 text-left bg-surface-50 border border-surface-100 rounded-xl hover:bg-surface-100 hover:border-surface-200 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              <span className="text-xl">{question.emoji}</span>
              <p className="text-sm text-surface-700 font-medium">{question.text}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="AI Features" icon={Zap} iconBg="bg-amber-100" iconColor="text-amber-600">
          <ul className="space-y-3">
            {['Groq LLaMA 3.3 70B model', 'Real-time speech recognition', 'Conversation memory (context)', 'Voice response synthesis', 'Agriculture-specialized AI'].map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Available Topics" icon={BookOpen} iconBg="bg-sky-100" iconColor="text-sky-600">
          <ul className="space-y-3">
            {['Crop recommendations', 'Disease diagnosis & treatment', 'Weather impact on farming', 'Market prices & strategies', 'Organic farming practices'].map((topic, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                {topic}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Tips for Better Results" icon={Lightbulb} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          <ul className="space-y-3">
            {['Speak clearly and slowly', 'Mention your region/state', 'Include soil & weather details', 'Ask one question at a time', 'Use specific crop names'].map((tip, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;