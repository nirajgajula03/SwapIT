import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ChatConversation, ChatMessage } from '../types';
import {
  MessagesIcon,
  PaperAirplaneIcon,
  SearchIcon,
  ClockIcon,
} from '../components/Icons';

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    item: {
      id: 'item-101',
      name: 'Sony WH-1000XM4 Headphones',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    },
    otherUser: {
      username: 'alex_trader',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    lastMessage: {
      text: 'Would you be open to adding 15 SwapCoins with the swap?',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      senderUsername: 'alex_trader',
    },
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    item: {
      id: 'item-102',
      name: 'Vintage Film Camera',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
    },
    otherUser: {
      username: 'sarah_m',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
    lastMessage: {
      text: 'Awesome! I can ship it tomorrow morning via priority carrier.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      senderUsername: 'current_user',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    item: {
      id: 'item-103',
      name: 'Retro Mechanical Keyboard',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
    },
    otherUser: {
      username: 'kevin_keys',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    lastMessage: {
      text: 'What switches does it have? Cherry MX Blue or Brown?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      senderUsername: 'kevin_keys',
    },
    unreadCount: 0,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderUsername: 'alex_trader',
      text: 'Hi there! I saw your headphones listing. Are the ear cushions in good shape?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderUsername: 'current_user',
      text: 'Hey Alex! Yes, brand new replacement cushions were installed last month.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderUsername: 'alex_trader',
      text: 'Would you be open to adding 15 SwapCoins with the swap?',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'm-4',
      conversationId: 'conv-2',
      senderUsername: 'sarah_m',
      text: 'I received the swap proposal for the film camera!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'm-5',
      conversationId: 'conv-2',
      senderUsername: 'current_user',
      text: 'Awesome! I can ship it tomorrow morning via priority carrier.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ],
  'conv-3': [
    {
      id: 'm-6',
      conversationId: 'conv-3',
      senderUsername: 'kevin_keys',
      text: 'What switches does it have? Cherry MX Blue or Brown?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeConvId, setActiveConvId] = useState<string>(
    conversationId || INITIAL_CONVERSATIONS[0].id
  );
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (conversationId && conversationId !== activeConvId) {
      setActiveConvId(conversationId);
    }
  }, [conversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const activeMessages = messagesMap[activeConvId] || [];

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    navigate(`/messages/${id}`);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const myUsername = currentUser?.username || 'current_user';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderUsername: myUsername,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: {
                text: inputText.trim(),
                timestamp: new Date().toISOString(),
                senderUsername: myUsername,
              },
            }
          : c
      )
    );

    setInputText('');
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.lastMessage.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto flex flex-col md:flex-row bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Left Column: Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Search header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#001233] dark:text-[#EFEFDE]">
              Messages
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2A67C9]">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-200 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;

            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-[#001845]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#001845]/50'
                }`}
              >
                {/* User avatar with item thumbnail inset */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.otherUser.avatarUrl}
                    alt={conv.otherUser.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <img
                    src={conv.item.imageUrl}
                    alt=""
                    className="w-5 h-5 rounded-md object-cover absolute -bottom-1 -right-1 border border-white dark:border-[#001233] shadow-xs"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#001233] dark:text-[#EFEFDE] truncate">
                      @{conv.otherUser.username}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-1">
                      {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#2A67C9] dark:text-[#E9D8A6] truncate mb-0.5">
                    {conv.item.name}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conv.lastMessage.text}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#2A67C9] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-[#001233]">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-[#001233] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeConversation.otherUser.avatarUrl}
                  alt={activeConversation.otherUser.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <h3 className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE]">
                    @{activeConversation.otherUser.username}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span>Negotiating for:</span>
                    <span className="font-medium text-[#2A67C9] dark:text-[#E9D8A6]">
                      {activeConversation.item.name}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={activeConversation.item.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 hidden sm:block"
                />
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {activeMessages.map((msg) => {
                const isMe =
                  msg.senderUsername === (currentUser?.username || 'current_user') ||
                  msg.senderUsername === 'current_user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#2A67C9] text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#001845] text-[#001233] dark:text-[#EFEFDE] border border-gray-200 dark:border-gray-700 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white dark:bg-[#001233] border-t border-gray-200 dark:border-gray-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-200 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-40 text-white transition flex-shrink-0 cursor-pointer shadow-sm"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <MessagesIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <h3 className="font-bold text-sm text-gray-600 dark:text-gray-400">
              Select a conversation to start chatting
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
