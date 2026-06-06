import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  PlusCircle,
  Search,
  Filter,
  User,
  Shield,
  Bell,
  Code2,
  Send,
  Paperclip,
  Check,
  X,
  Trash2,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Camera,
  Activity,
  UserCheck
} from 'lucide-react';

// Design Specs:
// Primary Accent: #6C63FF
// Background canvas: #0A0B0F
// Cards BG: #1A1D26
// Panel Borders: #252836

interface SMMSupportAndSettingsSectionProps {
  activeView: 'support' | 'profile';
  setActiveView: (view: 'support' | 'profile' | string) => void;
  walletBalance: number;
  setWalletBalance: (updater: number | ((prev: number) => number)) => void;
  totalSpent: number;
  setTotalSpent: (updater: number | ((prev: number) => number)) => void;
}

// ==========================================
// MOCK DATA FOR SUPPORT TICKETS & THREADS
// ==========================================
interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  avatar: string;
  timestamp: string;
  text: string;
  attachments?: { name: string; size: string }[];
}

interface SMMTicket {
  id: string;
  subject: string;
  category: 'Orders' | 'Billing' | 'Technical' | 'General';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'Replied' | 'In Progress' | 'Closed';
  lastMessage: string;
  lastUpdated: string;
  unread: boolean;
  orderId?: string;
  messages: TicketMessage[];
}

export default function SMMSupportAndSettingsSection({
  activeView,
  setActiveView,
  walletBalance,
  setWalletBalance,
  totalSpent,
  setTotalSpent
}: SMMSupportAndSettingsSectionProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  
  // ==========================================
  // PAGE A: SUPPORT TICKETS REPOSITORY
  // ==========================================
  const [ticketsList, setTicketsList] = useState<SMMTicket[]>([]);

  useEffect(() => {
    const importFirebase = async () => {
      const { auth, db } = await import('../firebase');
      const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
      
      const user = auth.currentUser;
      if (!user) return;
      
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snap) => {
        const list: SMMTicket[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            subject: d.subject || 'No Subject',
            category: d.category || 'Support',
            priority: d.priority || 'Normal',
            status: d.status || 'Open',
            lastMessage: d.lastMessage || '',
            lastUpdated: d.updatedAt ? new Date(d.updatedAt).toLocaleString() : 'Unknown',
            unread: !!d.unread,
            orderId: d.orderId,
            messages: d.messages || []
          });
        });
        setTicketsList(list);
      });
      return unsub;
    };
    
    let unsubscribe: any = null;
    importFirebase().then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Filtering & searching states
  const [ticketFilterTab, setTicketFilterTab] = useState<'All' | 'Open' | 'Replied' | 'Closed'>('All');
  const [searchTicketQuery, setSearchTicketQuery] = useState('');

  // Ticket creation form modal
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Orders' | 'Billing' | 'Technical' | 'General'>('Orders');
  const [newPriority, setNewPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [newOrderId, setNewOrderId] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{name: string, size: string}[]>([]);

  // Detailed Ticket Response Core State
  const [activeReplyText, setActiveReplyText] = useState('');
  const [activeReplyAttachments, setActiveReplyAttachments] = useState<{name: string, size: string}[]>([]);

  // Open active ticket details helper
  const activeTicket = useMemo(() => {
    return ticketsList.find(t => t.id === selectedTicketId) || null;
  }, [ticketsList, selectedTicketId]);

  // Statistics counters
  const openCount = useMemo(() => ticketsList.filter(t => t.status === 'Open').length, [ticketsList]);
  const progressCount = useMemo(() => ticketsList.filter(t => t.status === 'In Progress').length, [ticketsList]);
  const resolvedCount = useMemo(() => ticketsList.filter(t => t.status === 'Closed').length, [ticketsList]);

  // Ticket filtering pipeline
  const filteredTickets = useMemo(() => {
    return ticketsList.filter(ticket => {
      // 1. Filter tabs logic
      if (ticketFilterTab === 'Open') {
        return ticket.status === 'Open';
      }
      if (ticketFilterTab === 'Replied') {
        return ticket.status === 'Replied' || ticket.status === 'In Progress';
      }
      if (ticketFilterTab === 'Closed') {
        return ticket.status === 'Closed';
      }

      // 2. Search Text
      if (searchTicketQuery.trim() !== '') {
        const q = searchTicketQuery.toLowerCase();
        return (
          ticket.id.toLowerCase().includes(q) ||
          ticket.subject.toLowerCase().includes(q) ||
          ticket.category.toLowerCase().includes(q) ||
          ticket.lastMessage.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ticketsList, ticketFilterTab, searchTicketQuery]);

  // Handle ticket creation submission
  const handleAddNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessageBody.trim()) {
      showToast('Please specify a secure Subject header and primary Message body.');
      return;
    }

    const nextIdNum = ticketsList.length ? Math.max(...ticketsList.map(t => parseInt(t.id.replace('TKT-', '')) || 0)) + 1 : 1;
    const paddingId = String(nextIdNum).padStart(4, '0');
    const newIdString = `TKT-${paddingId}`;

    const newTicketBody: SMMTicket = {
      id: newIdString,
      subject: newSubject,
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      lastMessage: newMessageBody,
      lastUpdated: '1 minute ago',
      unread: false,
      orderId: newOrderId.trim() || undefined,
      messages: [
        {
          id: 'msg-initial',
          sender: 'user',
          senderName: 'You',
          avatar: 'U',
          timestamp: '2026-06-05 23:45',
          text: newMessageBody,
          attachments: attachedFiles.length > 0 ? attachedFiles : undefined
        }
      ]
    };

    setTicketsList(prev => [newTicketBody, ...prev]);
    setShowCreateTicketModal(false);
    
    // Clear Fields
    setNewSubject('');
    setNewCategory('Orders');
    setNewPriority('Normal');
    setNewOrderId('');
    setNewMessageBody('');
    setAttachedFiles([]);
    
    showToast(`Support Ticket ${newIdString} generated and queued for analysis.`);
  };

  const handleSimulateAttachment = () => {
    const mocks = [
      { name: 'payment_screenshot_ref.jpg', size: '254 KB' },
      { name: 'order_status_logs.json', size: '12 KB' },
      { name: 'instagram_page_error.png', size: '512 KB' }
    ];
    const picked = mocks[Math.floor(Math.random() * mocks.length)];
    setAttachedFiles(prev => [...prev, picked]);
    showToast(`Simulated file "${picked.name}" attached successfully.`);
  };

  // Submit reply action
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplyText.trim()) return;

    if (!selectedTicketId) return;

    const replyMsg: TicketMessage = {
      id: `reply-${Math.floor(Math.random() * 90000)}`,
      sender: 'user',
      senderName: 'You',
      avatar: 'U',
      timestamp: '2026-06-05 23:47',
      text: activeReplyText.trim(),
      attachments: activeReplyAttachments.length ? activeReplyAttachments : undefined
    };

    // Append to list State
    setTicketsList(prev => {
      return prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            lastMessage: activeReplyText.trim(),
            lastUpdated: 'Just now',
            status: 'Open', // Resets back to Open upon user trigger
            unread: false,
            messages: [...t.messages, replyMsg]
          };
        }
        return t;
      });
    });

    setActiveReplyText('');
    setActiveReplyAttachments([]);
    showToast('Your message has been updated in the support pipeline.');

    // Simulating Admin Auto-Reply Callback after a block
    setTimeout(() => {
      const adminAnswers = [
         "Thank you. Our DevOps team has logged this log. We are verifying target proxy lists to resolve performance bottlenecks.",
         "Got your confirmation. We have cleared the queue for this campaign. SMM delivery speed should resolve immediately.",
         "Ledger balances verified. Our Stripe gateway manager will balance the transaction and apply manual credits directly to your account.",
         "Thank you for the update. Our support team is looking into this query directly."
      ];
      const selectedResponse = adminAnswers[Math.floor(Math.random() * adminAnswers.length)];

      const adminReply: TicketMessage = {
        id: `admin-reply-${Math.floor(Math.random() * 90000)}`,
        sender: 'admin',
        senderName: 'Alex - Senior Support Specialist',
        avatar: 'A',
        timestamp: '2026-06-05 23:49',
        text: selectedResponse
      };

      setTicketsList(prev => {
        return prev.map(t => {
          if (t.id === selectedTicketId) {
            return {
              ...t,
              lastMessage: selectedResponse,
              lastUpdated: '1 min ago',
              status: 'Replied',
              unread: true,
              messages: [...t.messages, adminReply]
            };
          }
          return t;
        });
      });
    }, 4500);
  };


  // ==========================================
  // PAGE B: PROFILE & SETTINGS SECTION
  // ==========================================
  const [profileTab, setProfileTab] = useState<'profile' | 'security' | 'notifications' | 'api-keys'>('profile');

  // Interactive Form States
  const [profileUsername, setProfileUsername] = useState('cuahangtienloituanhue');
  const [profileEmail, setProfileEmail] = useState('cuahangtienloituanhue@gmail.com');
  const [profileFullName, setProfileFullName] = useState('Tuan Hue Superstore Client');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCountry, setProfileCountry] = useState('Vietnam');
  const [profileTimezone, setProfileTimezone] = useState('UTC+7 (Bangkok, Jakarta)');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Security change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKeysTabKeyVisible, setApiKeysTabKeyVisible] = useState(false);
  const [apiKeysTabKey, setApiKeysTabKey] = useState('ps_live_a23f4g8910bcmx7w8q2zcd1ab1234');

  // Two-Factor Authentication Toggle
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);

  // Profile completion calculation logic
  const profileCompletionPct = useMemo(() => {
    let score = 50; // starts at 50% with default filled values
    if (avatarPreview) score += 10;
    if (profilePhone.trim().length > 6) score += 25;
    if (is2FaEnabled) score += 15;
    return score;
  }, [avatarPreview, profilePhone, is2FaEnabled]);

  // Security Password strength check
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1: return { text: 'Weak', color: 'text-red-400 bg-red-400/10', bar: 'bg-red-400 w-1/4' };
      case 2: return { text: 'Fair', color: 'text-orange-400 bg-orange-400/10', bar: 'bg-orange-400 w-2/4' };
      case 3: return { text: 'Strong', color: 'text-yellow-400 bg-yellow-400/10', bar: 'bg-yellow-400 w-3/4' };
      case 4: return { text: 'Excellent', color: 'text-emerald-400 bg-emerald-400/10', bar: 'bg-emerald-400 w-full' };
      default: return { text: 'Too Short', color: 'text-gray-500 bg-gray-500/10', bar: 'bg-gray-500 w-12' };
    }
  }, [newPassword]);

  // Dynamic Session states
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'Chome Browser (V119) • macOS Sonoma', ip: '113.161.44.12', location: 'Hanoi, Vietnam', active: 'Active Now (Current)', statusToKeep: true },
    { id: 'sess-2', device: 'Safari Web • iPhone 15 Pro Max', ip: '27.76.108.45', location: 'Da Nang, Vietnam', active: '14 hours ago', statusToKeep: true },
    { id: 'sess-3', device: 'Postman Integration Bot Runner', ip: '102.15.228.18', location: 'Tokyo, Japan', active: '3 days ago', statusToKeep: true }
  ]);

  // Notifications toggles
  const [bulletinOrderCompleted, setBulletinOrderCompleted] = useState(true);
  const [bulletinOrderCancelled, setBulletinOrderCancelled] = useState(true);
  const [bulletinLowBalance, setBulletinLowBalance] = useState(true);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState('5.00');
  const [bulletinNewTicketReply, setBulletinNewTicketReply] = useState(true);
  const [bulletinPromo, setBulletinPromo] = useState(false);
  const [bulletinSecurityAlerts, setBulletinSecurityAlerts] = useState(true);

  // Avatar Image Change Simulation
  const handleAvatarMockUpload = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    ];
    const pickedAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatarPreview(pickedAvatar);
    showToast('Secure profile display photo has been uploaded.');
  };

  // Safe password action
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Existing credential validator token is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Verify password validation. Checksum confirmation mismatch.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Min length constraint failed. Credential must comprise 8 characters.');
      return;
    }

    showToast('Database encrypted keys successfully updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Save changes settings
  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Basic identity matrix refreshed in Cloud Account settings.');
  };

  // Revoke session
  const handleRevokeSession = (id: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Secure Web token credentials destroyed. Session terminated.');
  };

  // Revoke all other
  const handleRevokeAllOtherSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.active.includes('Current')));
    showToast('Aggregate terminal identifiers revoked. Logged out on all other nodes.');
  };


  return (
    <div className="space-y-7 pb-10 text-left animate-fade-in relative min-h-screen">
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 bg-[#1A1D26] border-2 border-brand-primary text-white rounded-2xl p-4.5 shadow-2xl z-[999] flex items-center gap-3.5 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-cyan shrink-0">
              <Sparkles size={16} />
            </div>
            <p className="text-xs font-semibold leading-relaxed">{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW A: SUPPORT CENTER TICKETS MODULE
         ========================================================================= */}
      {activeView === 'support' && (
        <div className="space-y-6">
          
          {/* Support Ticket Detail View */}
          <AnimatePresence mode="wait">
            {selectedTicketId && activeTicket ? (
              <motion.div
                key="ticket-detail"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5 text-left"
              >
                {/* Detail Header navigation back */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4.5 pb-4 border-b border-[#252836]">
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#858da8] hover:text-white bg-[#12141A] border border-[#252836] transition-all cursor-pointer shadow-md"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Tickets Registry</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold text-slate-400 font-mono">
                      Ticket ID: <span className="text-white">{activeTicket.id}</span>
                    </span>
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border ${
                      activeTicket.status === 'Open'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : activeTicket.status === 'Replied'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                        : activeTicket.status === 'In Progress'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {activeTicket.status}
                    </span>
                  </div>
                </div>

                {/* Info dashboard bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#12141A] border border-[#252836] rounded-2xl p-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Division / Category</span>
                    <span className="font-extrabold text-white">{activeTicket.category} Support Desk</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Priority Status</span>
                    <span className={`font-black uppercase tracking-wide text-[11px] ${
                      activeTicket.priority === 'Urgent' || activeTicket.priority === 'High' ? 'text-red-400' : 'text-emerald-400'
                    }`}>{activeTicket.priority} Urgent</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Connected SMM Order</span>
                    <span className="font-mono text-brand-cyan select-all font-bold">{activeTicket.orderId || 'None registered'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Latest Update Ping</span>
                    <span className="font-semibold text-gray-300 flex items-center gap-1">
                      <Clock size={12} className="text-[#858da8]" />
                      {activeTicket.lastUpdated}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Subject Box */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-4.5 md:p-6 shadow-md">
                  <h3 className="text-base font-extrabold text-white leading-normal">{activeTicket.subject}</h3>
                </div>

                {/* Live Thread Interactive Message Bubbles container */}
                <div className="bg-[#12141A] border border-[#252836] rounded-2xl p-5 shadow-inner max-h-[500px] overflow-y-auto space-y-6 flex flex-col">
                  {activeTicket.messages.map((message) => {
                    const isUser = message.sender === 'user';
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
                      >
                        {/* Sender Avatar badge */}
                        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-extrabold text-xs border ${
                          isUser
                            ? 'bg-[#6C63FF]/25 border-[#6C63FF]/30 text-[#00D4FF]'
                            : 'bg-[#1A1D26] border-[#252836] text-amber-400'
                        }`}>
                          {message.avatar}
                        </div>

                        {/* Interactive Message Content card */}
                        <div className="space-y-1.5">
                          <div className={`flex items-center gap-2 text-[10px] ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-white font-bold">{message.senderName}</span>
                            <span className="text-gray-500">• {message.timestamp}</span>
                          </div>

                          <div className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-md ${
                            isUser
                              ? 'bg-gradient-to-tr from-[#6C63FF]/90 to-[#6C63FF] text-white rounded-tr-none'
                              : 'bg-[#1A1D26] border border-[#252836] text-gray-200 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-line">{message.text}</p>

                            {/* Attachments UI */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5 text-left">
                                <span className={`text-[9.5px] uppercase font-bold tracking-widest ${isUser ? 'text-white/60' : 'text-gray-500'}`}>
                                  Secure Log Attachments:
                                </span>
                                {message.attachments.map((file, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-center gap-2 bg-[#0A0B0F]/45 border border-[#252836] p-2 rounded-lg text-[10.5px] text-brand-cyan select-all font-mono hover:border-brand-primary cursor-pointer w-fit"
                                  >
                                    <Paperclip size={12} className="shrink-0" />
                                    <span>{file.name}</span>
                                    <span className="text-gray-500 font-sans text-[9px] font-bold">({file.size})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SMM reply box input */}
                <form onSubmit={handleSendTicketReply} className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="relative">
                    <textarea
                      value={activeReplyText}
                      onChange={(e) => setActiveReplyText(e.target.value)}
                      placeholder="Write message reply here..."
                      className="w-full bg-[#12141A] border border-[#252836] rounded-xl p-4.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary min-h-[110px]"
                      required
                    />
                  </div>

                  {activeReplyAttachments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 bg-[#12141A] border border-[#252836] p-2.5 rounded-xl">
                      {activeReplyAttachments.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10.5px] bg-[#1A1D26] border border-[#252836] py-1.5 px-3 rounded-lg text-emerald-400 font-mono">
                          <Paperclip size={12} />
                          <span>{f.name}</span>
                          <button
                            type="button"
                            onClick={() => setActiveReplyAttachments([])}
                            className="text-red-400 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        const file = { name: 'diagnostic_report_sys_v2.json', size: '24 KB' };
                        setActiveReplyAttachments([file]);
                        showToast('Simulated attachment appended to reply.');
                      }}
                      className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-[#12141A] border border-brand-border transition-all cursor-pointer"
                    >
                      <Paperclip size={13} />
                      <span>Attach Logs File</span>
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-brand-primary to-[#00D4FF] hover:opacity-95 shadow-md shadow-brand-primary/10 transition-all cursor-pointer uppercase tracking-tight"
                    >
                      <Send size={13} />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </form>

              </motion.div>
            ) : (
              <motion.div
                key="tickets-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                
                {/* Support Header with New Ticket button */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF4757] uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
                      Interactive Client Center
                    </span>
                    <h3 className="text-lg font-black text-white mt-3">ProSMM Helpdesk Desk</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5">Track, review, or spawn high-priority technical engineering support tickets.</p>
                  </div>

                  <button
                    onClick={() => setShowCreateTicketModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-primary to-brand-cyan hover:opacity-95 shadow-md cursor-pointer transition-all uppercase tracking-normal"
                  >
                    <PlusCircle size={15} />
                    <span>Open New Ticket</span>
                  </button>
                </div>

                {/* Operational statistics counters row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#1A1D26]/60 border border-[#252836] rounded-2xl p-4.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Awaiting Agents</span>
                      <h4 className="text-2xl font-black text-red-400 mt-1">{openCount} Records</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <AlertCircle size={18} />
                    </div>
                  </div>

                  <div className="bg-[#1A1D26]/60 border border-[#252836] rounded-2xl p-4.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">In Dev Processing</span>
                      <h4 className="text-2xl font-black text-blue-400 mt-1">{progressCount} Active</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Clock size={18} />
                    </div>
                  </div>

                  <div className="bg-[#1A1D26]/60 border border-[#252836] rounded-2xl p-4.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resolved tickets</span>
                      <h4 className="text-2xl font-black text-emerald-400 mt-1">{resolvedCount + 44} Tickets</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                </div>

                {/* Filter and search bar row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#12141A] border border-[#252836] rounded-2xl p-4.5">
                  
                  {/* Tabs filter (Column 7) */}
                  <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {['All', 'Open', 'Replied', 'Closed'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTicketFilterTab(tab as any)}
                        className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none whitespace-nowrap ${
                          ticketFilterTab === tab
                            ? 'bg-brand-primary/15 text-brand-cyan border-brand-primary/45 shadow'
                            : 'bg-[#1A1D26] text-gray-400 border-[#252836] hover:text-white'
                        }`}
                      >
                        {tab === 'All' ? '📂 Search All Logged' : `${tab} Tickets`}
                      </button>
                    ))}
                  </div>

                  {/* Search bar input (Column 5) */}
                  <div className="md:col-span-5 relative flex items-center">
                    <Search className="absolute left-3.5 text-gray-500" size={14} />
                    <input
                      type="text"
                      value={searchTicketQuery}
                      onChange={(e) => setSearchTicketQuery(e.target.value)}
                      placeholder="Search tickets text, IDs, categories..."
                      className="w-full bg-[#1A1D26] border border-[#252836] text-xs py-2.5 pl-10 pr-4 rounded-xl text-white outline-none focus:border-brand-primary placeholder:text-gray-600 transition-all"
                    />
                  </div>

                </div>

                {/* Card repository of SMM Tickets */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredTickets.length === 0 ? (
                    <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl py-14 text-center text-gray-500 font-semibold shadow">
                      <AlertCircle className="mx-auto mb-2.5 text-[#5F6375]" size={30} />
                      <p className="text-xs">No active support tickets match requested filters.</p>
                      <button
                        onClick={() => { setSearchTicketQuery(''); setTicketFilterTab('All'); }}
                        className="mt-3.5 text-xs text-brand-cyan hover:underline font-bold bg-transparent cursor-pointer"
                      >
                        Reset applied filters
                      </button>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-[#1A1D26] border border-[#252836] hover:border-brand-primary/30 rounded-2xl p-5 shadow transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden group"
                      >
                        {/* Unread indicator element */}
                        {ticket.unread && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-cyan animate-pulse" title="New admin message reply logged!" />
                        )}

                        <div className="flex-1 space-y-2 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10.5px] px-2.5 py-1 rounded bg-[#12141A] text-gray-300 font-black border border-[#252836] tracking-tight">
                              {ticket.id}
                            </span>

                            <span className="text-[10px] uppercase font-bold text-[#858da8] bg-white/[0.03] border border-white/5 py-1 px-2.5 rounded">
                              {ticket.category}
                            </span>

                            <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded border ${
                              ticket.status === 'Open'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : ticket.status === 'Replied'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : ticket.status === 'In Progress'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {ticket.status}
                            </span>

                            <span className="text-[11px] text-gray-500 flex items-center gap-1 ml-1">
                              <Clock size={11} />
                              {ticket.lastUpdated}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-white leading-snug group-hover:text-brand-cyan transition-colors">
                            {ticket.subject}
                          </h4>

                          <p className="text-xs text-brand-text-secondary font-medium leading-relaxed max-w-3xl line-clamp-1 italic block pr-3">
                            "{ticket.lastMessage}"
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            // Simulates marking read
                            setTicketsList(prev => prev.map(t => t.id === ticket.id ? { ...t, unread: false } : t));
                          }}
                          className="bg-[#12141A] hover:bg-brand-primary/10 border border-[#252836] hover:border-brand-primary text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 text-[#9BA3C7] hover:text-white flex items-center gap-1 font-semibold uppercase tracking-tight"
                        >
                          <span>Manage Thread</span>
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* NEW TICKET CREATOR MODAL LAYER TRIGGER */}
          <AnimatePresence>
            {showCreateTicketModal && (
              <div className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-sm flex items-center justify-center z-[990] p-4 text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#1A1D26] border-2 border-[#252836] p-5 md:p-6 rounded-2xl w-full max-w-lg shadow-2xl relative space-y-4"
                >
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="text-brand-cyan" size={18} />
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Submit Platform Request
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowCreateTicketModal(false)}
                      className="text-gray-400 hover:text-white bg-[#12141A] p-1 rounded-md border border-[#252836] cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <form onSubmit={handleAddNewTicket} className="space-y-4 text-xs font-semibold">
                    {/* Subject line input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Core Subject Heading
                      </label>
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g., Order id #10890 failing delivery"
                        className="bg-[#12141A] border border-[#252836] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                        required
                      />
                    </div>

                    {/* Meta parameter double columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Category field selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          Support Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="bg-[#12141A] border border-[#252836] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                        >
                          <option value="Orders">Orders Delivery</option>
                          <option value="Billing">Billing & Deposits</option>
                          <option value="Technical">API & Technical</option>
                          <option value="General">General Inquiry</option>
                        </select>
                      </div>

                      {/* Priority category selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          Required Priority
                        </label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value as any)}
                          className="bg-[#12141A] border border-[#252836] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                        >
                          <option value="Low">Low (General inquiry)</option>
                          <option value="Normal">Normal queue speed</option>
                          <option value="High">High speed escalation</option>
                          <option value="Urgent">Urgent (Platform Down)</option>
                        </select>
                      </div>
                    </div>

                    {/* Order ID optional mapping */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Connected Order ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={newOrderId}
                        onChange={(e) => setNewOrderId(e.target.value)}
                        placeholder="e.g., #10891"
                        className="bg-[#12141A] border border-[#252836] rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    {/* Main message details text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Comprehensive Message Description
                      </label>
                      <textarea
                        value={newMessageBody}
                        onChange={(e) => setNewMessageBody(e.target.value)}
                        placeholder="Detailed SMM problems context, account logs, link endpoints or screenshot diagnostic references..."
                        className="bg-[#12141A] border border-[#252836] rounded-xl p-4.5 text-xs text-white focus:outline-none focus:border-brand-primary min-h-[140px]"
                        required
                      />
                    </div>

                    {/* Dynamic Simulated Attachments list */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#252836]/40 text-[11px]">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Attached Records:</span>
                        <div className="flex flex-wrap gap-2">
                          {attachedFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-[#12141A] border border-[#252836] px-3 py-1.5 rounded-lg text-emerald-400 font-mono">
                              <Paperclip size={11} />
                              <span>{f.name}</span>
                              <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-white">
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-3">
                      <button
                        type="button"
                        onClick={handleSimulateAttachment}
                        className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold text-[#858da8] hover:text-white bg-[#12141A] border border-brand-border transition-all cursor-pointer"
                      >
                        <Paperclip size={13} />
                        <span>Add Diagnosis logs</span>
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-brand-primary to-brand-cyan hover:opacity-95 shadow shadow-brand-primary/10 transition-all cursor-pointer uppercase tracking-tight"
                      >
                        <Send size={13} />
                        <span>Submit Ticket</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}


      {/* =========================================================================
          VIEW B: PROFILE & SETTINGS MODULE
         ========================================================================= */}
      {activeView === 'profile' && (
        <div className="space-y-6">
          
          {/* Layout Upper Completion status banner */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-md">
                Client Matrix Audit
              </span>
              <h3 className="text-lg font-black text-white">Cloud Authentication Profile</h3>
              <p className="text-xs text-brand-text-secondary max-w-2xl leading-relaxed">
                Update account routing variables, set up hardware Multi-Factor keys, or check active API credentials.
              </p>
            </div>

            {/* Completion percentage tracking meter widget */}
            <div className="bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl min-w-[240px] space-y-2 shrink-0">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Security Completion</span>
                <span className="text-brand-cyan font-mono">{profileCompletionPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#1A1D26] rounded-full overflow-hidden border border-[#252836]">
                <div
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-700 rounded-full"
                  style={{ width: `${profileCompletionPct}%` }}
                />
              </div>
              {profileCompletionPct < 100 && (
                <p className="text-[10px] text-brand-warning font-semibold animate-pulse leading-normal">
                  ⚠️ Add your Phone & activate 2FA token to secure 100% safety.
                </p>
              )}
            </div>
          </div>

          {/* Profiles sub-divisions switcher row */}
          <div className="bg-[#12141A] border border-[#252836] p-1.5 rounded-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'profile', label: '👤 Account Profile' },
              { id: 'security', label: '🔒 Security Settings' },
              { id: 'notifications', label: '🔔 Bulletins & Toggles' },
              { id: 'api-keys', label: '🔑 API Core Credentials' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id as any)}
                className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none leading-none ${
                  profileTab === tab.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-[#9BA3C7] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-section tab panels */}
          <AnimatePresence mode="wait">
            
            {/* TAB 1: USER PROFILE FORMS */}
            {profileTab === 'profile' && (
              <motion.div
                key="tab-profile-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-6"
              >
                <div className="pb-3 border-b border-[#252836]">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Base Identity details</h4>
                </div>

                <form onSubmit={handleSaveProfileChanges} className="space-y-5 text-xs font-semibold">
                  {/* Circle Avatar Image Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="relative group hover:cursor-pointer select-none shrink-0" onClick={handleAvatarMockUpload}>
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar display node"
                          className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center font-black text-white text-2xl shadow-lg">
                          C
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0A0B0F]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={18} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Account Avatar Matrix</h5>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                        Supports PNG, JPG diagnostic format images. Maximum storage payload footprint is 2.5MB.
                      </p>
                      <button
                        type="button"
                        onClick={handleAvatarMockUpload}
                        className="mt-2 text-[11px] font-extrabold text-[#6C63FF] hover:text-white bg-[#1A1D26] border border-[#252836] hover:border-brand-primary py-1.8 px-3 rounded-lg transition-all cursor-pointer inline-block"
                      >
                        Change secure display photo
                      </button>
                    </div>
                  </div>

                  {/* Form fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Username Handle</label>
                      <input
                        type="text"
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Secure Client Email</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Full Name / Superstore client title</label>
                      <input
                        type="text"
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Telephone Node Address</span>
                        <span className="text-[9.5px] text-brand-warning">Escalate completion to 100%</span>
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+84 90 123 4567"
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Operation Region</label>
                      <select
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Vietnam">Vietnam</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Japan">Japan</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Timezone Synchronization</label>
                      <select
                        value={profileTimezone}
                        onChange={(e) => setProfileTimezone(e.target.value)}
                        className="bg-[#12141A] border border-[#252836] focus:border-brand-primary rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="UTC+7 (Bangkok, Jakarta)">UTC+7 (Bangkok, Jakarta, Hanoi)</option>
                        <option value="UTC+8 (Singapore, Manila)">UTC+8 (Singapore, Manila, Beijing)</option>
                        <option value="UTC+9 (Tokyo, Seoul)">UTC+9 (Tokyo, Seoul)</option>
                        <option value="UTC+0 (London, Rejkyavik)">UTC+0 (London, Edinburgh)</option>
                      </select>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="mt-4 px-6 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-primary to-[#00D4FF] hover:opacity-95 shadow-md shadow-brand-primary/10 transition-all cursor-pointer uppercase tracking-tight"
                  >
                    Save profile matrix changes
                  </button>
                </form>

              </motion.div>
            )}

            {/* TAB 2: IDENTITY SECURITY DETAILS */}
            {profileTab === 'security' && (
              <motion.div
                key="tab-security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                
                {/* Dual Columns Password and 2FA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Column Left: CHANGE PASSWORD SECTION */}
                  <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-5 text-left">
                    <div className="pb-3 border-b border-[#252836] flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                        <Lock size={14} className="text-brand-primary" />
                        <span>Update account password</span>
                      </h4>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-semibold">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Cred Log Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-[#12141A] border border-[#252836] rounded-xl px-4 py-2.8 text-xs text-white focus:outline-none focus:border-brand-primary"
                          placeholder="••••••••••••"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Set New Encrypted Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-[#12141A] border border-[#252836] rounded-xl px-4 py-2.8 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                          placeholder="Create strong password"
                          required
                        />
                        {/* Interactive password strength visualization scale */}
                        {passwordStrength && (
                          <div className="space-y-2 mt-1 bg-[#12141A] p-2 rounded-lg border border-[#252836]/60">
                            <div className="flex justify-between items-center text-[9.5px]">
                              <span className="text-gray-500 font-bold">Encrypted strength rating:</span>
                              <span className={`px-2 py-0.5 rounded font-black ${passwordStrength.color}`}>{passwordStrength.text}</span>
                            </div>
                            <div className="w-full h-1 bg-[#1A1D26] rounded-full overflow-hidden">
                              <div className={`h-full ${passwordStrength.bar} transition-all duration-300`} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Confirm matching password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-[#12141A] border border-[#252836] rounded-xl px-4 py-2.8 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                          placeholder="Confirm matching password"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#6C63FF]/15 text-[#6c63ff] hover:bg-[#6C63FF] hover:text-white border border-[#6C63FF]/30 hover:border-transparent w-full py-3.5 rounded-xl text-xs font-black tracking-tight cursor-pointer transition-all uppercase"
                      >
                        Recalculate hash credentials
                      </button>
                    </form>
                  </div>

                  {/* Column Right: TWO FACTOR AUTH MOCKUP */}
                  <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-5 text-left flex flex-col justify-between">
                    <div className="space-y-4">
                      
                      {/* Sub-Header bar */}
                      <div className="pb-3 border-b border-[#252836] flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                          <Smartphone size={14} className="text-brand-cyan" />
                          <span>MFA Multi-Factor Tokens</span>
                        </h4>

                        <span className={`text-[9px] uppercase font-black tracking-tight px-2 py-0.5 rounded border ${
                          is2FaEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-100 border-red-500/30'
                        }`}>
                          {is2FaEnabled ? '🛡️ Token Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <p className="text-xs text-brand-text-secondary leading-relaxed bg-[#12141A] p-3 rounded-xl border border-[#252836]">
                        Protect client balances. Two-Factor Authentication checks an automated random security algorithm token generator device key upon system login check. Highly recommended.
                      </p>

                      {/* Toggles switches */}
                      <div className="flex items-center justify-between gap-4.5 bg-[#12141A] border border-[#252836] p-4 rounded-xl">
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white">Enable Multi-Factor Token</span>
                          <p className="text-[10px] text-gray-500 leading-normal">Require security code upon every login matrix check.</p>
                        </div>

                        {/* Switch node */}
                        <div
                          onClick={() => {
                            if (!is2FaEnabled) {
                              setShow2FaModal(true);
                            } else {
                              setIs2FaEnabled(false);
                              showToast('MFA protection disabled on this client account.');
                            }
                          }}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                            is2FaEnabled ? 'bg-[#00D4FF]' : 'bg-[#252836]'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-[#1A1D26] border border-[#12141A] rounded-full transition-transform ${is2FaEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                        </div>
                      </div>

                    </div>

                    {/* QR Code and Backups layout only if activated */}
                    {is2FaEnabled && (
                      <div className="bg-[#12141A] border border-[#252836] p-4 rounded-xl flex items-center gap-4 animate-fade-in">
                        {/* Mock QR Code graphic */}
                        <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center border border-brand-border" title="MFA Scanning QR Code Node">
                          <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="2" y="2" width="6" height="6" />
                            <rect x="16" y="2" width="6" height="6" />
                            <rect x="2" y="16" width="6" height="6" />
                            <rect x="10" y="10" width="4" height="4" />
                            <rect x="14" y="14" width="4" height="4" />
                            <rect x="10" y="4" width="2" height="4" />
                            <rect x="8" y="10" width="2" height="2" />
                            <rect x="4" y="10" width="4" height="2" />
                            <rect x="10" y="16" width="2" height="4" />
                          </svg>
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Primary Backup Code:</span>
                          <span className="font-mono text-xs select-all text-white font-extrabold bg-[#1A1D26] p-1.5 rounded border border-[#252836] block w-fit">
                            PROSMM-MFA-2026-6458-1
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Sub-Section Bottom: ACTIVE SECURE SESSIONS */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-4 text-left">
                  <div className="pb-3 border-b border-[#252836] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-brand-cyan" />
                        <span>Client Session Access Records</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal">Active browser instances accessing this client database.</p>
                    </div>

                    {activeSessions.length > 1 && (
                      <button
                        onClick={handleRevokeAllOtherSessions}
                        className="text-[10px] font-extrabold text-red-400 hover:text-white bg-[#12141A] hover:bg-brand-danger/20 border border-brand-danger/30 py-2 px-3.5 rounded-xl cursor-pointer transition-all"
                      >
                        Revoke All Other Sessions
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[650px] text-xs">
                      <thead>
                        <tr className="border-b border-[#252836] bg-[#12141A] text-[9.5px] font-black uppercase tracking-wider text-gray-500">
                          <th className="py-3 px-4 text-left">Authentication Endpoint</th>
                          <th className="py-3 px-4 text-left">Internet Protocol Node IP</th>
                          <th className="py-3 px-4 text-left">Geographic Location</th>
                          <th className="py-3 px-4 text-left">Latest Access Alert</th>
                          <th className="py-3 px-4 text-right">Escalation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#252836]/40 font-semibold text-gray-300">
                        {activeSessions.map((sess) => (
                          <tr key={sess.id} className="hover:bg-white/[0.015] transition-colors">
                            <td className="py-3 px-4 text-white font-extrabold flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${sess.active.includes('Current') ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                              {sess.device}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-400 select-all">{sess.ip}</td>
                            <td className="py-3 px-4 text-slate-300">{sess.location}</td>
                            <td className="py-3 px-4 text-[#858da8]">{sess.active}</td>
                            <td className="py-3 px-4 text-right">
                              {sess.active.includes('Current') ? (
                                <span className="text-[9.5px] uppercase font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-1 rounded">
                                  Current Session
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRevokeSession(sess.id)}
                                  className="text-red-400 hover:text-red-300 bg-transparent cursor-pointer p-1.5 rounded hover:bg-brand-danger/10 transition-all flex items-center justify-center ml-auto"
                                  title="Terminate Client terminal session token"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 3: BULLETIN NOTIFICATION MASTER CONTROLS */}
            {profileTab === 'notifications' && (
              <motion.div
                key="tab-notifs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-5 text-left"
              >
                <div className="pb-3 border-b border-[#252836]">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Live Bulletin Switchboards</h4>
                  <p className="text-[11px] text-gray-500 leading-normal mt-0.5">Control mail servers routing alerts, and order status updates on your SMM platform triggers.</p>
                </div>

                <div className="space-y-4.5 font-semibold text-xs">
                  {/* Order Completed notification switch */}
                  <div className="flex items-center justify-between gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white">Order Completed Bulletins</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Send secure mail notifications once follower/views count reach 100% completed status.</p>
                    </div>
                    <div
                      onClick={() => setBulletinOrderCompleted(!bulletinOrderCompleted)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinOrderCompleted ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                    >
                      <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinOrderCompleted ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Order Cancelled Notification switch */}
                  <div className="flex items-center justify-between gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white">Order Failure & Cancelled Sync</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Immediate alert if an SMM pipeline encounters API exception blocks or gets refunded.</p>
                    </div>
                    <div
                      onClick={() => setBulletinOrderCancelled(!bulletinOrderCancelled)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinOrderCancelled ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                    >
                      <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinOrderCancelled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Low Balance Indicator config */}
                  <div className="bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl gap-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="space-y-0.5 max-w-xl">
                      <span className="text-xs font-extrabold text-white">Minimum Safe Balance Threshold</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Warn via mail when master platform API wallets fall beneath safe custom threshold margins.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                      {/* Threshold parameter */}
                      {bulletinLowBalance && (
                        <div className="relative w-24">
                          <span className="absolute left-2.5 inset-y-0 flex items-center font-bold text-gray-500 font-mono text-[11px]">$</span>
                          <input
                            type="number"
                            min="1.00"
                            max="500.00"
                            value={lowBalanceThreshold}
                            onChange={(e) => setLowBalanceThreshold(e.target.value)}
                            className="w-full bg-[#1A1D26] border border-[#252836] text-[11px] font-bold text-white font-mono rounded-lg py-1.8 pl-5.5 pr-2 focus:outline-none"
                          />
                        </div>
                      )}

                      <div
                        onClick={() => setBulletinLowBalance(!bulletinLowBalance)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinLowBalance ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                      >
                        <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinLowBalance ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Ticket Replies Alerts */}
                  <div className="flex items-center justify-between gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white">Ticket Reply notifications</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Ping terminal mail servers instantly when a ProSMM support agent responds to your helpdesks.</p>
                    </div>
                    <div
                      onClick={() => setBulletinNewTicketReply(!bulletinNewTicketReply)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinNewTicketReply ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                    >
                      <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinNewTicketReply ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Promo announcements */}
                  <div className="flex items-center justify-between gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white">Promotional Announcements Mailers</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Subscribe to custom VIP agency seasonal coupon rewards, discount updates, or reseller features.</p>
                    </div>
                    <div
                      onClick={() => setBulletinPromo(!bulletinPromo)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinPromo ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                    >
                      <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinPromo ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Security events change alerts */}
                  <div className="flex items-center justify-between gap-5 bg-[#12141A] border border-[#252836] p-4.5 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white">Critical Security events</span>
                      <p className="text-[10.5px] text-gray-500 leading-normal">Immediate automated dispatch on password re-hashes, MFA changes, or API credentials resets.</p>
                    </div>
                    <div
                      onClick={() => setBulletinSecurityAlerts(!bulletinSecurityAlerts)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${bulletinSecurityAlerts ? 'bg-[#6C63FF]' : 'bg-[#252836]'}`}
                    >
                      <div className={`w-5 h-5 bg-[#1A1D26] rounded-full transition-transform ${bulletinSecurityAlerts ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: API ACCESS CONDENSED BOARD */}
            {profileTab === 'api-keys' && (
              <motion.div
                key="tab-api-tab-keys"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                
                {/* Central Key Credentials section */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-[#252836] flex items-center gap-2">
                    <Code2 className="text-brand-primary" size={15} />
                    <h4 className="text-xs font-black uppercase text-white tracking-widest">Programmatic REST Endpoint Credentials</h4>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Integrate your automated bot orders or wholesale panels with our central servers using this API Key.
                  </p>

                  <div className="bg-[#12141A] border border-[#252836] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-1 w-full sm:w-auto">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 tracking-wider">Your Master Access Token:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs select-all text-brand-cyan font-black bg-[#1A1D26] p-2.5 rounded border border-[#252836] break-all flex-1 sm:flex-initial">
                          {apiKeysTabKeyVisible ? apiKeysTabKey : '••••••••••••••••••••••••••••' + apiKeysTabKey.slice(-8)}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => setApiKeysTabKeyVisible(!apiKeysTabKeyVisible)}
                          className="bg-[#1A1D26] border border-[#252836] p-2 rounded-xl text-gray-400 hover:text-white cursor-pointer hover:border-[#525775]"
                          title={apiKeysTabKeyVisible ? 'Hide token' : 'Show Token'}
                        >
                          {apiKeysTabKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKeysTabKey);
                          showToast('API access token copied to clipboard.');
                        }}
                        className="bg-[#1A1D26] hover:bg-[#252836] border border-[#252836] p-3 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                        title="Copy API Token to clipboard"
                      >
                        <Copy size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                          let randStr = '';
                          for (let i = 0; i < 24; i++) {
                            randStr += chars[Math.floor(Math.random() * chars.length)];
                          }
                          const nextKey = `ps_live_${randStr}abcd${Math.floor(1000 + Math.random() * 9000)}`;
                          setApiKeysTabKey(nextKey);
                          showToast('Credential secret regenerated. Update your scripts endpoints!');
                        }}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={14} />
                        <span>Regenerate Credentials</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* API statistics widgets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-[#1A1D26]/60 border border-[#252836] p-4 rounded-xl text-xs font-semibold text-left space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Completed API tasks</span>
                    <span className="text-lg font-black text-white font-mono">4,821 Requests</span>
                  </div>
                  <div className="bg-[#1A1D26]/60 border border-[#252836] p-4 rounded-xl text-xs font-semibold text-left space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">SMM API Campaigns</span>
                    <span className="text-lg font-black text-brand-cyan font-mono">892 Orders</span>
                  </div>
                  <div className="bg-[#1A1D26]/60 border border-[#252836] p-4 rounded-xl text-xs font-semibold text-left space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">API Successful rate</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">99.2% Sync</span>
                  </div>
                  <div className="bg-[#1A1D26]/60 border border-[#252836] p-4 rounded-xl text-xs font-semibold text-left space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Aggregate latency</span>
                    <span className="text-lg font-black text-amber-500 font-mono">145 ms (Helsinki)</span>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* MFA 2FA ACTIVATION QR SCANNING FLOW DIALOG MODAL */}
          <AnimatePresence>
            {show2FaModal && (
              <div className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-sm flex items-center justify-center z-[990] p-4 text-left font-sans">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#1A1D26] border-2 border-[#252836] p-5 md:p-6 rounded-2xl w-full max-w-sm shadow-2xl relative space-y-4"
                >
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                    <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                      <Smartphone size={15} className="text-brand-cyan" />
                      Configure Multi-Factor Token
                    </span>
                    <button
                      onClick={() => setShow2FaModal(false)}
                      className="text-gray-400 hover:text-white bg-[#12141A] p-1 rounded-md border border-[#252836] cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      1. Scan the registration QR Code container below via Google Authenticator, Authy, or physical security key hardware nodes:
                    </p>

                    {/* QR Code container graphic drawing */}
                    <div className="mx-auto w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center border border-[#252836]">
                      <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="6" height="6" />
                        <rect x="16" y="2" width="6" height="6" />
                        <rect x="2" y="16" width="6" height="6" />
                        <rect x="10" y="10" width="4" height="4" />
                        <rect x="14" y="14" width="4" height="4" />
                        <rect x="10" y="4" width="2" height="4" />
                        <text x="5" y="15" fontSize="3" fontWeight="bold">SMM APP</text>
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">2. Type generated MFA authentication code:</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-[#12141A] border border-[#252836] focus:border-brand-cyan rounded-xl text-center text-white py-3 font-mono text-base tracking-widest focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShow2FaModal(false)}
                        className="px-4 py-2.5 rounded-xl bg-[#12141A] text-gray-400 border border-[#252836] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIs2FaEnabled(true);
                          setShow2FaModal(false);
                          showToast('MFA protection successfully verified and locked!');
                        }}
                        className="px-4.5 py-2.5 rounded-xl bg-brand-cyan text-[#12141A] font-extrabold cursor-pointer hover:opacity-90"
                      >
                        Verify & Activate
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
