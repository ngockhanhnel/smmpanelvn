import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Search,
  User,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  UserCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Flag,
  CornerDownRight,
  FileText,
  UserPlus,
  BookmarkCheck,
  Cpu
} from 'lucide-react';

interface TicketMessage {
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  time: string;
}

interface AdminTicket {
  id: string;
  user: string;
  subject: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Open' | 'Answered' | 'Closed';
  assignedTo: string;
  internalNote: string;
  lastUpdate: string;
  messages: TicketMessage[];
}

interface AdminTicketsProps {
  onShowToast: (msg: string) => void;
}

export default function AdminTicketsManagement({ onShowToast }: AdminTicketsProps) {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  useEffect(() => {
    const importFirebase = async () => {
      const { db } = await import('../firebase');
      const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snap) => {
        const list: AdminTicket[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            user: d.userId || 'Unknown',
            subject: d.subject || 'No Subject',
            category: d.category || 'Support',
            priority: d.priority || 'Normal',
            status: d.status || 'Open',
            assignedTo: d.assignedTo || 'None (Unassigned)',
            internalNote: d.internalNote || '',
            lastUpdate: d.updatedAt ? new Date(d.updatedAt).toLocaleString() : 'Unknown',
            messages: (d.messages || []).map((m: any) => ({
              sender: m.sender || 'user',
              senderName: m.senderName || 'Unknown',
              message: m.text || '',
              time: m.timestamp || ''
            }))
          });
        });
        setTickets(list);
      });
      return unsub;
    };
    
    let unsubscribe: any = null;
    importFirebase().then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);

  // Form interactive states
  const [adminReply, setAdminReply] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [quickReplyVal, setQuickReplyVal] = useState('');

  // Quick reply options templates
  const QUICK_REPLIES = [
    { label: 'Select Template Response...', text: '' },
    { label: 'Views/Followers Algorithm Upgrade', text: 'Hi! Our engineering node just upgraded delivery server algorithms. Your order has been shifted to high-priority pipelines. Expect delivery to resume momentarily.' },
    { label: 'Manual Bank Deposit Approval', text: 'We successfully verified your bank wire reference. SMM Panel credit balance was loaded onto your ledger ledger account. Thank you for your partnership.' },
    { label: 'Refill / Drops Refill Policy', text: 'Hi there, SMM services sometimes drop due to social platform patches. Our 30-day lifetime guarantee system is taking care of this. Refill has been triggered manually.' },
    { label: 'Closing Ticket Resolution', text: 'We have marked this support query as successfully resolved. Do not hesitate to launch a new SMM Support request if you require further services.' }
  ];


  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPri = filterPriority === 'All' || t.priority === filterPriority;
      const matchSt = filterStatus === 'All' || t.status === filterStatus;
      return matchSearch && matchPri && matchSt;
    });
  }, [tickets, searchQuery, filterPriority, filterStatus]);

  const handleSelectTicket = (t: AdminTicket) => {
    setSelectedTicket(t);
    setInternalNoteInput(t.internalNote || '');
    setAdminReply('');
    setQuickReplyVal('');
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!adminReply.trim()) {
      onShowToast('Please specify a reply message or select a quick template.');
      return;
    }

    const newMessage: TicketMessage = {
      sender: 'admin',
      senderName: 'John Devins (Admin)',
      message: adminReply.trim(),
      time: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const nextMsgs = [...t.messages, newMessage];
        const updated = {
          ...t,
          status: 'Answered' as const,
          lastUpdate: 'Just now',
          messages: nextMsgs
        };
        setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    onShowToast(`Response sent for Support Ticket ${selectedTicket.id}`);
    setAdminReply('');
    setQuickReplyVal('');
  };

  const handleSaveInternalNote = () => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const updated = { ...t, internalNote: internalNoteInput };
        setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));
    onShowToast(`Internal auditing notes recorded for ${selectedTicket.id}. Hidden from client.`);
  };

  const handleUpdateTicketStatus = (id: string, newSt: AdminTicket['status']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, status: newSt, lastUpdate: 'Just now' };
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(updated);
        }
        onShowToast(`Ticket ${id} status set to ${newSt}`);
        return updated;
      }
      return t;
    }));
  };

  const handleAssignOperator = (id: string, opName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, assignedTo: opName };
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(updated);
        }
        onShowToast(`Ticket ${id} assigned to operator: ${opName}`);
        return updated;
      }
      return t;
    }));
  };

  const handleTogglePriority = (id: string, nextPri: AdminTicket['priority']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, priority: nextPri };
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(updated);
        }
        onShowToast(`Ticket ${id} changed priority to ${nextPri}`);
        return updated;
      }
      return t;
    }));
  };

  const handleQuickReplyChange = (text: string) => {
    setQuickReplyVal(text);
    setAdminReply(text);
  };


  return (
    <div className="space-y-6">
      
      {/* FILTER PANEL ROW */}
      <div className="bg-[#1A1D26] border border-[#252836] p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-betweenSelect">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center flex-1">
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ticket ID, user, or subject..."
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs py-2.5 pl-10 pr-3 rounded-xl text-white outline-none focus:border-[#6C63FF] placeholder:text-gray-600 font-mono"
            />
          </div>

          <div className="w-full md:w-44">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
            >
              <option value="All">All Priority levels</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🔵 Low Priority</option>
            </select>
          </div>

          <div className="w-full md:w-44">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
            >
              <option value="All">All Ticket States</option>
              <option value="Pending">🔴 Pending Action</option>
              <option value="Open">🟡 Open Active</option>
              <option value="Answered">🟢 Answered</option>
              <option value="Closed">⚫ Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: TICKETS LIST (LEFT 45%) + CURRENT CHAT (RIGHT 55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TICKETS LIST (5 columns) */}
        <div className="lg:col-span-5 bg-[#1A1D26] border border-[#252836] rounded-3xl overflow-hidden shadow h-[600px] flex flex-col">
          <div className="px-5 py-4 border-b border-[#252836] bg-[#13151f] flex justify-between items-center shrink-0">
            <h3 className="text-xs font-black uppercase text-white tracking-wider">All Active Partner Tickets</h3>
            <span className="text-[10px] font-black text-[#00D4FF] font-mono">{filteredTickets.length} open</span>
          </div>

          <div className="flex-1 divide-y divide-[#252836] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="py-24 text-center text-xs text-gray-550 font-bold">
                No tickets found matching the filter criteria.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket && selectedTicket.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-4 transition-all hover:bg-white/[0.012] cursor-pointer flex flex-col gap-2 border-l-4 ${
                      isSelected ? 'bg-brand-primary/8 border-l-[#FF4757]' : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-[#00D4FF] bg-[#00D4FF]/4 border border-[#00D4FF]/10 px-1.5 py-0.5 rounded leading-none">
                          {t.id}
                        </span>
                        <span className="text-xs font-bold text-yellow-500 font-mono">@{t.user}</span>
                      </div>
                      <span className="text-[9px] text-[#858da8] font-mono">{t.lastUpdate}</span>
                    </div>

                    <h4 className="text-xs font-black text-white line-clamp-1 leading-snug">{t.subject}</h4>
                    
                    <div className="flex justify-between items-center pt-1 text-[10px] text-gray-500 font-semibold">
                      <span>Cat: <strong className="text-gray-300">{t.category}</strong></span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          t.priority === 'High' ? 'bg-red-500' : t.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="capitalize">{t.priority}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-[#252836]/40 select-none">
                      <span className="text-[10px] text-gray-500">Assignee: <strong className="text-[#00D4FF] font-mono">{t.assignedTo}</strong></span>
                      <span className={`text-[8.5px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded ${
                        t.status === 'Pending' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                        t.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' :
                        t.status === 'Answered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                        'bg-gray-500/10 text-gray-500 border border-transparent'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT PANEL DETAILED (7 columns) */}
        <div className="lg:col-span-7 bg-[#1A1D26] border border-[#252836] rounded-3xl overflow-hidden shadow h-[600px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {!selectedTicket ? (
              <motion.div
                key="empty-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center p-12 h-full gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/5 border border-[#6C63FF]/15 flex items-center justify-center text-[#6C63FF] mb-2 animate-pulse">
                  <MessageSquare size={30} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">No Support Ticket Selection</h4>
                  <p className="text-xs text-brand-text-secondary leading-relaxed max-w-sm mt-1">
                    Select an active support ticket request from the left core registry to communicate with the client programmatically.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Chat Header: Ticket settings, assign, priority */}
                <div className="px-5 py-4 border-b border-[#252836] bg-[#13151f] flex flex-col gap-3.5 shrink-0 select-none">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-[#00D4FF] bg-[#00D4FF]/4 border border-[#00D4FF]/10 px-1.5 py-0.5 rounded leading-none">
                        {selectedTicket.id}
                      </span>
                      <h3 className="text-xs font-black uppercase text-white truncate max-w-[250px]">{selectedTicket.subject}</h3>
                    </div>
                    
                    {/* Status dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 uppercase font-black">Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as any)}
                        className="bg-[#12141A] border border-[#2b2e3e] text-[10px] font-black uppercase tracking-tight py-1 px-2 rounded-md text-white cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Open">Open</option>
                        <option value="Answered">Answered</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Operational Settings: Assign operator & Priority level */}
                  <div className="grid grid-cols-2 gap-3 pb-0.5 text-xs">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">Operator:</span>
                      <select
                        value={selectedTicket.assignedTo}
                        onChange={(e) => handleAssignOperator(selectedTicket.id, e.target.value)}
                        className="w-full bg-[#12141A]/60 border border-[#2c2f42] text-[11px] py-1 px-2 rounded font-sans font-semibold text-[#00D4FF]"
                      >
                        <option value="None (Unassigned)">None (Unassigned)</option>
                        <option value="John Devins">John Devins (Operator)</option>
                        <option value="Marcus Operator">Marcus Admin</option>
                        <option value="Sophia Support">Sophia Reseller Agent</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">Priority:</span>
                      <div className="flex items-center gap-1">
                        {(['Low', 'Medium', 'High'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTogglePriority(selectedTicket.id, p)}
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded transition-all cursor-pointer ${
                              selectedTicket.priority === p
                                ? p === 'High' ? 'bg-red-500 text-white' : p === 'Medium' ? 'bg-yellow-500 text-[#12141A]' : 'bg-blue-500 text-white'
                                : 'bg-[#12141A] text-gray-550 border border-transparent'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Chat messages viewport */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#12141A]/40 min-h-0 relative">
                  {selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-gradient-to-br from-[#6C63FF]/20 to-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-tr-none text-white'
                            : 'bg-[#1A1D26] border border-[#282b3d] rounded-tl-none text-gray-100'
                        }`}>
                          <div className="flex justify-between items-baseline gap-4 select-none">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-cyan font-sans">{m.senderName}</span>
                            <span className="text-[9px] text-[#8c94a8] font-mono">{m.time}</span>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Reply form + internal Note Panel */}
                <div className="p-4 bg-[#13151f] border-t border-[#252836] shrink-0 space-y-3.5">
                  
                  {/* INTERNAL Auditing NOTE BOX */}
                  <div className="flex gap-2 bg-[#1A1D26] p-2.5 rounded-xl border border-[#282b3e] items-center text-xs">
                    <BookmarkCheck size={14} className="text-[#FFB800] shrink-0" />
                    <input
                      type="text"
                      value={internalNoteInput}
                      onChange={(e) => setInternalNoteInput(e.target.value)}
                      placeholder="Add an internal audit note (Strictly hidden from customer logs)..."
                      className="w-full bg-transparent text-xs text-[#FFB800] placeholder:text-gray-600 outline-none font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveInternalNote}
                      className="text-[9.5px] font-black uppercase text-white bg-[#FFB800] hover:bg-yellow-600 px-2 py-1 rounded shrink-0 transition-colors cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>

                  {/* REPLY CONTROLS */}
                  <form onSubmit={handleSendAdminReply} className="space-y-2.5">
                    
                    {/* Quick templates drop */}
                    <div className="flex items-center gap-2 select-none">
                      <Cpu size={12} className="text-gray-500 animate-pulse" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Automated Reply Template:</span>
                      <select
                        value={quickReplyVal}
                        onChange={(e) => handleQuickReplyChange(e.target.value)}
                        className="w-full bg-[#12141A] border border-[#2b2e3e] text-[10.5px] font-semibold py-1 px-2 rounded text-slate-350 cursor-pointer"
                      >
                        {QUICK_REPLIES.map((qr, index) => (
                          <option key={index} value={qr.text}>{qr.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        required
                        rows={2}
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        placeholder="Type program responses or draft explanations..."
                        className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-3 rounded-xl text-white outline-none focus:border-[#6C63FF] leading-relaxed resize-none"
                      />
                      <button
                        type="submit"
                        className="p-3.5 bg-[#6C63FF] hover:bg-[#5952cf] text-white rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0 self-end"
                        aria-label="Send reply message"
                      >
                        <Send size={15} />
                      </button>
                    </div>

                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
