// @file src/components/ChatBot.tsx
// @version 1.1.0
// @lastModified 06-02-2025 17:00 IST

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';

const funFacts = [
  "🏠 Did you know? The first planned city in India was Jaipur!",
  "🌟 Looking for your dream home? I can help!",
  "🏗️ Fun fact: The world's first apartment complex was built in Rome!",
  "🎨 Hey there! Let's talk about your property dreams!",
  "🏰 Interesting: Antilia in Mumbai has 27 floors for just one family!",
  "🌿 Need help finding an eco-friendly home?",
  "🔑 Ready to unlock your property potential?",
  "📝 Got questions? I've got answers!",
  "🌆 Did you know? Chandigarh was designed by Le Corbusier!",
  "🏡 Home is where the heart is, let's find yours!",
  "💡 Pro tip: Location, location, location!",
  "🎵 Knock knock! Who's there? Your property advisor!",
  "🌞 Time to shine in your new home!",
  "✨ Making real estate dreams come true since forever!"
];

const ChatMessage = ({ message, isUser }: { message: string; isUser: boolean }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-[80%] p-3 rounded-lg ${
        isUser
          ? 'bg-sky-600 text-white rounded-br-none'
          : 'bg-sky-100 text-sky-900 rounded-bl-none'
      }`}
    >
      {message}
    </div>
  </div>
);

interface ChatMessageType {
  text: string;
  isUser: boolean;
  timestamp: number;
}

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [currentFact, setCurrentFact] = useState('');
  const [showFact, setShowFact] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [
      {
        text: "Hi! How can I help you with your real estate journey?",
        isUser: false,
        timestamp: Date.now()
      }
    ];
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const factIndexRef = useRef(0);

  // Manage facts rotation
  useEffect(() => {
    if (!isOpen) {
      // Initial delay before showing first fact
      const initialDelay = setTimeout(() => {
        factIndexRef.current = Math.floor(Math.random() * funFacts.length);
        setCurrentFact(funFacts[factIndexRef.current]);
        setShowFact(true);
      }, 5000);

      // Regular interval for subsequent facts
      const factInterval = setInterval(() => {
        // Randomize next fact
        factIndexRef.current = Math.floor(Math.random() * funFacts.length);
        setCurrentFact(funFacts[factIndexRef.current]);
        setShowFact(true);
        
        // Hide fact after 6 seconds
        setTimeout(() => {
          setShowFact(false);
        }, 6000);
      }, 15000 + Math.random() * 5000); // Random interval between 15-20 seconds

      return () => {
        clearInterval(factInterval);
        clearTimeout(initialDelay);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: ChatMessageType = {
      text: message,
      isUser: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    setTimeout(() => {
      const botResponse: ChatMessageType = {
        text: user 
          ? "Thank you for your message. Our team will assist you shortly."
          : "Please sign in to get personalized assistance with your real estate needs.",
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setShowFact(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button with Tooltip */}
      {!isOpen && (
        <div className="relative">
          <Button
            onClick={toggleChat}
            className={`
              rounded-full w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white shadow-lg
              transition-transform duration-300
              ${!isOpen && 'animate-bounce-gentle'}
            `}
          >
            <MessageSquare className={`
              h-6 w-6 
              ${!isOpen && 'animate-pulse-subtle'}
            `} />
          </Button>

          {/* Animated Tooltip */}
          {showFact && (
            <div className="absolute bottom-full right-0 mb-2 w-64 transform transition-all duration-300 ease-in-out">
              <div className="bg-white p-3 rounded-lg shadow-lg border border-sky-100 text-sky-800 text-sm animate-fade-in">
                {currentFact}
                <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-sky-100"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`
          w-96 bg-white shadow-xl transition-all duration-300 ease-in-out
          ${isMinimized ? 'h-14' : 'h-[600px]'}
        `}>
          {/* Header */}
          <div className="p-4 border-b border-sky-100 flex items-center justify-between bg-sky-50">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold text-sky-900">Bhoomitalli Support</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-sky-100 rounded-md text-sky-600"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-sky-100 rounded-md text-sky-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <CardContent 
                ref={chatContentRef}
                className="h-[480px] overflow-y-auto p-4 space-y-4"
              >
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.timestamp + index}
                    message={msg.text}
                    isUser={msg.isUser}
                  />
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="p-4 border-t border-sky-100">
                <form onSubmit={handleSend} className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border-sky-200 focus:border-sky-500"
                  />
                  <Button 
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}

      <style jsx global>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;