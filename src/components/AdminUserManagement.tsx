import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  AlertTriangle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  MessageSquare,
  ShoppingBag,
  Clock,
  Send,
  Lock,
  ChevronDown,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  MinusCircle,
  Calendar,
  FileText
} from 'lucide-react';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarColor: string;
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedDate: string;
  lastActive: string;
  status: 'Active' | 'Banned' | 'Unverified';
  country: string;
  timezone: string;
  lastLoginIp: string;
  registrationIp: string;
  referralCode: string;
  referredBy: string | null;
  notes: Array<{ date: string; text: string }>;
}

interface AdminUserManagementProps {
  onShowToast: (msg: string) => void;
  openAddUserModal: () => void;
}

// Generously seeded user databases for extremely high fidelity

// Seeded Transactions dataset for User dossier tabs
const TRANSACTION_MOCK_DATA: Record<string, Array<{ date: string; type: 'Deposit' | 'Order Payment' | 'Refund' | 'Admin Add'; amount: string; method: string; balanceAfter: string }>> = {
  "USR-0021": [
    { date: "2026-06-05 14:15", type: "Deposit", amount: "+$1,000.00", method: "Crypto BTC Gateway", balanceAfter: "$4,520.00" },
    { date: "2026-06-05 12:20", type: "Order Payment", amount: "-$125.00", method: "API Campaign #89452", balanceAfter: "$3,520.00" },
    { date: "2026-06-04 11:10", type: "Admin Add", amount: "+$500.00", method: "Voucher Redeem", balanceAfter: "$3,645.00" },
    { date: "2026-06-03 08:30", type: "Refund", amount: "+$45.00", method: "Cancelled Order #89312", balanceAfter: "$3,145.00" }
  ],
  "USR-0043": [
    { date: "2026-06-05 21:00", type: "Deposit", amount: "+$800.00", method: "PerfectMoney Auto", balanceAfter: "$2,840.50" },
    { date: "2026-06-05 18:32", type: "Order Payment", amount: "-$42.00", method: "Campaign #89471", balanceAfter: "$2,040.50" }
  ]
};

// Seeded Ticket history for User dossier tabs
const TICKETS_MOCK_DATA: Record<string, Array<{ id: string; subject: string; category: string; lastUpdate: string; status: string }>> = {
  "USR-0021": [
    { id: "TCK-5541", subject: "Custom API Rate limits increase", category: "API Integration", lastUpdate: "Jun 04, 12:11", status: "Closed" },
    { id: "TCK-5510", subject: "Crypto Deposit pending verification", category: "Add Funds", lastUpdate: "Jun 02, 09:30", status: "Closed" }
  ],
  "USR-0043": [
    { id: "TCK-5590", subject: "Order #89470 - Speed falling short", category: "Order Speed", lastUpdate: "Jun 05, 10:45", status: "Open" }
  ]
};

// Seeded Orders history for User dossier tabs
const ORDERS_MOCK_DATA: Record<string, Array<{ id: string; service: string; amount: string; status: string; date: string }>> = {
  "USR-0021": [
    { id: "#89472", service: "TikTok Viral High-Speed Views", amount: "$12.50", status: "Completed", date: "2026-06-05" },
    { id: "#89452", service: "Instagram High-Quality Comments", amount: "$112.50", status: "Completed", date: "2026-06-05" },
    { id: "#89302", service: "Telegram Group Master Members", amount: "$150.00", status: "Completed", date: "2026-06-02" }
  ],
  "USR-0043": [
    { id: "#89471", service: "Instagram High-Quality Comments", amount: "$4.10", status: "In Progress", date: "2026-06-05" },
    { id: "#89470", service: "YouTube Watch Hours Lifetime Pack", amount: "$45.00", status: "Pending", date: "2026-06-05" }
  ]
};

export default function AdminUserManagement({ onShowToast, openAddUserModal }: AdminUserManagementProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    import('../firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const unsub = onSnapshot(collection(db, 'users'), (snap) => {
          const list: UserRecord[] = [];
          snap.forEach(doc => {
            const d = doc.data();
            list.push({
              id: doc.id,
              username: d.username || d.email?.split('@')[0] || 'Unknown',
              email: d.email || '',
              fullName: d.fullName || d.username || 'System User',
              avatarColor: d.role === 'admin' ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30",
              balance: d.balance || 0,
              totalSpent: d.totalSpent || 0,
              totalOrders: d.totalOrders || 0,
              joinedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : 'Unknown',
              lastActive: 'Recently',
              status: d.status || 'Active',
              country: d.country || 'Unknown',
              timezone: d.timezone || 'UTC',
              lastLoginIp: d.lastLoginIp || '',
              registrationIp: d.registrationIp || '',
              referralCode: d.referralCode || '',
              referredBy: d.referredBy || null,
              notes: d.notes || []
            });
          });
          setUsers(list);
        });
        return () => unsub();
      });
    });
  }, []);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Filtering and search controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Banned' | 'Unverified'>('All');
  const [balanceFilter, setBalanceFilter] = useState<'All' | 'Zero' | 'HasBalance'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Spent' | 'Orders'>('Newest');
  
  // Date range (visual binding)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected dossier user / drawer
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Orders' | 'Transactions' | 'Tickets'>('Overview');
  
  // New Admin Note state
  const [newNoteText, setNewNoteText] = useState('');

  // Funds adjustment modal states
  const [showAdjustFundsModal, setShowAdjustFundsModal] = useState(false);
  const [adjustFundsUserId, setAdjustFundsUserId] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'Add' | 'Deduct'>('Add');
  const [adjustAmount, setAdjustAmount] = useState('100.00');
  const [adjustReason, setAdjustReason] = useState('Tier promotional loyalty incentive.');

  // Access target user object for views helper
  const targetDrawerUser = useMemo(() => {
    return users.find(u => u.id === drawerUserId) || null;
  }, [users, drawerUserId]);

  const targetAdjustUser = useMemo(() => {
    return users.find(u => u.id === adjustFundsUserId) || null;
  }, [users, adjustFundsUserId]);

  // Bulk operation triggers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const activeIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(activeIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id]);
    } else {
      setSelectedUserIds(prev => prev.filter(item => item !== id));
    }
  };

  // Perform filtering, sorting & search
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query match
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        u =>
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.id.toLowerCase().includes(query)
      );
    }

    // Status matching filter
    if (statusFilter !== 'All') {
      result = result.filter(u => u.status === statusFilter);
    }

    // Balance filters
    if (balanceFilter === 'Zero') {
      result = result.filter(u => u.balance === 0);
    } else if (balanceFilter === 'HasBalance') {
      result = result.filter(u => u.balance > 0);
    }

    // Sorting parameters
    if (sortBy === 'Newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'Spent') {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'Orders') {
      result.sort((a, b) => b.totalOrders - a.totalOrders);
    }

    return result;
  }, [users, searchTerm, statusFilter, balanceFilter, sortBy]);

  // Pagination boundary calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Actions
  const handleToggleBanUser = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Banned' ? 'Active' : 'Banned';
        onShowToast(`User @${u.username} database status updated to: ${nextStatus}.`);
        return { ...u, status: nextStatus as 'Active' | 'Banned' };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you would like to permanently delete reseller account @${name} from systems database?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelectedUserIds(prev => prev.filter(item => item !== id));
      onShowToast(`Master registry cleared for client account @${name}.`);
    }
  };

  const handleBulkBan = () => {
    if (selectedUserIds.length === 0) return;
    setUsers(prev => prev.map(u => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, status: 'Banned' };
      }
      return u;
    }));
    onShowToast(`Forced administrative suspension across ${selectedUserIds.length} target profiles.`);
    setSelectedUserIds([]);
  };

  const handleBulkEmail = () => {
    if (selectedUserIds.length === 0) return;
    onShowToast(`Dispatched custom system briefing notice to ${selectedUserIds.length} target client domains.`);
    setSelectedUserIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Purge all ${selectedUserIds.length} selected databases logs forever?`)) {
      setUsers(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
      onShowToast(`Destroyed accounts records for ${selectedUserIds.length} users successfully.`);
      setSelectedUserIds([]);
    }
  };

  // Add notes inside drawer
  const handleAddDrawerNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !drawerUserId) return;

    setUsers(prev => prev.map(u => {
      if (u.id === drawerUserId) {
        const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...u,
          notes: [{ date: timeStr, text: newNoteText.trim() }, ...u.notes]
        };
      }
      return u;
    }));

    setNewNoteText('');
    onShowToast("Analytical staff note safely appended to profile ledger.");
  };

  // Trigger funds adjuster confirm
  const handleConfirmAdjustFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustFundsUserId) return;

    const numericAmount = parseFloat(adjustAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      onShowToast("Please enter a valid numeric value.");
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === adjustFundsUserId) {
        let nextBalance = u.balance;
        if (adjustType === 'Add') {
          nextBalance += numericAmount;
          onShowToast(`Credited $${numericAmount} to @${u.username}'s active ledger balance.`);
        } else {
          nextBalance = Math.max(0, nextBalance - numericAmount);
          onShowToast(`Doducted $${numericAmount} from @${u.username}'s active balance.`);
        }
        return { ...u, balance: nextBalance };
      }
      return u;
    }));

    setShowAdjustFundsModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D26] p-5 rounded-2xl border border-[#1E2230] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF]">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-widest uppercase text-white leading-normal">
              User Core Registries
            </h2>
            <p className="text-[10px] text-gray-500 font-bold mt-0.5 font-mono">
              Total Managed Audience: <span className="text-brand-cyan">4,281 Account Nodes</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onShowToast("Compiling master SMM client ledger CSV... Direct download initialized.");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase text-gray-400 hover:text-white bg-[#12141A] border border-[#252836] transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={openAddUserModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase text-white bg-gradient-to-r from-teal-500 to-[#00D4FF] hover:opacity-95 shadow-lg shadow-teal-500/10 border border-teal-500/10 transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Add User Profile</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLLERS BAR */}
      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-2xl shadow-md space-y-4">
        
        {/* Row 1: Search and Status parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Real-time search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Query username, index email, system ID..."
              className="w-full bg-[#12141A] border border-[#252836] hover:border-brand-primary/30 rounded-xl pl-9.5 pr-4 py-2.5 text-[11px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>

          {/* Status filter selectors */}
          <div className="lg:col-span-3 flex items-center bg-[#12141A] rounded-xl border border-[#252836] p-1 h-10">
            {(['All', 'Active', 'Banned', 'Unverified'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                  onShowToast(`Filter criteria updated: [Status: ${st}]`);
                }}
                className={`flex-1 text-[10px] font-black uppercase py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FF4757]/10 text-[#FF4757] border border-[#FF4757]/20 font-black'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Balance Filters */}
          <div className="lg:col-span-3 flex items-center bg-[#12141A] rounded-xl border border-[#252836] p-1 h-10">
            {[
              { id: 'All', label: 'All Balances' },
              { id: 'Zero', label: 'Zero Asset' },
              { id: 'HasBalance', label: 'Has Balance' }
            ].map((bal) => (
              <button
                key={bal.id}
                onClick={() => {
                  setBalanceFilter(bal.id as any);
                  setCurrentPage(1);
                }}
                className={`flex-1 text-[9.5px] font-black uppercase py-1.5 px-1.5 rounded-lg text-center transition-all cursor-pointer truncate ${
                  balanceFilter === bal.id
                    ? 'bg-gradient-to-r from-brand-primary/10 to-brand-primary/20 text-brand-cyan border border-brand-primary/25 font-black'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {bal.label}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="lg:col-span-2 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 bg-[#12141A] border border-[#252836] rounded-xl px-3 text-[10px] font-black uppercase text-gray-400 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="Newest">Newest Registries</option>
              <option value="Oldest">Oldest Registries</option>
              <option value="Spent">Most Spent Volumes</option>
              <option value="Orders">Most Campaign Orders</option>
            </select>
          </div>

        </div>

        {/* Row 2: Secondary Filters (Date limits visual) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3.5 border-t border-[#252836]">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 uppercase font-black">Date Joined Constraints:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase text-gray-600 font-bold">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-[#12141A] border border-[#252836] text-[10px] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase text-gray-600 font-bold">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-[#12141A] border border-[#252836] text-[10px] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setSearchTerm('');
                setStatusFilter('All');
                setBalanceFilter('All');
                setSortBy('Newest');
                onShowToast("Filtering schemas restored to factory defaults.");
              }}
              className="text-[9.5px] uppercase font-black text-[#FF4757] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

      </div>

      {/* BULK ACTIONS BANNER (Displays only when profiles selected) */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#FF4757]/10 border border-[#FF4757]/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-[#FF4757]" size={16} />
                <span className="text-xs font-bold text-white">
                  <strong className="text-brand-cyan">{selectedUserIds.length}</strong> reseller target nodes checked on dashboard queue.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkBan}
                  className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
                >
                  Ban Selected
                </button>
                <button
                  onClick={handleBulkEmail}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
                >
                  Email Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF4757] hover:bg-[#FF4757]/95 text-white text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer shadow"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-xs text-gray-500 hover:text-white font-bold ml-2.5"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE WORKSPACE SHEETS */}
      <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl shadow-lg overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#252836] bg-[#12141A]/50 text-gray-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#FF4757] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3">Username & Contact</th>
                <th className="py-4 px-3 text-center">System ID</th>
                <th className="py-4 px-3 text-right">Balance Pool</th>
                <th className="py-4 px-3 text-right">Aggregate Spent</th>
                <th className="py-4 px-3 text-center">Bulk Orders</th>
                <th className="py-4 px-3">First Registered</th>
                <th className="py-4 px-3">Last Ping Active</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-5 text-right">Operations Hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252836]/40 font-bold text-gray-300 text-xs">
              
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 uppercase font-black tracking-widest text-[11px]">
                    No corresponding user profiles trace back to constraints.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#12141A]/40 transition-colors ${
                        isChecked ? 'bg-[#FF4757]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(u.id, e.target.checked)}
                          className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#FF4757] cursor-pointer"
                        />
                      </td>

                      {/* User Username Info card */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-xl font-bold text-xs flex items-center justify-center border border-white/5 shadow-inner ${u.avatarColor}`}>
                            {u.avatarColor ? u.username.slice(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white hover:text-brand-cyan transition-colors cursor-pointer text-xs" onClick={() => { setDrawerUserId(u.id); setDrawerTab('Overview'); }}>
                              @{u.username}
                            </span>
                            <span className="text-gray-500 text-[10px] font-mono leading-none mt-1 select-all">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* ID Badge */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="bg-[#12141A] border border-[#252836] px-2 py-1 rounded-md text-[10px] text-gray-400">
                          {u.id}
                        </span>
                      </td>

                      {/* Highlighted Balance */}
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-extrabold text-[12.5px]">
                        ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Total spent aggregate */}
                      <td className="py-3 px-3 text-right font-mono text-gray-400">
                        ${u.totalSpent.toLocaleString('en-US')}
                      </td>

                      {/* Total orders count */}
                      <td className="py-3 px-3 text-center font-mono text-indigo-400">
                        {u.totalOrders}
                      </td>

                      {/* Date joined */}
                      <td className="py-3 px-3 text-gray-500 text-[11px] font-mono">
                        {u.joinedDate}
                      </td>

                      {/* last active */}
                      <td className="py-3 px-3 text-gray-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                          <span>{u.lastActive}</span>
                        </div>
                      </td>

                      {/* Status pill */}
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[9.5px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider ${
                          u.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : u.status === 'Banned'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                            : 'bg-yellow-500/10 text-amber-500 border border-yellow-500/10'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      {/* Operations hub icons with custom triggers */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          <button
                            onClick={() => { setDrawerUserId(u.id); setDrawerTab('Overview'); }}
                            title="Inspect User Dossier"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#6C63FF]/15 hover:text-white border border-transparent hover:border-[#6C63FF]/20 text-gray-400 transition-all cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            onClick={() => {
                              setAdjustFundsUserId(u.id);
                              setAdjustType('Add');
                              setAdjustAmount('100.00');
                              setShowAdjustFundsModal(true);
                            }}
                            title="Adjust Balance Sheet"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-emerald-500/15 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 text-gray-400 transition-all cursor-pointer"
                          >
                            <DollarSign size={13} />
                          </button>

                          <button
                            onClick={() => handleToggleBanUser(u.id)}
                            title={u.status === 'Banned' ? 'Activate Account' : 'Restrict Profile Access'}
                            className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                              u.status === 'Banned'
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-[#FF4757] border-red-500/20'
                            }`}
                          >
                            {u.status === 'Banned' ? <UserCheck size={13} /> : <UserX size={13} />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            title="Delete Permanently"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#FF4757]/20 hover:text-red-400 border border-transparent hover:border-[#FF4757]/20 text-gray-400 transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL FOOTER */}
        <div className="bg-[#12141A]/60 border-t border-[#252836] px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] font-bold text-gray-500">
            Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong className="text-white">{filteredUsers.length}</strong> active registry results.
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-[#12141A] border border-[#252836] rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8.5 h-8.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#FF4757] text-white font-extrabold shadow shadow-red-500/10'
                      : 'bg-[#12141A] border border-[#252836] text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-[#12141A] border border-[#252836] rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          PAGE A DETAILED SLIDE-OUT DOSSIER DRAWER (Right 70% width block)
         ========================================================================= */}
      <AnimatePresence>
        {drawerUserId && targetDrawerUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[950] flex justify-end">
            
            {/* Click outside dismisser */}
            <div className="absolute inset-0" onClick={() => setDrawerUserId(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-[75%] bg-[#0D0F16] border-l border-[#1E2230] h-full shadow-2xl flex flex-col relative z-20 overflow-hidden text-left"
            >
              
              {/* Drawer Title Header */}
              <div className="p-6 bg-[#12141A] border-b border-[#1E2230] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center border border-white/5 ${targetDrawerUser.avatarColor}`}>
                    {targetDrawerUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-black text-white uppercase tracking-wider">
                        @{targetDrawerUser.username}
                      </h3>
                      <span className={`text-[9.5px]/none font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                        targetDrawerUser.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {targetDrawerUser.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5 font-mono">
                      Database Registry ID: <span className="text-white">{targetDrawerUser.id}</span> | Mail: {targetDrawerUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onShowToast(`Interactive editor opened for @${targetDrawerUser.username}.`);
                    }}
                    className="px-4 py-2 bg-[#1A1D26] hover:bg-[#252836] border border-[#252836] text-[10.5px] font-black text-white hover:text-brand-cyan rounded-xl transition-all cursor-pointer uppercase tracking-tight"
                  >
                    Edit Registry
                  </button>
                  <button
                    onClick={() => setDrawerUserId(null)}
                    className="p-2.5 bg-[#12141A] hover:bg-[#FF4757]/10 text-gray-400 hover:text-white rounded-xl transition-all border border-[#252836] cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* TABS NAVIGATION BAR */}
              <div className="px-6 bg-[#12141A]/50 border-b border-[#1E2230] flex gap-1 pt-2">
                {[
                  { id: 'Overview', label: 'Overview dossier', icon: FileText },
                  { id: 'Orders', label: 'Bulk Orders Log', icon: ShoppingBag },
                  { id: 'Transactions', label: 'Credits History', icon: CreditCard },
                  { id: 'Tickets', label: 'Support Tickets', icon: MessageSquare }
                ].map((tb) => {
                  const Icon = tb.icon;
                  const isActive = drawerTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => setDrawerTab(tb.id as any)}
                      className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
                        isActive
                          ? 'border-[#FF4757] text-[#FF4757] bg-[#FF4757]/5'
                          : 'border-transparent text-gray-500 hover:text-white hover:bg-white/[0.01]'
                      }`}
                    >
                      <Icon size={13} className={isActive ? 'text-[#FF4757]' : 'text-gray-500'} />
                      <span>{tb.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* DRAWER SCROLL CONTENT SPACE */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0B0F]">

                {/* TAB 1: OVERVIEW & CORE PROFILE BIO */}
                {drawerTab === 'Overview' && (
                  <div className="space-y-6">
                    
                    {/* Stat KPI grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-gray-500 block">Current Ledger Balance</span>
                        <span className="text-lg font-black text-emerald-400 block mt-1 pb-0.5 font-mono">
                          ${targetDrawerUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-gray-500 block">Cumulative Spent</span>
                        <span className="text-lg font-black text-white block mt-1 pb-0.5 font-mono">
                          ${targetDrawerUser.totalSpent.toLocaleString('en-US')}
                        </span>
                      </div>

                      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-gray-500 block">Bulk Orders Count</span>
                        <span className="text-lg font-black text-indigo-400 block mt-1 pb-0.5 font-mono animate-pulse">
                          {targetDrawerUser.totalOrders} Delivered
                        </span>
                      </div>

                      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-xl">
                        <span className="text-[9px] uppercase font-black text-gray-500 block">Registration Timestamp</span>
                        <span className="text-xs font-black text-gray-400 block mt-2 pb-0.5 font-mono">
                          {targetDrawerUser.joinedDate}
                        </span>
                      </div>

                    </div>

                    {/* Detailed Metadata fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      <div className="bg-[#12141A] border border-[#1E2230] rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-black uppercase text-white tracking-wider pb-2.5 border-b border-[#252836]">
                          Reseller Bio Profile Dossier
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-y-3.5 text-xs">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">Full Legal Name:</span>
                            <span className="text-white font-bold block mt-1">{targetDrawerUser.fullName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">Geo Location:</span>
                            <span className="text-white font-bold block mt-1">{targetDrawerUser.country}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">SMM Timezone Node:</span>
                            <span className="text-white font-mono block mt-1">{targetDrawerUser.timezone}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">Active Login IP:</span>
                            <span className="text-emerald-400 font-mono block mt-1">{targetDrawerUser.lastLoginIp}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">API Referral Code:</span>
                            <span className="text-brand-cyan font-mono block mt-1">{targetDrawerUser.referralCode}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-extrabold tracking-tight">Invited By:</span>
                            <span className="text-orange-400 block mt-1 font-semibold">{targetDrawerUser.referredBy || 'Organic Entrance'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes Section */}
                      <div className="bg-[#12141A] border border-[#1E2230] rounded-2xl p-5 flex flex-col justify-between gap-4">
                        <div className="border-b border-[#252836] pb-2 text-left">
                          <h4 className="text-xs font-black uppercase text-white tracking-wider">
                            Internal System Notes
                          </h4>
                          <p className="text-[9.5px] text-gray-500 mt-0.5">Confidential warnings restricted to operator role accounts.</p>
                        </div>

                        {/* Notes list */}
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1 flex-1 text-xs">
                          {targetDrawerUser.notes.length === 0 ? (
                            <span className="text-gray-600 block text-center py-4 font-black uppercase tracking-wider text-[10px]">
                              No internal warnings logged on database.
                            </span>
                          ) : (
                            targetDrawerUser.notes.map((nt, nIdx) => (
                              <div key={nIdx} className="bg-[#1A1D26] border border-[#252836] rounded-xl p-2.5">
                                <span className="text-[8.5px] font-mono text-gray-500">{nt.date}</span>
                                <p className="text-gray-300 font-bold mt-1 text-[11px] leading-relaxed">{nt.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Note writer form */}
                        <form onSubmit={handleAddDrawerNote} className="flex gap-2">
                          <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Append administrative operational note..."
                            className="flex-1 bg-[#1A1D26] border border-[#252836] rounded-xl p-2.5 text-[11px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF4757]"
                            rows={2}
                            required
                          />
                          <button
                            type="submit"
                            className="bg-[#FF4757]/15 hover:bg-[#FF4757] hover:text-white border border-[#FF4757]/25 text-[#FF4757] p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                          >
                            <Send size={14} />
                          </button>
                        </form>
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 2: BULK SMM ORDERS LIST */}
                {drawerTab === 'Orders' && (
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl overflow-hidden p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#252836]">
                      Delivered campaign ledgers (Filtered to client)
                    </h4>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#252836] text-gray-500 uppercase text-[9.5px] font-black">
                            <th className="pb-2">Order ID</th>
                            <th className="pb-2">Primary SMM Service</th>
                            <th className="pb-2 text-right">Sum Charged</th>
                            <th className="pb-2 text-center">Status</th>
                            <th className="pb-2 text-right">Delivery Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold">
                          {(ORDERS_MOCK_DATA[targetDrawerUser.id] || []).map((o) => (
                            <tr key={o.id} className="hover:bg-white/[0.01]">
                              <td className="py-2.5 font-mono text-white">{o.id}</td>
                              <td className="py-2.5 text-gray-400">{o.service}</td>
                              <td className="py-2.5 text-right text-emerald-400 font-mono">{o.amount}</td>
                              <td className="py-2.5 text-center">
                                <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black">
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-gray-500">{o.date}</td>
                            </tr>
                          ))}
                          {(!ORDERS_MOCK_DATA[targetDrawerUser.id] || ORDERS_MOCK_DATA[targetDrawerUser.id].length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500 uppercase font-black tracking-widest text-[10px]">
                                No documented campaign logs verified.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: CREDITS & BILLING TRANSACTIONS */}
                {drawerTab === 'Transactions' && (
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl overflow-hidden p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#252836]">
                      Double-Entry Billing Journal Verification
                    </h4>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#252836] text-gray-500 uppercase text-[9.5px] font-black">
                            <th className="pb-2">Post Date</th>
                            <th className="pb-2">Billing Action Point</th>
                            <th className="pb-2 text-right">Amount</th>
                            <th className="pb-2">Method Pathway</th>
                            <th className="pb-2 text-right">Reconciled Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold">
                          {(TRANSACTION_MOCK_DATA[targetDrawerUser.id] || []).map((t, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01]">
                              <td className="py-2.5 font-mono text-gray-500">{t.date}</td>
                              <td className="py-2.5">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${
                                  t.type === 'Deposit'
                                    ? 'bg-emerald-500/10 text-emerald-400 animate-pulse'
                                    : t.type === 'Order Payment'
                                    ? 'bg-red-500/10 text-red-400'
                                    : t.type === 'Refund'
                                    ? 'bg-blue-500/10 text-[#00D4FF]'
                                    : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {t.type}
                                </span>
                              </td>
                              <td className={`py-2.5 text-right font-mono text-[11.5px] ${t.amount.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {t.amount}
                              </td>
                              <td className="py-2.5 text-gray-400">{t.method}</td>
                              <td className="py-2.5 text-right text-white font-mono">{t.balanceAfter}</td>
                            </tr>
                          ))}
                          {(!TRANSACTION_MOCK_DATA[targetDrawerUser.id] || TRANSACTION_MOCK_DATA[targetDrawerUser.id].length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500 uppercase font-black tracking-widest text-[10px]">
                                No ledger transactions logged during current quarter billing period.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: TICKETS LIST */}
                {drawerTab === 'Tickets' && (
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl overflow-hidden p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider pb-2 border-b border-[#252836]">
                      Opened support channels dossier
                    </h4>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#252836] text-gray-500 uppercase text-[9.5px] font-black">
                            <th className="pb-2">Ticket ID</th>
                            <th className="pb-2">Subject Problem</th>
                            <th className="pb-2">Category</th>
                            <th className="pb-2 text-center">Operational Status</th>
                            <th className="pb-2 text-right">Modified Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold">
                          {(TICKETS_MOCK_DATA[targetDrawerUser.id] || []).map((tc) => (
                            <tr key={tc.id} className="hover:bg-white/[0.01]">
                              <td className="py-2.5 font-mono text-brand-cyan">{tc.id}</td>
                              <td className="py-2.5 text-white max-w-[200px] truncate">{tc.subject}</td>
                              <td className="py-2.5 text-gray-400">{tc.category}</td>
                              <td className="py-2.5 text-center">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${
                                  tc.status === 'Open'
                                    ? 'bg-red-500/10 text-red-500 animate-pulse'
                                    : 'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {tc.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-gray-500">{tc.lastUpdate}</td>
                            </tr>
                          ))}
                          {(!TICKETS_MOCK_DATA[targetDrawerUser.id] || TICKETS_MOCK_DATA[targetDrawerUser.id].length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500 uppercase font-black tracking-widest text-[10px]">
                                No support service requests created.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          ADD/DEDUCT FUNDS CONFIGURATION LAYER (Strict Modal form)
         ========================================================================= */}
      <AnimatePresence>
        {showAdjustFundsModal && targetAdjustUser && (
          <div className="fixed inset-0 bg-[#0A0B0F]/85 backdrop-blur-sm flex items-center justify-center z-[995] p-4 text-left">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1D202D] border-2 border-[#2E334D] p-6 rounded-2xl w-full max-w-lg shadow-2xl relative space-y-4"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-emerald-400" size={16} />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">
                    Manual Ledger Adjustment Trigger
                  </h3>
                </div>
                <button
                  onClick={() => setShowAdjustFundsModal(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1 rounded-md cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Target client indicators */}
              <div className="bg-[#12141A] rounded-xl p-3.5 flex items-center justify-between text-xs font-bold leading-normal border border-[#252836]">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-black">Target Client Reseller:</span>
                  <span className="text-white mt-1 block">@{targetAdjustUser.username} ({targetAdjustUser.fullName})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[9px] uppercase font-black font-mono">Current system Balance:</span>
                  <span className="text-emerald-400 font-mono mt-1 block">${targetAdjustUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmAdjustFunds} className="space-y-4 text-xs font-bold text-gray-300">
                
                {/* Check buttons */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Adjustment Transaction Direction</label>
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    
                    <button
                      type="button"
                      onClick={() => setAdjustType('Add')}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all cursor-pointer ${
                        adjustType === 'Add'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#12141A] text-gray-500 border-[#252836]'
                      }`}
                    >
                      <PlusCircle size={14} />
                      <span>Credit Funds (+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjustType('Deduct')}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all cursor-pointer ${
                        adjustType === 'Deduct'
                          ? 'bg-red-500/15 text-[#FF4757] border-red-500/30'
                          : 'bg-[#12141A] text-gray-500 border-[#252836]'
                      }`}
                    >
                      <MinusCircle size={14} />
                      <span>Deduct Funds (-)</span>
                    </button>

                  </div>
                </div>

                {/* Amount input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Adjustment Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>

                {/* Reason textarea required */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Audit Documentation Reason (Required)</label>
                  <textarea
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Provide audit reference tracking documentation notes (e.g. PayPal dispute resolution receipt #441)..."
                    className="bg-[#12141A] border border-[#2E334D] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                    rows={3}
                    required
                  />
                </div>

                {/* Final Double check confirmation warning warning */}
                <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-3 flex gap-2.5 text-[10.5px] leading-relaxed text-amber-500 shadow-inner">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Security Warning Checkpoint:</strong> This operational action will immediately <strong>{adjustType === 'Add' ? 'award credit values' : 'deduct liquid capital'}</strong> equal to <strong>${adjustAmount} USD</strong> from target account <strong>@{targetAdjustUser.username}</strong> on master ledgers database.
                  </p>
                </div>

                {/* Bottom button controls */}
                <div className="pt-4 flex justify-end gap-3 border-t border-[#2C3147]">
                  <button
                    type="button"
                    onClick={() => setShowAdjustFundsModal(false)}
                    className="px-4.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      adjustType === 'Add'
                        ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400 hover:opacity-95 shadow shadow-emerald-500/10'
                        : 'bg-gradient-to-tr from-red-500 to-[#FF4757] hover:opacity-95 shadow shadow-red-500/10'
                    }`}
                  >
                    Confirm ledger adjustment
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
