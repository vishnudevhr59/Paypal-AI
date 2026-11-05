import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  CreditCard,
  Split,
  RefreshCw,
  Upload,
  FileText,
  Check,
  ArrowRight,
  Loader2,
  Receipt,
  HelpCircle,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { ParsedIntentResponse, PaymentOrder } from '../types';
import { parsePaymentIntent } from '../services/api';

interface AICopilotProps {
  onTriggerCheckout: (order: PaymentOrder) => void;
  onNavigateToTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intentResult?: ParsedIntentResponse;
  receiptThumbnail?: string;
}

export const AICopilot: React.FC<AICopilotProps> = ({ onTriggerCheckout, onNavigateToTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your Payapp AI Financial Copilot for the PayPal AI Hackathon.\n\nI can parse natural language into real PayPal Sandbox Orders, split group dinner bills, and audit your recurring subscriptions to stop hidden drains.\n\nTry clicking any quick prompt below or type your request!",
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, imageBase64?: string) => {
    const text = textToSend || inputText;
    const img = imageBase64 || uploadedImage;

    if (!text.trim() && !img) return;

    const userMessageId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      receiptThumbnail: img || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const intentData = await parsePaymentIntent(text, img || undefined);

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: intentData.conversationalResponse || intentData.summary || 'I analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentResult: intentData,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I couldn't process that payment command. Please make sure your request includes an amount or recipient, or check your internet connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      handleSendMessage('Please analyze this receipt photo, extract the total, items, and tax, and split or pay it via PayPal.', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleReceipt = () => {
    const samplePrompt = "Split our $128.50 Italian Bistro dinner receipt among 3 people: Alice, Bob, and me. Include 18% tip.";
    handleSendMessage(samplePrompt);
  };

  const handleLoadSampleBill = () => {
    const samplePrompt = "Pay my pending Comcast Xfinity internet bill of $45.00 due next Monday";
    handleSendMessage(samplePrompt);
  };

  const handleLoadSubscriptionAudit = () => {
    const samplePrompt = "Audit my recurring subscriptions: Netflix $22.99/mo, Spotify $16.99/mo, Equinox Gym $50.00/mo (unused), and Google One $2.99/mo. Calculate my monthly burn and find drains.";
    handleSendMessage(samplePrompt);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-2 sm:p-4">
      {/* Top Copilot Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0079C1]/20 border border-[#0079C1]/40 flex items-center justify-center text-[#0079C1] shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Conversational Payment AI</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                Gemini 3.8 Flash + PayPal Orders v2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transform natural language, receipts, and bills into one-click PayPal sandbox payments.
            </p>
          </div>
        </div>

        {/* Quick Demo Buttons for Judges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadSampleBill}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>⚡ Test $45 Bill</span>
          </button>
          <button
            onClick={handleLoadSampleReceipt}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Split className="w-3.5 h-3.5 text-emerald-400" />
            <span>🍕 Test $128 Split</span>
          </button>
          <button
            onClick={handleLoadSubscriptionAudit}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
            <span>🔍 Test Sub Audit</span>
          </button>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-tr from-[#003087] to-[#0079C1] shadow-md shadow-blue-600/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Optional thumbnail if user uploaded an image */}
                {msg.receiptThumbnail && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-h-40">
                    <img
                      src={msg.receiptThumbnail}
                      alt="Uploaded receipt"
                      className="w-full object-cover"
                    />
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="block text-[10px] text-white/50 mt-1.5 text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {/* RENDER STRUCTURED INTENT CARD IF PRESENT */}
              {msg.intentResult && (
                <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-4 text-xs space-y-3.5 shadow-xl animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Parsed Intent: {msg.intentResult.intentType}
                    </span>
                    <span className="text-slate-400 text-[11px]">Ready for PayPal Gateway</span>
                  </div>

                  {/* 1. Payment Order Card (e.g. "Pay Comcast $45") */}
                  {msg.intentResult.paymentOrder && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[11px] text-slate-400">Recipient / Merchant</p>
                          <h4 className="text-sm font-bold text-white">
                            {msg.intentResult.paymentOrder.recipient}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">Total Due</p>
                          <div className="text-lg font-extrabold text-emerald-400">
                            ${msg.intentResult.paymentOrder.amount.toFixed(2)}{' '}
                            <span className="text-xs text-slate-400">
                              {msg.intentResult.paymentOrder.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 text-xs bg-slate-950/60 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-400">Memo: </span>
                        {msg.intentResult.paymentOrder.memo}
                      </div>

                      <button
                        onClick={() => onTriggerCheckout(msg.intentResult!.paymentOrder!)}
                        className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold py-2.5 px-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="font-black italic text-base">
                          Pay<span className="text-[#0079C1]">Pal</span>
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Sandbox Checkout (${msg.intentResult.paymentOrder.amount.toFixed(2)})
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* 2. Bill Split Breakdown Card */}
                  {msg.intentResult.splitBreakdown && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">
                          Total Bill: ${msg.intentResult.splitBreakdown.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {msg.intentResult.splitBreakdown.participants.length} Participants
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.intentResult.splitBreakdown.participants.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60"
                          >
                            <span className="text-slate-200">
                              {p.name} {p.isSelf ? '(You)' : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-400">
                                ${p.amount.toFixed(2)}
                              </span>
                              {!p.isSelf && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      `https://paypal.me/payapp/${p.amount.toFixed(2)}`,
                                      `${msg.id}-${idx}`
                                    )
                                  }
                                  className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 flex items-center gap-1"
                                >
                                  {copiedLink === `${msg.id}-${idx}` ? (
                                    <>
                                      <Check className="w-2.5 h-2.5" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" /> PayPal Link
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onNavigateToTab('splitter')}
                        className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 border border-blue-500/40"
                      >
                        <Split className="w-3.5 h-3.5" />
                        <span>Manage & Track in Smart Split Tab</span>
                      </button>
                    </div>
                  )}

                  {/* 3. Subscription Insights Card */}
                  {msg.intentResult.subscriptionInsights && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Monthly Burn Rate:</span>
                        <span className="font-bold text-red-400">
                          ${msg.intentResult.subscriptionInsights.monthlyBurnRate.toFixed(2)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Identified Savings:</span>
                        <span className="font-bold text-emerald-400">
                          ${msg.intentResult.subscriptionInsights.potentialSavings.toFixed(2)}/mo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        "{msg.intentResult.subscriptionInsights.actionPlan}"
                      </p>
                      <button
                        onClick={() => onNavigateToTab('subscriptions')}
                        className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 border border-yellow-500/40"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>View Subscription Audit Dashboard</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {msg.intentResult.suggestedFollowups && msg.intentResult.suggestedFollowups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.intentResult.suggestedFollowups.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 pl-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#0079C1]" />
            <span>Payapp AI is parsing payment entities & structuring PayPal order...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-3">
        {uploadedImage && (
          <div className="mb-2 p-2 bg-slate-800 rounded-lg flex items-center justify-between border border-blue-500/40">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300 font-medium">Receipt image attached</span>
            </div>
            <button
              onClick={() => setUploadedImage(null)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg focus-within:border-blue-500/80 transition-all"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            title="Upload Bill or Receipt for OCR Parsing"
          >
            <Upload className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a payment request (e.g. 'Pay my internet bill of $45' or 'Split $90 with Dave')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !uploadedImage) || isLoading}
            className="p-2.5 bg-[#0079C1] hover:bg-[#00609C] disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
