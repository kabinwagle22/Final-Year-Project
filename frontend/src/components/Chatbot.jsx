import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, ShieldAlert } from 'lucide-react';

const Chatbot = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW: Track loading state
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your CVD Assistant. How can I help you understand your heart health today?" }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]); // Scroll when loading starts too

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('http://127.0.0.1:5001/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      // Note: Backend uses data.response
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all active:scale-95"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
            <Bot size={20} />
            <span className="font-bold">Heart AI Assistant</span>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm italic text-xs text-slate-400">
                  AI is analyzing your health data...
                </div>
              </div>
            )}
          </div>

          {/* NEW: Safety Disclaimer Section */}
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2">
            <ShieldAlert size={14} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 italic leading-tight">
              CVD-AI is for educational use. Not a medical substitute. In emergency, contact local services.
            </span>
          </div>

          <div className="p-4 border-t bg-white flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className={`bg-blue-600 text-white p-2 rounded-xl transition ${isLoading ? 'opacity-50' : 'hover:bg-blue-700'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;