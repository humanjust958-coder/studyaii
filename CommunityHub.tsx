import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageCircle, Heart, Share2, Search, PlusCircle, Trophy, UserPlus, BookOpen, Flame, Zap, Award, Filter, ArrowRight, Send, ArrowLeft, MoreVertical, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { useUser } from '../store/UserContext';
import { useStickyState } from '../lib/hooks';

// Interfaces
interface Post {
  id: string;
  author: string;
  authorLevel: number;
  avatar: string;
  content: string;
  topic: string;
  likes: number;
  timeAgo: string;
  liked?: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: number;
  joined?: boolean;
  color: string;
}

interface Buddy {
  id: string;
  name: string;
  matchScore: number;
  strongSubject: string;
  weakSubject: string;
  streak: number;
}

interface Leader {
  id: string;
  name: string;
  xp: number;
  streak: number;
  quizzes: number;
  avatar: string;
}

// Default empty state for live app
const MOCK_POSTS: Post[] = [];

const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "General Discussion", description: "Welcome to StudyGenie! Introduce yourself here.", subject: "General", members: 1, joined: false, color: "from-blue-500 to-cyan-500" },
  { id: "g2", name: "STEM Scholars", description: "Math, Physics, Chemistry, Biology.", subject: "Science", members: 1, color: "from-emerald-500 to-teal-500" },
  { id: "g3", name: "Humanities Hub", description: "History, Geography, Civics, Economics.", subject: "Humanities", members: 1, color: "from-purple-500 to-fuchsia-500" },
];

const MOCK_BUDDIES: Buddy[] = [];

const MOCK_LEADERBOARD: Leader[] = [];

type TabType = 'feed' | 'groups' | 'buddies' | 'leaderboard';

type ActiveChat = {
  type: 'group' | 'buddy';
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  subtitle?: string;
} | null;

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  senderName?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function CommunityHub() {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [posts, setPosts] = useStickyState<Post[]>(MOCK_POSTS, 'studygenie_community_posts_live');
  const [groups, setGroups] = useStickyState<Group[]>(MOCK_GROUPS, 'studygenie_community_groups_live');
  const [newPost, setNewPost] = useState('');
  const [topic, setTopic] = useState('General');
  const [feedFilter, setFeedFilter] = useState('All');

  // WhatsApp-like chat state
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChat]);

  if (!profile) return null;

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Math.random().toString(36).substring(7),
      author: profile.name,
      authorLevel: profile.level || 1,
      avatar: profile.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
      content: newPost,
      topic: topic,
      likes: 0,
      timeAgo: "Just now"
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setFeedFilter('All');
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked };
      }
      return p;
    }));
  };

  const handleJoinGroup = (id: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g));
  };

  const filteredPosts = useMemo(() => {
    if (feedFilter === 'All') return posts;
    return posts.filter(p => p.topic === feedFilter);
  }, [posts, feedFilter]);

  const allTopics = ['All', ...Array.from(new Set(posts.map(p => p.topic)))];

  const openChat = (chat: ActiveChat) => {
    setActiveChat(chat);
    
    // Generate some mock messages based on type
    if (chat?.type === 'group') {
      setChatMessages([
        { id: '1', text: 'Hey guys, did we have homework for calc?', sender: 'them', time: '10:00 AM', senderName: 'Alice' },
        { id: '2', text: 'Yeah, page 42, evens only.', sender: 'them', time: '10:05 AM', senderName: 'Bob' }
      ]);
    } else if (chat?.type === 'buddy') {
      setChatMessages([
        { id: '1', text: `Hi! I saw we matched. I can help with ${chat.subtitle?.split(' • ')[0] || 'your subjects'}.`, sender: 'them', time: 'Yesterday', senderName: chat.name.split(' ')[0] },
        { id: '2', text: 'That would be awesome! When are you free?', sender: 'me', time: 'Yesterday' },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    setChatMessages([
      ...chatMessages,
      { 
        id: Math.random().toString(36).substring(7), 
        text: newMessage, 
        sender: 'me', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
    setNewMessage('');
    
    // Simulate reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          text: activeChat.type === 'group' ? 'Great point!' : 'Sounds good to me!',
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: activeChat.type === 'group' ? 'Sarah M.' : activeChat.name.split(' ')[0]
        }
      ]);
    }, 2000);
  };

  if (activeChat) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] relative z-10 flex flex-col bg-[rgba(15,23,42,0.95)] border border-[rgba(255,255,255,0.1)] rounded-3xl overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.05)] border-b border-[rgba(255,255,255,0.1)] shadow-sm backdrop-blur-md relative z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveChat(null)} 
              className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-all text-[var(--color-text-secondary)] hover:text-white hover:-translate-x-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 cursor-pointer group">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg border border-white/20 transform group-hover:scale-105 transition-all
                 ${activeChat.type === 'group' ? `bg-gradient-to-br ${activeChat.color || 'from-blue-500 to-cyan-500'}` : 'bg-gradient-to-br from-emerald-400 to-teal-600'}
               `}>
                 {activeChat.avatar || activeChat.name.charAt(0)}
               </div>
               <div>
                 <h3 className="font-bold text-white text-lg leading-tight group-hover:text-teal-300 transition-colors">{activeChat.name}</h3>
                 <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                   {activeChat.type === 'group' ? (
                     <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {activeChat.subtitle} members</span>
                   ) : (
                     <>
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {activeChat.subtitle}
                     </>
                   )}
                 </p>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-[var(--color-text-secondary)]">
            <button className="p-2 md:p-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-teal-400 rounded-full transition-colors"><Video className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button className="p-2 md:p-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-teal-400 rounded-full transition-colors"><Phone className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button className="p-2 md:p-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-white rounded-full transition-colors"><Search className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button className="p-2 md:p-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-white rounded-full transition-colors hidden sm:block"><MoreVertical className="w-5 h-5 md:w-6 md:h-6" /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative hide-scrollbar">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
          
          <div className="flex justify-center my-6">
             <span className="bg-[rgba(0,0,0,0.4)] text-[var(--color-text-secondary)] text-xs font-bold px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.05)]">
               Today
             </span>
          </div>
          
          {chatMessages.map(msg => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'them' && activeChat.type === 'group' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-3 mt-1">
                  {msg.senderName?.charAt(0)}
                </div>
              )}
              
              <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'them' && activeChat.type === 'group' && (
                  <span className="text-[10px] text-[var(--color-text-secondary)] ml-1 mb-1 font-bold">{msg.senderName}</span>
                )}
                <div className={`max-w-[280px] sm:max-w-md lg:max-w-lg px-5 py-3 shadow-xl relative ${
                  msg.sender === 'me' 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl rounded-tr-sm shadow-teal-500/20' 
                    : 'bg-[#1e293b] border border-slate-700/50 text-white rounded-2xl rounded-tl-sm'
                }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${msg.sender === 'me' ? 'text-teal-100 justify-end' : 'text-slate-400 justify-start'}`}>
                    {msg.time}
                    {msg.sender === 'me' && <svg className="w-3 h-3 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} className="h-1 text-transparent">End</div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[rgba(255,255,255,0.03)] border-t border-[rgba(255,255,255,0.1)] backdrop-blur-lg relative z-20">
           <div className="flex items-end gap-2 md:gap-3 max-w-4xl mx-auto bg-[#0f172a] rounded-3xl p-1.5 md:p-2 border border-slate-700/50 shadow-inner">
             <button className="p-3 md:p-4 text-slate-400 hover:text-teal-400 transition-colors shrink-0 rounded-full hover:bg-[rgba(255,255,255,0.05)]">
               <Smile className="w-6 h-6 md:w-7 md:h-7" />
             </button>
             <button className="p-3 md:p-4 text-slate-400 hover:text-teal-400 transition-colors shrink-0 rounded-full hover:bg-[rgba(255,255,255,0.05)]">
               <Paperclip className="w-6 h-6 md:w-7 md:h-7" />
             </button>
             <div className="flex-1 min-w-0">
               <textarea 
                 className="w-full bg-transparent border-none px-2 py-3 md:py-4 focus:outline-none transition-colors text-white resize-none text-[15px] md:text-base max-h-32 placeholder-slate-500 hide-scrollbar"
                 placeholder={activeChat.type === 'group' ? `Message ${activeChat.name}...` : `Message ${activeChat.name.split(' ')[0]}...`}
                 rows={1}
                 value={newMessage}
                 onChange={e => {
                   setNewMessage(e.target.value);
                   e.target.style.height = 'auto';
                   e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                 }}
                 onKeyDown={e => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSendMessage();
                     if (e.target) (e.target as HTMLTextAreaElement).style.height = 'auto';
                   }
                 }}
               />
             </div>
             <button 
               onClick={() => {
                 handleSendMessage();
               }}
               disabled={!newMessage.trim()}
               className="p-3 md:p-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
             >
               <Send className="w-6 h-6 md:w-7 md:h-7" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative z-10">
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/20">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              Community Hub
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">Connect with million of students globally. Learn, share, and grow together.</p>
          </div>
          <span className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-400 px-4 py-1.5 text-xs font-bold rounded-full border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">LIVE NETWORK</span>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap bg-[rgba(0,0,0,0.3)] p-1.5 rounded-2xl mb-8 gap-1 border border-[rgba(255,255,255,0.05)]">
          {[
            { id: 'feed', icon: <MessageCircle className="w-4 h-4" />, label: 'Global Feed' },
            { id: 'groups', icon: <Users className="w-4 h-4" />, label: 'Study Groups' },
            { id: 'buddies', icon: <UserPlus className="w-4 h-4" />, label: 'Find a Buddy' },
            { id: 'leaderboard', icon: <Trophy className="w-4 h-4" />, label: 'Leaderboard' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${
                activeTab === tab.id ? 'text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/80 to-cyan-600/80 -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="flex justify-center items-center gap-2 relative z-10">
                {tab.icon} {tab.label}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              {/* Create Post */}
              <div className="bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-transparent border border-[rgba(255,255,255,0.1)] rounded-3xl p-5 flex gap-4 shadow-xl shadow-black/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-colors"></div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-teal-500/20 border border-white/20">
                  {profile.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 space-y-4">
                   <textarea 
                     className="w-full bg-transparent border-none focus:outline-none resize-none px-2 py-2 min-h-[60px] text-white placeholder-[var(--color-text-secondary)] text-lg" 
                     placeholder="What's your latest study breakthrough?"
                     value={newPost}
                     onChange={e => setNewPost(e.target.value)}
                   />
                   <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-4">
                     <select 
                       className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500/50 transition-colors hover:bg-[rgba(255,255,255,0.05)] text-white"
                       value={topic}
                       onChange={e => setTopic(e.target.value)}
                     >
                       <option className="bg-[#0f172a]">General</option>
                       <option className="bg-[#0f172a]">Math</option>
                       <option className="bg-[#0f172a]">Science</option>
                       <option className="bg-[#0f172a]">History</option>
                       <option className="bg-[#0f172a]">Tips & Tricks</option>
                     </select>
                     <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={handlePost}
                       disabled={!newPost.trim()}
                       className="bg-gradient-to-r from-teal-400 to-cyan-600 shadow-lg shadow-cyan-500/20 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                       <Send className="w-4 h-4" /> Post
                     </motion.button>
                   </div>
                </div>
              </div>

              {/* Feed Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-4 h-4 text-[var(--color-text-secondary)] mr-2 shrink-0" />
                {allTopics.map(t => (
                  <button 
                    key={t}
                    onClick={() => setFeedFilter(t)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${feedFilter === t ? 'bg-white text-black border-white shadow-md' : 'bg-transparent text-[var(--color-text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Feed */}
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                <AnimatePresence>
                  {filteredPosts.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-[var(--color-text-secondary)] font-medium">
                      No posts found in this topic yet. Be the first to share!
                    </motion.div>
                  )}
                  {filteredPosts.map(post => (
                    <motion.div variants={itemVariants} layout key={post.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 hover:bg-[rgba(255,255,255,0.03)] transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center font-bold text-[var(--color-text-primary)] text-lg">
                             {post.avatar}
                           </div>
                           <div>
                             <p className="font-bold text-white flex items-center gap-2 text-lg">
                               {post.author} 
                               <span className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                                 <Zap className="w-3 h-3"/> L{post.authorLevel}
                               </span>
                             </p>
                             <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                               <span>{post.timeAgo}</span>
                               <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.2)]"></span>
                               <span className="text-brand-blue">{post.topic}</span>
                             </div>
                           </div>
                         </div>
                      </div>
                      <p className="text-[var(--color-text-primary)] leading-relaxed mb-6 text-[15px] whitespace-pre-wrap">{post.content}</p>
                      
                      <div className="flex items-center gap-8 text-[var(--color-text-secondary)] border-t border-[rgba(255,255,255,0.05)] pt-4 mt-4">
                         <button 
                           onClick={() => handleLike(post.id)} 
                           className={`flex items-center gap-2 transition-colors text-sm font-medium ${post.liked ? 'text-rose-500' : 'hover:text-rose-400'}`}
                         >
                           <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} /> {post.likes}
                         </button>
                         <button className="flex items-center gap-2 hover:text-teal-400 transition-colors text-sm font-medium">
                           <MessageCircle className="w-5 h-5" /> Reply
                         </button>
                         <button className="flex items-center gap-2 hover:text-white transition-colors text-sm font-medium ml-auto">
                           <Share2 className="w-5 h-5" />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
               <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent p-4 rounded-2xl border border-[rgba(255,255,255,0.05)] gap-4">
                 <div className="flex items-center gap-3 w-full bg-[rgba(0,0,0,0.3)] px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] focus-within:border-teal-500/50 transition-colors">
                   <Search className="w-5 h-5 text-[var(--color-text-secondary)]" />
                   <input type="text" placeholder="Search study groups..." className="bg-transparent border-none focus:outline-none flex-1 text-sm text-white" />
                 </div>
                 <button className="w-full sm:w-auto shrink-0 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                   <PlusCircle className="w-5 h-5" /> New Group
                 </button>
               </div>
               
               <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {groups.map(group => (
                   <motion.div 
                     variants={itemVariants} 
                     key={group.id} 
                     onClick={() => openChat({ type: 'group', id: group.id, name: group.name, subtitle: `${group.members} members`, color: group.color })}
                     className="cursor-pointer relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)] transition-all group overflow-hidden"
                   >
                     <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${group.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`}></div>
                     <div className="flex justify-between items-start mb-4 relative z-10">
                       <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{group.name}</h4>
                       <span className={`bg-gradient-to-r ${group.color} text-white opacity-90 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm`}>{group.subject}</span>
                     </div>
                     <p className="text-sm text-[var(--color-text-secondary)] mb-8 h-10 leading-relaxed relative z-10">{group.description}</p>
                     <div className="flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.05)] relative z-10">
                       <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
                         <Users className="w-4 h-4" /> {group.members} Members
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
                         className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${group.joined ? 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:bg-[rgba(244,63,94,0.1)] hover:text-rose-400 hover:shadow-rose-500/10' : `bg-gradient-to-r ${group.color} text-white hover:opacity-90 hover:-translate-y-0.5`}`}
                       >
                         {group.joined ? 'Leave Group' : 'Join Group'}
                       </button>
                     </div>
                   </motion.div>
                 ))}
               </motion.div>
            </motion.div>
          )}

          {activeTab === 'buddies' && (
            <motion.div key="buddies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="relative overflow-hidden text-center p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl mb-8 group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                 <h3 className="relative z-10 text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3 flex items-center justify-center gap-2">
                   <Zap className="w-8 h-8 text-emerald-400" /> AI Buddy Matcher
                 </h3>
                 <p className="relative z-10 text-[var(--color-text-secondary)] text-lg max-w-lg mx-auto">We analyzed your learning patterns and found these perfect study partners to complement your skills.</p>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {MOCK_BUDDIES.map(buddy => (
                   <motion.div variants={itemVariants} key={buddy.id} className="group bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-display font-bold text-white text-3xl shadow-xl shadow-teal-500/20 border border-white/20 transform group-hover:rotate-6 transition-transform">
                          {buddy.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#0f172a] rounded-full p-1 border border-white/10">
                          <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/40">
                             <Zap className="w-3 h-3 fill-white"/> {buddy.matchScore}%
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-white text-xl mb-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                          {buddy.name}
                          <span className="bg-[rgba(245,158,11,0.1)] border border-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-md flex items-center justify-center gap-1 w-fit mx-auto sm:mx-0">
                             <Flame className="w-3.5 h-3.5 fill-orange-400" /> {buddy.streak} Day Tracker
                          </span>
                        </h4>
                        <div className="flex flex-col gap-2 text-sm">
                           <div className="flex items-center justify-between bg-[rgba(255,255,255,0.02)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.03)]">
                             <span className="text-[var(--color-text-secondary)]">Can teach you:</span> 
                             <span className="font-bold text-brand-blue">{buddy.strongSubject}</span>
                           </div>
                           <div className="flex items-center justify-between bg-[rgba(255,255,255,0.02)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.03)]">
                             <span className="text-[var(--color-text-secondary)]">Needs help in:</span> 
                             <span className="font-bold text-rose-400">{buddy.weakSubject}</span>
                           </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openChat({ type: 'buddy', id: buddy.id, name: buddy.name, subtitle: `${buddy.strongSubject} • Online` })}
                        className="w-full sm:w-14 h-12 sm:h-14 shrink-0 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-brand-blue hover:border-brand-blue hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/25"
                      >
                        <MessageCircle className="w-6 h-6" /> <span className="sm:hidden ml-2 font-bold">Message</span>
                      </button>
                   </motion.div>
                 ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20 rounded-3xl mb-8">
                 <div>
                   <h3 className="text-2xl font-display font-bold text-brand-gold flex items-center gap-2">
                     <Award className="w-8 h-8" /> Global Rankings
                   </h3>
                   <p className="text-[var(--color-text-secondary)] text-sm mt-1">Climb the leaderboard by earning XP and maintaining streaks.</p>
                 </div>
                 <div className="hidden sm:block text-right">
                   <div className="text-sm text-[var(--color-text-secondary)]">Your Rank</div>
                   <div className="text-3xl font-display font-bold text-white">#14,208</div>
                 </div>
               </div>

               <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-3xl overflow-hidden">
                 <div className="flex justify-between items-center px-6 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                   <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Rank & Scholar</div>
                   <div className="hidden sm:flex gap-12 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right pr-4">
                     <div className="w-16">Streak</div>
                     <div className="w-20">Quizzes</div>
                     <div className="w-20">Total XP</div>
                   </div>
                   <div className="sm:hidden text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">XP</div>
                 </div>

                 <motion.div variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-[rgba(255,255,255,0.02)]">
                   {MOCK_LEADERBOARD.map((leader, index) => (
                     <motion.div variants={itemVariants} key={leader.id} className={`flex items-center justify-between p-6 transition-colors hover:bg-[rgba(255,255,255,0.02)] ${index < 3 ? 'bg-[rgba(255,255,255,0.015)]' : ''}`}>
                       <div className="flex items-center gap-5">
                         <span className={`font-display font-bold text-2xl w-8 text-center ${index === 0 ? 'text-[#FBBF24] drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : index === 1 ? 'text-[#94A3B8] drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]' : index === 2 ? 'text-[#B45309] drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]' : 'text-[var(--color-text-secondary)] text-xl'}`}>
                           #{index + 1}
                         </span>
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-amber-500/20 border border-yellow-200/50' : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-500/20 border border-slate-200/50' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg shadow-orange-500/20 border border-orange-300/50' : 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.05)] leading-none'}`}>
                            {leader.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2 text-lg">
                              {leader.name} {index === 0 && <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />}
                            </div>
                            <div className="sm:hidden text-xs text-brand-orange mt-1 flex items-center gap-1">
                               <Flame className="w-3 h-3 fill-orange-400" /> {leader.streak} Days
                            </div>
                          </div>
                       </div>

                       <div className="flex gap-12 text-right items-center">
                          <div className="hidden sm:flex w-16 items-center justify-end gap-1.5 font-mono text-brand-orange text-base"><Flame className="w-4 h-4 fill-orange-400"/>{leader.streak}</div>
                          <div className="hidden sm:block w-20 font-mono text-emerald-400 text-base">{leader.quizzes}</div>
                          <div className="w-20 font-mono font-bold text-brand-purple text-lg flex items-center justify-end gap-1">
                            {leader.xp.toLocaleString()} <span className="text-xs text-[var(--color-text-secondary)] opacity-50 font-sans">XP</span>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                 </motion.div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

