import React, { useState } from 'react';
import { MessageSquare, Send, RefreshCw, Sparkles, Scale, AlertCircle } from 'lucide-react';
import { FinancialOutputs, NeighborhoodData, PropertyConfig } from '../types';

interface AskAdvisorChatProps {
  config: PropertyConfig;
  financials: FinancialOutputs;
  neighborhood: NeighborhoodData;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Can I rent my English basement without the 90-day cap if I live upstairs in the primary residence?',
  'What are the penalties if an LLC or investor lists a secondary D.C. condo on Airbnb?',
  'How do I apply for the D.C. DLCP 180-day temporary relocation hardship exemption?',
  'How should I price during the Cherry Blossom Festival vs. the August congressional recess?',
  'Do I need a separate Certificate of Occupancy for my basement ADU to get a DLCP license?',
];

export const AskAdvisorChat: React.FC<AskAdvisorChatProps> = ({
  config,
  financials,
  neighborhood,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your D.C. Short-Term Rental Viability & Compliance Advisor. I can answer specific legal questions regarding D.C. DLCP licensing, Title 30 Chapter 2, 14.95% transient tax rules, English basement C of O mandates, or localized pricing strategies for ${neighborhood.name}. What questions do you have?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          propertyConfig: config,
          financialOutputs: financials,
          neighborhood,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error processing consultation');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer || 'No response received from advisor.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with D.C. Advisor service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#121824] rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="p-5 border-b border-slate-800 bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00C805]/10 text-[#00C805] flex items-center justify-center font-bold text-xs">
            <Scale className="w-4 h-4 text-[#00C805]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              D.C. STR Legal & Market Consultation
            </h3>
            <p className="text-xs text-slate-400">
              Grounded in D.C. Law 22-307, DLCP regulations, and {neighborhood.name} market metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#00C805] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#00C805] animate-pulse"></span>
          Gemini 3.8 Flash Online
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#00C805] text-black font-semibold shadow-md'
                  : 'bg-[#0B0E14] text-slate-200 border border-slate-800 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0B0E14] text-slate-400 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 border border-slate-800">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00C805]" />
              <span>Analyzing D.C. statutory codes and market data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/80 text-xs text-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-[#0B0E14] border-t border-slate-800 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
          Suggested Consultation Queries
        </span>
        <div className="flex gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 text-xs text-slate-300 bg-[#121824] border border-slate-800 rounded-full hover:border-[#00C805] hover:text-[#00C805] transition-colors whitespace-nowrap shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-slate-800 bg-[#0B0E14] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about D.C. DLCP rules, English basement C of O, HOA issues, or event rates..."
          className="flex-1 text-xs px-4 py-3 bg-[#121824] text-white border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00C805] placeholder:text-slate-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 bg-[#00C805] text-black font-extrabold rounded-full text-xs hover:bg-[#00b004] transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-lg"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
