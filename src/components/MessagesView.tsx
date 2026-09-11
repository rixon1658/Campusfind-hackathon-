import React, { useState, useEffect } from 'react';
import { Message, Item } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
  School,
  ArrowRight,
  Sparkles,
  Inbox,
  ChevronLeft,
} from 'lucide-react';

interface MessagesViewProps {
  initialItemId?: string;
  initialReceiverId?: string;
  items: Item[];
  onSelectItem: (item: Item) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  initialItemId,
  initialReceiverId,
  items,
  onSelectItem,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        setMessages(data.messages || []);

        // If there's an initial item or conversation to focus
        if (data.conversations && data.conversations.length > 0 && !activeConversationId) {
          if (initialItemId) {
            const foundConv = data.conversations.find((c: any) => c.itemId === initialItemId);
            if (foundConv) {
              setActiveConversationId(foundConv.conversationId);
              setMobileShowChat(true);
            } else {
              setActiveConversationId(data.conversations[0].conversationId);
            }
          } else {
            setActiveConversationId(data.conversations[0].conversationId);
          }
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000); // Polling every 6s for lively updates
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to View Messages</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Chat securely with students who reported or found lost campus items.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          Sign In / Demo Login
        </button>
      </div>
    );
  }

  // Find active conversation
  const activeConv = conversations.find(c => c.conversationId === activeConversationId);

  // Filter messages for active thread
  const activeMessages = messages.filter(m => {
    if (!activeConv) return false;
    const isThisItem = m.itemId === activeConv.itemId;
    const isBetweenUsers =
      (m.senderId === currentUser.id && m.receiverId === activeConv.otherUserId) ||
      (m.senderId === activeConv.otherUserId && m.receiverId === currentUser.id);
    return isThisItem && isBetweenUsers;
  });

  // Find associated item details
  const associatedItem = activeConv ? items.find(i => i.id === activeConv.itemId) : null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !activeConv || sending) return;

    setSending(true);
    try {
      const payload = {
        itemId: activeConv.itemId,
        itemTitle: activeConv.itemTitle,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        receiverId: activeConv.otherUserId,
        receiverName: activeConv.otherUserName,
        receiverEmail: activeConv.otherUserEmail,
        content: newMessageText.trim(),
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setNewMessageText('');
        setMessages(prev => [...prev, data.message]);
        fetchMessages();
      } else {
        showToast('error', 'Message Failed', data.error || 'Could not send message.');
      }
    } catch {
      showToast('error', 'Network Error', 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setNewMessageText(text);
  };

  return (
    <div id="messages-view" className="space-y-4 pb-12">
      {/* View Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Campus Student Messages
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate safe returns and verify ownership directly with other campus students.
          </p>
        </div>
      </div>

      {/* Main 2-Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[650px] bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Left Panel: Conversation Threads */}
        <div className={`md:col-span-5 lg:col-span-4 border-r border-slate-800/80 flex flex-col bg-slate-950/40 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Conversations ({conversations.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading messages...</div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                const isActive = conv.conversationId === activeConversationId;
                return (
                  <button
                    key={conv.conversationId}
                    id={`conversation-tab-${conv.conversationId}`}
                    onClick={() => {
                      setActiveConversationId(conv.conversationId);
                      setMobileShowChat(true);
                    }}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                      isActive ? 'bg-blue-600/15 border-l-4 border-blue-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700 shrink-0">
                      <User className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-200 truncate">{conv.otherUserName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-blue-400 truncate mb-1">
                        Re: {conv.itemTitle}
                      </div>

                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage.content}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No message threads yet. Click &quot;Message Student&quot; on any item listing to start a chat!
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className={`md:col-span-7 lg:col-span-8 flex flex-col bg-slate-900/60 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    title="Back to conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeConv.otherUserName}</h3>
                    <p className="text-xs text-slate-400">{activeConv.otherUserEmail}</p>
                  </div>
                </div>

                {/* Associated Item Card Shortcut */}
                {associatedItem && (
                  <button
                    onClick={() => onSelectItem(associatedItem)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <span>View Post</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Item Context Strip */}
              <div className="px-4 py-2 bg-blue-950/30 border-b border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate">
                  Discussing: <span className="font-bold text-blue-300">{activeConv.itemTitle}</span>
                </span>
                <span className="text-[11px] text-blue-400 font-mono shrink-0">Campus Safety Monitored</span>
              </div>

              {/* Messages Bubble History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map(msg => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Suggestions */}
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-500 font-medium shrink-0">Quick replies:</span>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Hi! I saw your post. I think this might be my lost item!')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  &quot;I think this is my item&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Where is a good place to meet on campus to verify it?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  &quot;Where can we meet?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('I turned it over to the Student Union Front Desk for safe keeping.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  &quot;Turned in at Front Desk&quot;
                </button>
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder={`Reply to ${activeConv.otherUserName}...`}
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  id="send-message-btn"
                  type="submit"
                  disabled={!newMessageText.trim() || sending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Select a Conversation</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Pick a conversation from the left to coordinate an item pickup or return.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
