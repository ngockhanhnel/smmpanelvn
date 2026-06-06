import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Layers,
  CreditCard,
  Code2,
  Users,
  MessageCircle,
  User,
  Wallet,
  Bell,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  CheckCircle,
  TrendingUp,
  ArrowDownCircle,
  ChevronDown,
  ArrowUpRight,
  Settings,
  Key,
  LogOut,
  Info,
  ExternalLink,
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import NewOrderSection from './NewOrderSection';
import OrderHistorySection from './OrderHistorySection';
import SMMOperationsSection from './SMMOperationsSection';
import SMMSupportAndSettingsSection from './SMMSupportAndSettingsSection';
import AdminDashboardView from './AdminDashboardView';
import DevToolsOverlay from './DevToolsOverlay';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';

interface DashboardViewProps {
  email: string;
  onLogout: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function DashboardView({ email, onLogout, showToast }: DashboardViewProps) {
  const username = email.split('@')[0];

  // Layout & Navigation States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | string>('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Modal State for Simulated Actions
  const [activeModal, setActiveModal] = useState<{ title: string; content: string } | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // SMM Interactive state trackers (Synced in real time with Firebase)
  const [walletBalance, setWalletBalance] = useState<number>(0.0);
  const [totalSpent, setTotalSpent] = useState<number>(0.0);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // Setup Firestore real-time subscribers
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // 1. Subscribe to user profile (balance, spent, role status, etc)
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const val = snap.data();
        setWalletBalance(val.balance || 0.0);
        setTotalSpent(val.totalSpent || 0.0);
        setUserRole(val.role || 'user');
      }
    });

    // 2. Subscribe to current user's orders list from Firestore
    const ordersCol = collection(db, 'orders');
    const qOrders = query(ordersCol, where('userId', '==', currentUser.uid));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort: newest first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrdersList(list);
    });

    // 3. Subscribe to current user's transactions list from Firestore
    const txCol = collection(db, 'transactions');
    const qTx = query(txCol, where('userId', '==', currentUser.uid));
    const unsubTx = onSnapshot(qTx, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort: newest first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTransactionsList(list);
    });

    return () => {
      unsubUser();
      unsubOrders();
      unsubTx();
    };
  }, []);

  // Sync simulated/real stats representation dynamically
  const stats = [
    { label: 'Total Orders', value: ordersList.length.toString(), trend: 'Real-time sync', icon: ShoppingBag, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
    { label: 'Active Orders', value: ordersList.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'in_progress' || s === 'pending' || s === 'partial' || s === 'in progress' || s === 'pending' || s === 'partial';
      }).length.toString(), trend: 'Active queue status', icon: Zap, color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' },
    { label: 'Completed Orders', value: ordersList.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'completed';
      }).length.toString(), trend: 'Successfully completed', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, trend: 'Reseller discount tier', icon: TrendingUp, color: 'text-[#9b5de5] bg-[#9b5de5]/10 border-[#9b5de5]/20' },
    { label: 'Current Balance', value: `$${walletBalance.toFixed(2)}`, trend: 'No pending deposit', icon: Wallet, color: 'text-brand-warning bg-brand-warning/10 border-brand-warning/20' },
    { label: 'Total Deposited', value: `$${(walletBalance + totalSpent).toFixed(2)}`, trend: 'Synced with balance', icon: ArrowDownCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  ];

  // Chart Data is gracefully derived from real dataset, falling back to simulated block if empty
  const lineChartData = ordersList.length > 0 
    ? ordersList.slice(0, 15).reverse().map((o, idx) => ({
        day: o.createdAt ? new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Order ${idx+1}`,
        'Total Orders': idx + 1,
        'Completed Orders': ordersList.filter((x, index) => index <= idx && x.status === 'completed').length,
      }))
    : Array.from({ length: 15 }, (_, i) => ({
        day: `Day ${i + 1}`,
        'Total Orders': Math.floor(Math.random() * 2) + i + 1,
        'Completed Orders': Math.max(0, Math.floor(Math.random() * 2) + i - 1),
      }));

  const pieChartData = [
    { name: 'Completed', value: ordersList.filter(o => (o.status || '').toLowerCase() === 'completed').length || 1, color: '#00C896' },
    { name: 'Active', value: ordersList.filter(o => (o.status || '').toLowerCase() === 'in_progress' || (o.status || '').toLowerCase() === 'processing').length || 1, color: '#00D4FF' },
    { name: 'Pending', value: ordersList.filter(o => (o.status || '').toLowerCase() === 'pending').length || 1, color: '#FFB800' },
    { name: 'Cancelled', value: ordersList.filter(o => (o.status || '').toLowerCase() === 'canceled' || (o.status || '').toLowerCase() === 'cancelled').length || 1, color: '#FF4757' },
  ];

  // Map top 5 real orders
  const recentOrders = ordersList.slice(0, 5).map(o => ({
    id: o.id ? `#${o.id.substring(0, 7)}` : '#N/A',
    service: o.serviceName || 'Service Order',
    target: o.link || 'unknown link',
    qty: o.quantity ? Number(o.quantity).toLocaleString() : '0',
    price: `$${(o.charge || 0.0).toFixed(2)}`,
    status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : 'Pending',
    date: o.createdAt ? o.createdAt.split('T')[0] : 'N/A'
  }));

  const topServices = [
    { name: 'Instagram Real Followers [No Drop]', useCount: '450 orders', percentage: 85 },
    { name: 'TikTok High-Speed Views [Instant]', useCount: '320 orders', percentage: 70 },
    { name: 'YouTube Legit High-Retention Views', useCount: '210 orders', percentage: 55 },
    { name: 'X/Twitter Retweets & Real Likes', useCount: '150 orders', percentage: 40 },
    { name: 'Telegram Post Views [Llifetime Guarantee]', useCount: '110 orders', percentage: 28 },
  ];

  // Map top 5 real transactions
  const transactions = transactionsList.slice(0, 5).map(t => ({
    type: `Funds added: ${t.method || 'Credit/Debit Card'}`,
    amount: `+$${(t.amount || 0).toFixed(2)}`,
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    status: t.status === 'completed' || t.status === 'Approved' ? 'Approved' : 'Pending'
  }));

  const notifications = [
    { title: 'TikTok Speed Update', desc: 'TikTok Views (Service #402) has been upgraded. Current delivery rate is now 10M/day.', time: '2 hrs ago', unread: true },
    { title: 'Support Ticket Resolved', desc: 'Your support ticket #4492 regarding order speed has been marked as resolved.', time: '1 day ago', unread: true },
    { title: 'Deposit Successful', desc: 'Successfully credited $50.00 with Crypto Wallet Gateway.', time: '3 days ago', unread: false },
  ];

  // Colors mapping for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-[#00C896] border-emerald-500/20';
      case 'In Progress':
        return 'bg-brand-cyan/10 text-[#00D4FF] border-brand-cyan/20';
      case 'Pending':
        return 'bg-brand-warning/10 text-[#FFB800] border-brand-warning/20';
      case 'Partial':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Cancelled':
        return 'bg-brand-danger/10 text-[#FF4757] border-brand-danger/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleMenuClick = (menuId: string, label: string) => {
    setActiveMenu(menuId);
    setIsMobileSidebarOpen(false);
    if (
      menuId !== 'dashboard' &&
      menuId !== 'new-order' &&
      menuId !== 'orders' &&
      menuId !== 'services' &&
      menuId !== 'add-funds' &&
      menuId !== 'api' &&
      menuId !== 'support' &&
      menuId !== 'profile'
    ) {
      setActiveModal({
        title: `${label} Service`,
        content: `You have accessed the fully simulated "${label}" panel. In are ready to submit custom reseller variables, link target accounts, and customize SMM services. Detailed dashboard flows have loaded.`,
      });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-order', label: 'New Order', icon: PlusCircle },
    { id: 'orders', label: 'Orders History', icon: ListOrdered },
    { id: 'services', label: 'Reseller Services', icon: Layers },
    { id: 'add-funds', label: 'Add Funds', icon: CreditCard },
    { id: 'api', label: 'API Integration', icon: Code2 },
    { id: 'affiliate', label: 'Affiliate Net', icon: Users },
    { id: 'support', label: 'Support Tickets', icon: MessageCircle },
    { id: 'profile', label: 'Account Profile', icon: User },
  ];

  if (isAdminMode) {
    return (
      <AdminDashboardView
        email={email}
        onSwitchToUser={() => setIsAdminMode(false)}
      />
    );
  }

  return (
    <div className="w-full flex h-screen bg-[#0A0B0F] text-white overflow-hidden relative font-sans">
      
      {/* Sidebar mobile overlay backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 1. LEFT SIDEBAR */}
      <div
        className={`bg-[#12141A] border-r border-[#252836] shrink-0 h-full flex flex-col justify-between transition-all duration-300 z-50
          fixed md:relative top-0 bottom-0 left-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-[76px]' : 'md:w-[260px]'}
          w-[260px]
        `}
      >
        <div className="flex flex-col overflow-y-auto flex-1">
          {/* Logo Section */}
          <div className="h-[70px] border-b border-[#252836] flex items-center justify-between px-4.5 select-none shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center text-white shrink-0">
                <svg
                  className="w-5.5 h-5.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <span className="text-lg font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  ProSMM
                </span>
              )}
            </div>

            {/* Sidebar toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#1A1D26]/60 border border-[#252836] transition-colors cursor-pointer hidden md:block"
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>

            {/* Mobile close button inside sidebar */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#1A1D26]/60 border border-[#252836] transition-colors cursor-pointer md:hidden"
            >
              <X size={15} />
            </button>
          </div>

          {/* Balance Widget */}
          <div className="p-4.5">
            <div
              className={`bg-gradient-to-br from-[#1A1D26] to-[#12141A] border border-[#252836] hover:border-brand-primary/30 transition-all rounded-xl p-3.5 flex items-center gap-3.5 ${
                isSidebarCollapsed ? 'justify-content' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-warning/15 border border-brand-warning/20 flex items-center justify-center text-brand-warning shrink-0">
                <Wallet size={16} />
              </div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                    Wallet Balance
                  </span>
                  <span className="text-base font-extrabold text-white tracking-tight">
                    ${walletBalance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id, item.label)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold select-none transition-all cursor-pointer relative group ${
                    isActive
                      ? 'text-white bg-brand-primary/15 border border-brand-primary/25 shadow-lg shadow-brand-primary/5'
                      : 'text-[#9BA3C7] hover:text-white hover:bg-white/4 border border-transparent'
                  }`}
                >
                  <IconComponent size={16} className={isActive ? 'text-brand-cyan' : 'text-[#858da8] group-hover:text-white'} />
                  {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                    <span className="truncate leading-none">{item.label}</span>
                  )}
                  {isActive && (!isSidebarCollapsed || isMobileSidebarOpen) && (
                    <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#252836] shrink-0 bg-[#0E1014] flex flex-col gap-2">
          {(!isSidebarCollapsed || isMobileSidebarOpen) && (
            <button
              onClick={() => setIsAdminMode(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[#FF4757] hover:text-white bg-[#FF4757]/10 hover:bg-[#FF4757]/20 border border-[#FF4757]/15 rounded-xl transition-all cursor-pointer mb-1 uppercase tracking-wider relative z-50"
            >
              <ShieldAlert size={13} />
              <span>Admin Terminal</span>
            </button>
          )}

          <div
            className={`flex items-center gap-2.5 p-1.5 rounded-xl ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-bold text-xs text-brand-cyan">
              {username[0].toUpperCase()}
            </div>
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white capitalize truncate">
                  {username}
                </span>
                <span className="text-[10px] text-brand-text-secondary truncate">
                  {email}
                </span>
              </div>
            )}
          </div>

          {(!isSidebarCollapsed || isMobileSidebarOpen) && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-brand-danger/10 border border-transparent hover:border-brand-danger/15 rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN LAYOUT AND CORE VIEWPORTS */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0B0F] relative">

        {/* TOP HEADER */}
        <header className="h-[70px] border-b border-[#252836] px-4 md:px-6 lg:px-8 bg-[#12141A]/60 backdrop-blur-md flex items-center justify-between shrink-0 select-none relative z-40">
          <div className="flex items-center gap-3.5 md:gap-5">
            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-gray-400 hover:text-white bg-[#1A1D26]/60 border border-[#252836] cursor-pointer md:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo on mobile inside header */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center text-white shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-sm font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ProSMM
              </span>
            </div>

            <h1 className="text-sm lg:text-lg font-black tracking-tight text-white uppercase tracking-wider hidden md:block">
              {activeMenu === 'dashboard' ? 'Dashboard Overview' : activeMenu === 'support' ? 'Support Tickets Hub' : activeMenu === 'profile' ? 'Profile & settings' : `${activeMenu}`}
            </h1>

            {/* Fake Search Bar */}
            <div className="relative hidden md:flex items-center w-64">
              <Search className="absolute left-3.5 text-[#858da8]" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SMM platform or services..."
                className="w-full bg-[#1A1D26]/70 border border-brand-border/40 text-xs py-2.5 pl-10 pr-4 rounded-xl text-white outline-none focus:border-brand-primary placeholder:text-gray-600 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Balance shows as "$24.50" only (no label) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-warning/10 border border-brand-warning/20 text-brand-warning md:hidden text-xs font-extrabold font-mono">
              ${walletBalance.toFixed(2)}
            </div>

            {/* Notifications Alert Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className="p-1.5 sm:p-2.5 rounded-xl border border-brand-border/60 bg-[#1A1D26]/50 hover:bg-[#1A1D26]/90 text-[#9BA3C7] hover:text-white transition-all cursor-pointer relative"
              >
                <Bell size={15} className="sm:w-4 sm:h-4" />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-brand-danger border-2 border-[#12141A] rounded-full text-[8px] sm:text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-80 bg-[#1A1D26] border border-[#252836] shadow-2xl rounded-2xl p-4 flex flex-col gap-3 min-h-[220px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#252836]">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        Pending Notifications
                      </span>
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {notifications.map((notif, index) => (
                        <div
                           key={index}
                           className={`p-3 rounded-xl border transition-all ${
                            notif.unread
                              ? 'bg-brand-primary/8 border-brand-primary/15'
                              : 'bg-white/[0.02] border-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-semibold text-white tracking-tight">
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-[#858da8] shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-text-secondary leading-relaxed mt-1">
                            {notif.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        handleMenuClick('support', 'Support Tickets');
                      }}
                      className="w-full text-center py-2.5 rounded-xl bg-brand-primary/10 text-brand-cyan hover:text-white hover:bg-brand-primary/20 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      View All in Security Hub
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-xl border border-brand-border/60 bg-[#1A1D26]/40 hover:bg-[#1A1D26]/90 text-white transition-all cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center font-bold text-[#12141A] text-xs">
                  {username[0].toUpperCase()}
                </div>
                <ChevronDown size={12} className="text-[#9BA3C7] hidden sm:block" />
              </button>

              {/* Profile dropdown menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-56 bg-[#1A1D26] border border-[#252836] shadow-2xl rounded-2xl overflow-hidden p-1.5 z-50 flex flex-col gap-0.5"
                  >
                    <div className="px-3.5 py-3 hover:bg-white/[0.02] border-b border-[#252836] mb-1">
                      <span className="block text-xs font-bold text-white capitalize truncate">
                        {username}
                      </span>
                      <span className="block text-[10px] text-brand-text-secondary truncate mt-0.5">
                        {email}
                      </span>
                    </div>

                    {[
                      { icon: User, label: 'Profile Settings', handler: () => handleMenuClick('profile', 'Account Profile') },
                      { icon: Settings, label: 'Platform Settings', handler: () => handleMenuClick('platform-settings', 'Preferences') },
                      { icon: Key, label: 'API Keys', handler: () => handleMenuClick('api', 'API Integration') },
                      { icon: ShieldAlert, label: 'Admin Terminal', handler: () => setIsAdminMode(true) },
                    ].map((menuItem, index) => {
                      const Icon = menuItem.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setIsProfileOpen(false);
                            menuItem.handler();
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-brand-text-secondary hover:text-white hover:bg-white/4 rounded-xl transition-all cursor-pointer text-left font-medium"
                        >
                          <Icon size={14} className="text-[#858da8]" />
                          <span>{menuItem.label}</span>
                        </button>
                      );
                    })}

                    <div className="border-t border-[#252836] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-400 hover:bg-brand-danger/10 hover:text-red-300 rounded-xl transition-all cursor-pointer text-left font-semibold"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8 space-y-7 relative z-10">

          {activeMenu === 'new-order' ? (
            <NewOrderSection
              availableBalance={walletBalance}
              deductBalance={(amount) => {
                setWalletBalance(prev => Math.max(0, prev - amount));
                setTotalSpent(prev => prev + amount);
              }}
              onOrderSuccess={(newOrder) => {
                setOrdersList(prev => [newOrder, ...prev]);
              }}
            />
          ) : activeMenu === 'orders' ? (
            <OrderHistorySection
              integratedOrders={ordersList}
              availableBalance={walletBalance}
              deductBalance={(amount) => {
                setWalletBalance(prev => Math.max(0, prev - amount));
                setTotalSpent(prev => prev + amount);
              }}
            />
          ) : activeMenu === 'services' || activeMenu === 'add-funds' || activeMenu === 'api' ? (
            <SMMOperationsSection
              activeTab={activeMenu === 'services' ? 'services' : activeMenu === 'add-funds' ? 'add-funds' : 'api'}
              setActiveTab={(tab) => {
                setActiveMenu(tab);
              }}
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance}
              totalSpent={totalSpent}
              setTotalSpent={setTotalSpent}
              onRedirectToNewOrder={(serviceName, serviceId) => {
                localStorage.setItem('prosmm_preset_service_id', serviceId);
                localStorage.setItem('prosmm_preset_service_name', serviceName);
                setActiveMenu('new-order');
              }}
            />
          ) : activeMenu === 'support' || activeMenu === 'profile' ? (
            <SMMSupportAndSettingsSection
              activeView={activeMenu as 'support' | 'profile'}
              setActiveView={(view) => {
                setActiveMenu(view);
              }}
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance}
              totalSpent={totalSpent}
              setTotalSpent={setTotalSpent}
            />
          ) : (
            <>
              {/* SECTION 1 — ANNOUNCEMENT BANNER */}
              <AnimatePresence>
                {showAnnouncement && (
                  <motion.div
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.22 }}
                    className="relative bg-gradient-to-r from-brand-primary/15 to-brand-cyan/10 border border-[#6C63FF]/25 py-4 pl-4.5 pr-11 rounded-2xl flex items-start gap-3.5"
                  >
                    <div className="p-2 bg-[#6C63FF]/15 rounded-xl text-[#00D4FF] shrink-0">
                      <Info size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        SMM Reseller Operations Bulletin
                      </h4>
                      <p className="text-xs text-brand-text-secondary leading-relaxed max-w-4xl">
                        🎉 New services successfully loaded! Check out our new TikTok High-Speed Packages with lifetime drop guarantees and updated algorithm support. Connect your reseller clients now.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAnnouncement(false)}
                      className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      aria-label="Dismiss bulletin"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SECTION 2 — STATS CARDS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-[#1A1D26] border border-[#252836] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-md hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 min-w-0"
                    >
                      <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                        <span className="text-[8px] sm:text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider sm:tracking-widest truncate">
                          {stat.label}
                        </span>
                        <span className="text-semibold sm:text-2xl font-black text-white tracking-tight truncate">
                          {stat.value}
                        </span>
                        <span className="text-[8px] sm:text-[10px] font-bold text-brand-cyan bg-[#00D4FF]/8 py-0.5 px-1.5 sm:px-2 rounded border border-[#00D4FF]/10 w-fit truncate">
                          {stat.trend}
                        </span>
                      </div>
                      <div className={`p-2 sm:p-3.5 rounded-lg sm:rounded-xl shrink-0 border w-fit ${stat.color}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION 3 — CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                
                {/* Left chart (60% width) */}
                <div className="lg:col-span-6 bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      SMM Order Campaigns (This Month)
                    </h3>
                    <span className="text-[10px] text-brand-text-secondary font-bold">
                      Daily Update • Verified
                    </span>
                  </div>
                  <div className="h-[260px] w-full text-xs font-medium">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252836" />
                        <XAxis dataKey="day" stroke="#4C5270" tickLine={false} />
                        <YAxis stroke="#4C5270" tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1A1D26',
                            borderRadius: '0.75rem',
                            border: '1px solid #252836',
                            color: '#fff',
                          }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                        <Line
                          type="monotone"
                          dataKey="Total Orders"
                          stroke="#6C63FF"
                          strokeWidth={3}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Completed Orders"
                          stroke="#00D4FF"
                          strokeWidth={3}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right chart (40% width) */}
                <div className="lg:col-span-4 bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Campaign Breakdown
                    </h3>
                    <span className="text-[10px] text-brand-text-secondary font-bold">
                      Live Status %
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                    <div className="h-[125px] w-[180px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full text-xs font-semibold text-brand-text-secondary px-2">
                      {pieChartData.map((segment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded hover:scale-110 transition-transform shrink-0" style={{ backgroundColor: segment.color }} />
                          <span className="truncate">{segment.name} ({segment.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 4 — RECENT ORDERS TABLE */}
              <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#252836]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">Recent SMM Campaign Log</span>
                    <span className="text-[10px] font-bold text-[#00D4FF] bg-[#00D4FF]/8 px-2 py-0.5 rounded-full">Live Monitor</span>
                  </div>
                  <button
                    onClick={() => handleMenuClick('orders', 'Orders History')}
                    className="text-xs font-bold text-brand-cyan hover:text-[#00D4FF]/80 transition-colors bg-transparent flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>View Full Registry</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-brand-border/40 bg-[#12141A] text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider select-none">
                        <th className="py-3.5 px-4.5">Order ID</th>
                        <th className="py-3.5 px-4.5">SMM Service Target</th>
                        <th className="py-3.5 px-4.5">Destination Link</th>
                        <th className="py-3.5 px-4.5">Quantity</th>
                        <th className="py-3.5 px-4.5">Cost</th>
                        <th className="py-3.5 px-4.5">Status</th>
                        <th className="py-3.5 px-4.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/20 text-xs font-medium text-gray-200">
                      {ordersList.slice(0, 8).map((order, index) => (
                        <tr key={index} className="hover:bg-white/[0.015] transition-colors leading-relaxed">
                          <td className="py-3 px-4.5 font-mono text-gray-400">{order.id}</td>
                          <td className="py-3 px-4.5 font-semibold text-white">{order.service}</td>
                          <td className="py-3 px-4.5 text-brand-cyan font-mono text-[11px] truncate max-w-[150px]">
                            {order.target}
                          </td>
                          <td className="py-3 px-4.5 font-mono">{order.qty}</td>
                          <td className="py-3 px-4.5 text-white font-bold">{order.price}</td>
                          <td className="py-3 px-4.5">
                            <span className={`inline-block text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 rounded-md border ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4.5 text-right">
                            <button
                              onClick={() =>
                                setActiveModal({
                                  title: `Campaign Details: Order ID ${order.id}`,
                                  content: `SMM Campaign Target: ${order.service}\nLink Target: ${order.target}\nOrder Quantity: ${order.qty}\nCharged Price: ${order.price}\nRequested On: ${order.date}\nSystem Status: ${order.status}`,
                                })
                              }
                              className="text-[11px] font-bold text-[#858da8] hover:text-white bg-[#12141A] hover:bg-brand-primary px-3 py-1.5 rounded-lg border border-brand-border hover:border-transparent transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5 — QUICK ACTIONS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: 'Place New Order',
                    desc: 'Instantly build custom target follower, comments views pipelines.',
                    icon: PlusCircle,
                    btnText: 'New Order',
                    variant: 'gradient' as const,
                    handler: () => handleMenuClick('new-order', 'New Order'),
                  },
                  {
                    title: 'Credit Wallet Gateway',
                    desc: 'Increase your platform balance instantly with cryptos or credit.',
                    icon: CreditCard,
                    btnText: 'Add Funds',
                    variant: 'outline' as const,
                    handler: () => handleMenuClick('add-funds', 'Add Funds'),
                  },
                  {
                    title: 'View Integration APIs',
                    desc: 'Direct programmatic REST connections to over 14,000 panel keys.',
                    icon: Code2,
                    btnText: 'API Docs',
                    variant: 'outline' as const,
                    handler: () => handleMenuClick('api', 'API Integration'),
                  },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={i}
                      className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5.5 flex flex-col justify-between gap-4.5 shadow-md hover:border-brand-primary/25 transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center text-brand-cyan mb-1 shrink-0">
                          <Icon size={18} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-white tracking-wider">
                          {action.title}
                        </h4>
                        <p className="text-xs text-brand-text-secondary leading-relaxed">
                          {action.desc}
                        </p>
                      </div>

                      <button
                        onClick={action.handler}
                        className={`w-full py-2.5 px-4.5 rounded-xl font-bold text-xs select-none cursor-pointer transition-all ${
                          action.variant === 'gradient'
                            ? 'bg-gradient-to-r from-brand-primary to-brand-cyan hover:opacity-95 text-white shadow-md shadow-brand-primary/10'
                            : 'border border-brand-border bg-[#12141A]/60 text-white hover:bg-[#12141A] hover:border-brand-primary/40'
                        }`}
                      >
                        {action.btnText}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* SECTION 6 — BOTTOM INFO ROW (2 columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                
                {/* Left: Top Services Used */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                    <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <TrendingUp size={14} className="text-brand-success" />
                      <span>Top SMM Reseller Packages</span>
                    </h3>
                    <span className="text-[10px] text-brand-cyan font-bold uppercase">Popularity</span>
                  </div>

                  <div className="flex flex-col gap-4.5">
                    {topServices.map((service, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-white truncate max-w-[280px] md:max-w-md">{service.name}</span>
                          <span className="text-brand-cyan font-mono shrink-0">{service.useCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#12141A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-cyan rounded-full transition-all duration-1000"
                            style={{ width: `${service.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Recent Transactions */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                    <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <DollarSign size={14} className="text-brand-cyan" />
                      <span>Funding & Transactions history</span>
                    </h3>
                    <span className="text-[10px] text-brand-text-secondary font-bold">Ledger Logs</span>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {transactions.map((tx, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-xl bg-[#12141A]/50 border border-brand-border/30 hover:border-brand-primary/20 hover:bg-[#12141A] transition-all"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-white max-w-[250px] truncate">
                            {tx.type}
                          </span>
                          <span className="text-[10px] text-[#858da8]">{tx.date}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-xs font-extrabold ${
                              tx.amount.startsWith('+') ? 'text-brand-success' : 'text-[#9b5de5]'
                            }`}
                          >
                            {tx.amount}
                          </span>
                          <span className="text-[9px] uppercase font-semibold text-brand-text-secondary bg-white/4 px-1.5 py-0.5 rounded">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

        </main>

        {/* 8. BOTTOM NAVIGATION (mobile only) */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#12141A] border-t border-[#252836] flex items-center justify-around px-2 z-[40] md:hidden">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'new-order', label: 'New Order', icon: PlusCircle },
            { id: 'orders', label: 'Orders', icon: ListOrdered },
            { id: 'add-funds', label: 'Add Funds', icon: CreditCard },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMenu === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleMenuClick(tab.id, tab.label)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3.5 select-none transition-all cursor-pointer ${
                  isActive ? 'text-brand-cyan' : 'text-[#8F94B5] hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-cyan animate-pulse' : 'text-[#8F94B5]'} />
                <span className="text-[9.5px] font-extrabold tracking-wide uppercase leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE INFO MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal main content view */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#1A1D26] border-t sm:border border-[#252836] rounded-t-3xl sm:rounded-2xl w-full max-w-full sm:max-w-md p-6 shadow-2xl relative z-10 flex flex-col gap-4 text-left fixed sm:relative max-h-[85vh] sm:max-h-none overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">
                  {activeModal.title}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-brand-text-secondary leading-relaxed bg-[#12141A] p-4 rounded-xl border border-[#252836] font-medium whitespace-pre-wrap">
                {activeModal.content}
              </div>

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4.5 py-3 sm:py-2 rounded-xl text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary/95 transition-colors cursor-pointer text-center"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DevToolsOverlay
        isAdmin={false}
        setIsAdmin={(val) => {
          if (val) {
            setIsAdminMode(true);
          }
        }}
        activeMenu={activeMenu}
        setActiveMenu={(val) => setActiveMenu(val)}
        onResetState={async () => {
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userRef, {
                balance: 100.00,
                totalSpent: 15.00,
                totalOrders: 2
              });
              localStorage.clear();
              showToast('Developer Reset: Success! Balance set to $100.00 in Firestore.', 'success');
            } catch (err: any) {
              showToast('Developer Reset failed: ' + err.message, 'error');
            }
          } else {
            showToast('No authenticated user found for reset.', 'warning');
          }
        }}
      />
    </div>
  );
}
