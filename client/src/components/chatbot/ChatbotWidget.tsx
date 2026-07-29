import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Send, Bot, User as UserIcon, Loader2, MapPin, Star,
  BedDouble, ExternalLink, Navigation,
} from 'lucide-react';
import { chatbotApi, type UserLocationParam } from '@/api/chatbot';
import { formatCurrency } from '@/lib/utils';
import type { ChatbotMessage, PGListing } from '@/types';

// Quick prompt options requested by user
const SUGGESTED_PROMPTS = [
  '📍 Find PGs near me',
  '⭐ Find PGs near me with 4+ star reviews',
  '📶 Find PGs near me with WiFi & AC',
];

export function ChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocationParam | null>(null);
  const [locatingStatus, setLocatingStatus] = useState<'idle' | 'locating' | 'ready' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLocated = useRef(false);

  // ── Location Detection — Same logic as HomePage ─────────────────────────────
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLocatingStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        let city = '';
        let area = '';

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
          if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|sublocality&key=${apiKey}`
            );
            const data = await res.json();
            const comps = data.results?.[0]?.address_components ?? [];
            city = comps.find((c: { types: string[] }) => c.types.includes('locality'))?.long_name ?? '';
            area = comps.find((c: { types: string[] }) => c.types.includes('sublocality_level_1'))?.long_name ?? '';
          }

          // Fallback: Nominatim reverse geocoding
          if (!city) {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            city = data.address?.city || data.address?.town || data.address?.village || '';
            area = data.address?.suburb || data.address?.neighbourhood || '';
          }
        } catch {
          // ignore geocode error
        }

        const loc = { lat, lng, city: city || undefined, area: area || undefined };
        setUserLocation(loc);
        setLocatingStatus('ready');
      },
      () => {
        setLocatingStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (isOpen && !hasLocated.current) {
      hasLocated.current = true;
      detectLocation();
    }
  }, [isOpen, detectLocation]);

  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I'm **Anei AI Assistant** 🤖. Tap any option below or type a request to find live PGs from our database!",
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatbotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }));

      const res = await chatbotApi.getRecommendations(textToSend, history, userLocation);

      const botMsg: ChatbotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data?.reply || "Here are matching PGs from our database:",
        recommendations: res.data?.recommendations || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "I ran into an issue connecting to the database search. Please try searching via Browse PGs!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="chatbot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/30 active:scale-95 group cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          {isOpen ? (
            <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Sparkles className="h-6 w-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
            </>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-[420px] rounded-3xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[560px] max-h-[80vh] animate-fade-in transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight tracking-tight">Anei AI Assistant</h3>
                {/* Location indicator */}
                <div className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5 font-medium">
                  {locatingStatus === 'locating' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-sky-200" />
                      <span>Detecting location...</span>
                    </>
                  )}
                  {locatingStatus === 'ready' && userLocation && (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{userLocation.area ? `${userLocation.area}, ` : ''}{userLocation.city || 'Near You'}</span>
                    </>
                  )}
                  {locatingStatus !== 'locating' && locatingStatus !== 'ready' && (
                    <>
                      <Navigation className="h-3 w-3 text-sky-200" />
                      <button onClick={detectLocation} className="underline hover:text-white">Enable GPS</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Text bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md font-medium'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm font-medium'
                    }`}
                  >
                    {m.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    ))}
                  </div>

                  {/* Inline Recommended PG Cards */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Database Listings ({m.recommendations.length})
                      </p>
                      {m.recommendations.map((pg: PGListing) => (
                        <div
                          key={pg._id}
                          className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="flex gap-3 items-center">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 relative">
                              {pg.images?.[0] ? (
                                <img
                                  src={pg.images[0].url}
                                  alt={pg.title}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                  <BedDouble className="h-6 w-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                                {pg.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                {pg.location.address}, {pg.location.city}
                              </p>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="font-extrabold text-blue-600 text-xs">
                                  {formatCurrency(pg.rent)}/mo
                                </span>
                                {pg.ratingAverage ? (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                    <Star className="h-2.5 w-2.5 fill-current text-amber-400" />
                                    {pg.ratingAverage}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/pg/${pg._id}`);
                            }}
                            className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 border border-slate-200 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-blue-600 hover:text-white hover:border-blue-600"
                          >
                            View Details <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 shadow-sm mt-1">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Fetching matching PGs from database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="bg-slate-50 border-t border-slate-100 px-3 py-2.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-slate-100 bg-white p-3 flex items-center gap-2"
          >
            <input
              id="chatbot-input"
              type="text"
              placeholder="Ask e.g. 'Find PGs near me with WiFi'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
