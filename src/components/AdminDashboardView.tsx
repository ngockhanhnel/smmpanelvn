import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ShoppingBag,
  Layers,
  Server,
  CreditCard,
  Tag,
  FileText,
  MessageSquare,
  Megaphone,
  Terminal,
  Settings,
  DollarSign,
  UserPlus,
  AlertCircle,
  Clock,
  CheckCircle2,
  Bell,
  Search,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  UserCheck,
  Zap,
  Globe,
  Database,
  Smartphone,
  Eye,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';
import AdminUserManagement from './AdminUserManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminServiceManagement from './AdminServiceManagement';
import AdminProviderManagement from './AdminProviderManagement';
import AdminPaymentManagement from './AdminPaymentManagement';
import AdminCouponManagement from './AdminCouponManagement';
import AdminSettingsManagement from './AdminSettingsManagement';
import AdminTicketsManagement from './AdminTicketsManagement';
import DevToolsOverlay from './DevToolsOverlay';

interface AdminDashboardProps {
  email: string;
  onSwitchToUser: () => void;
}

// Sparklines raw trend coordinates for the four KPI cards
const REVENUE_SPARK = [
  { val: 120 }, { val: 142 }, { val: 110 }, { val: 180 }, { val: 155 }, { val: 190 }, { val: 210 }, { val: 230 }
];
const ORDERS_SPARK = [
  { val: 450 }, { val: 420 }, { val: 610 }, { val: 560 }, { val: 780 }, { val: 720 }, { val: 810 }, { val: 847 }
];
const USERS_SPARK = [
  { val: 12 }, { val: 18 }, { val: 15 }, { val: 22 }, { val: 29 }, { val: 25 }, { val: 30 }, { val: 34 }
];
const TICKETS_SPARK = [
  { val: 15 }, { val: 14 }, { val: 12 }, { val: 10 }, { val: 11 }, { val: 9 }, { val: 7 }, { val: 8 }
];

// Interactive platform distribution chart
const PLATFORM_PIE_DATA = [
  { name: 'Instagram', value: 40, color: '#6C63FF' },
  { name: 'TikTok', value: 25, color: '#00D4FF' },
  { name: 'YouTube', value: 15, color: '#FF4757' },
  { name: 'Facebook', value: 10, color: '#FFB800' },
  { name: 'Others', value: 10, color: '#858DA8' }
];

// Composed chart dataset for 30 days
const GENERATE_COMPOSED_DATA = (days: number) => {
  return Array.from({ length: days }, (_, idx) => {
    const dayNum = idx + 1;
    // trend upwards
    const revenueFactor = 900 + (idx * 15) + Math.floor(Math.random() * 250);
    const ordersFactor = 600 + (idx * 8) + Math.floor(Math.random() * 180);
    return {
      day: `Jun ${String(dayNum).padStart(2, '0')}`,
      Revenue: revenueFactor,
      Orders: ordersFactor
    };
  });
};

const STATS_CATEGORY_DATA = [
  { name: 'Instagram', Revenue: 45230, fill: '#6C63FF' },
  { name: 'TikTok', Revenue: 28100, fill: '#00D4FF' },
  { name: 'YouTube', Revenue: 18430, fill: '#FF4757' },
  { name: 'Facebook', Revenue: 12100, fill: '#FFB800' },
  { name: 'Others', Revenue: 24570, fill: '#858DA8' }
];

export default function AdminDashboardView({ email, onSwitchToUser }: AdminDashboardProps) {
  const [adminMenu, setAdminMenu] = useState<'dashboard' | string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [systemUptimeCheck, setSystemUptimeCheck] = useState<string>('Just now');
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Dynamic lists with interactive action triggers
  const [adminOrdersList, setAdminOrdersList] = useState([
    { id: '#89472', user: 'agent_supreme', service: 'TikTok Viral High-Speed Views', amount: '$12.50', status: 'Completed', logo: '🎵' },
    { id: '#89471', user: 'hyperScale_co', service: 'Instagram High-Quality Comments', amount: '$4.20', status: 'In Progress', logo: '📸' },
    { id: '#89470', user: 'cuahangtienloi', service: 'YouTube Watch Hours Lifetime Pack', amount: '$45.00', status: 'Pending', logo: '📺' },
    { id: '#89469', user: 'v_creator_vn', service: 'Facebook Fanpage Likes & Boost', amount: '$8.40', status: 'Processing', logo: '👍' },
    { id: '#89468', user: 'nasdaq_hype', service: 'Twitter/X Real Bio Followers', amount: '$21.10', status: 'Completed', logo: '🐦' },
    { id: '#89467', user: 'synergy_smm', service: 'Telegram Supergroup Members Active', amount: '$15.00', status: 'Cancelled', logo: '✈️' },
    { id: '#89466', user: 'mick_t_views', service: 'TikTok Instant Shares [Speed 5M/D]', amount: '$1.80', status: 'Completed', logo: '🎵' },
    { id: '#89465', user: 'global_resell', service: 'Instagram Reels Custom Reach Views', amount: '$6.50', status: 'Completed', logo: '📸' }
  ]);

  const [recentUsers, setRecentUsers] = useState([
    { name: 'synergy_smm', email: 'contact@synergysmm.com', registered: 'Jun 05, 18:22 pm', initial: 'S', color: 'bg-[#6C63FF]/20 text-[#6C63FF]' },
    { name: 'mick_t_views', email: 'mick.thompson3@gmail.com', registered: 'Jun 05, 15:45 pm', initial: 'M', color: 'bg-[#00D4FF]/20 text-[#00D4FF]' },
    { name: 'global_resell', email: 'admin@globalresell.net', registered: 'Jun 05, 12:10 pm', initial: 'G', color: 'bg-emerald-500/20 text-emerald-400' },
    { name: 'agent_supreme', email: 'supreme_agent@yahoo.com', registered: 'Jun 05, 09:33 am', initial: 'A', color: 'bg-indigo-500/20 text-indigo-400' },
    { name: 'hyperScale_co', email: 'accounts@hyperscaledigital.tech', registered: 'Jun 04, 21:05 pm', initial: 'H', color: 'bg-pink-500/20 text-pink-400' },
    { name: 'v_creator_vn', email: 'hoangviet@creators.vn', registered: 'Jun 04, 17:15 pm', initial: 'V', color: 'bg-amber-500/20 text-amber-500' },
    { name: 'nasdaq_hype', email: 'marketing@nasdaqhype.com', registered: 'Jun 04, 11:58 am', initial: 'N', color: 'bg-red-500/20 text-red-400' },
    { name: 'crypto_influ', email: 'crypto_whale@protonmail.com', registered: 'Jun 03, 23:44 pm', initial: 'C', color: 'bg-teal-500/20 text-teal-400' },
    { name: 'beta_reseller', email: 'beta.prosmm@partner.org', registered: 'Jun 03, 16:30 pm', initial: 'B', color: 'bg-orange-500/20 text-orange-400' },
    { name: 'vietnam_agency', email: 'agencyvietnam79@gmail.com', registered: 'Jun 03, 08:12 am', initial: 'V', color: 'bg-cyan-500/20 text-cyan-400' }
  ]);

  const topUsersSpending = [
    { rank: 1, user: 'global_resell', amount: '$42,520', percent: 100, initials: 'GR' },
    { rank: 2, user: 'vietnam_agency', amount: '$28,400', percent: 67, initials: 'VA' },
    { rank: 3, user: 'agent_supreme', amount: '$19,250', percent: 45, initials: 'AS' },
    { rank: 4, user: 'hyperScale_co', amount: '$15,100', percent: 35, initials: 'HC' },
    { rank: 5, user: 'synergy_smm', amount: '$12,980', percent: 30, initials: 'SS' }
  ];

  // Quick states modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  
  // Add User Form States
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserBalance, setNewUserBalance] = useState('100.00');
  const [newUserRole, setNewUserRole] = useState('reseller');

  // Add Service Form States
  const [serviceCategory, setServiceCategory] = useState('Instagram');
  const [serviceName, setServiceName] = useState('');
  const [serviceRate, setServiceRate] = useState('1.50');
  const [serviceMin, setServiceMin] = useState('100');
  const [serviceMax, setServiceMax] = useState('100000');
  const [providerSource, setProviderSource] = useState('Direct Pipeline');

  // Toast / System Alerts
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Re-fetch system logs simulation
  const handleRefreshSystemHealth = () => {
    setIsRefreshingHealth(true);
    showToast('Pinging all primary SMM routing points and database indexes...');
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSystemUptimeCheck(`Refreshed at ${timeStr}`);
      setIsRefreshingHealth(false);
      showToast('All system checkpoints successfully verified.');
    }, 1200);
  };

  // Switch timeframes dynamic calculations
  const composedData = useMemo(() => {
    const dCount = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : timeRange === '90D' ? 45 : 30;
    return GENERATE_COMPOSED_DATA(dCount);
  }, [timeRange]);

  // Form Submission handles
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserEmail.trim()) {
      showToast('Please specify valid registration details for user profile.');
      return;
    }

    const initials = newUsername.substring(0, 2).toUpperCase();
    const mockColorList = [
      'bg-purple-500/20 text-purple-400',
      'bg-teal-500/20 text-[#00D4FF]',
      'bg-emerald-500/20 text-emerald-400',
      'bg-red-500/20 text-red-400'
    ];
    const pickedColor = mockColorList[Math.floor(Math.random() * mockColorList.length)];

    const newUserObject = {
      name: newUsername.trim().toLowerCase(),
      email: newUserEmail.trim(),
      registered: 'Jun 05, Just now',
      initial: initials.length > 1 ? initials[0] : initials,
      color: pickedColor
    };

    setRecentUsers(prev => [newUserObject, ...prev]);
    setShowAddUserModal(false);
    setNewUsername('');
    setNewUserEmail('');
    showToast(`Reseller Account "${newUserObject.name}" provisioned on master ledger database.`);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      showToast('Please specify an official service marketing name.');
      return;
    }

    showToast(`Service "${serviceName}" successfully integrated inside category "${serviceCategory}"!`);
    setShowAddServiceModal(false);
    setServiceName('');
  };

  const handleOrderApprove = (orderId: string) => {
    setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
    showToast(`Order ${orderId} has been manually forced to Completed status.`);
  };

  const handleOrderCancel = (orderId: string) => {
    setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    showToast(`Order ${orderId} has been manually cancelled. Funds returned to client balance.`);
  };

  return (
    <div className="w-full flex h-screen bg-[#0A0B0F] text-white overflow-hidden relative font-sans text-left select-none">
      
      {/* Toast Alert pop */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 bg-[#1A1D26] border-2 border-brand-primary text-white rounded-2xl p-4 shadow-2xl z-[999] flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-cyan shrink-0">
              <Zap size={14} className="animate-pulse" />
            </div>
            <p className="text-[11.5px] font-bold leading-normal">{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar mobile overlay backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* =========================================================================
          ADMIN SIDEBAR (Wider and darker as requested: 280px / bg: #0D0F16)
         ========================================================================= */}
      <div
        className={`bg-[#0D0F16] border-r border-[#1E2230] shrink-0 h-full flex flex-col justify-between transition-all duration-300 z-50
          fixed md:relative top-0 bottom-0 left-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-[280px]'}
          w-[280px]
        `}
      >
        <div className="flex flex-col overflow-y-auto flex-1 font-sans">
          
          {/* Admin Header Title */}
          <div className="h-[75px] border-b border-[#1E2230] flex items-center justify-between px-5 shrink-0 select-none">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4757] to-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/10">
                <ShieldAlert size={20} />
              </div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black tracking-normal text-white uppercase bg-clip-text">
                    ProSMM Admin
                  </span>
                  <span className="text-[9px] font-bold text-[#FF4757] tracking-widest uppercase mt-0.5 font-mono">
                    Control Node v2.1
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#1A1D26]/70 border border-[#252836] transition-colors cursor-pointer hidden md:block"
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>

            {/* Mobile Sidebar Close X Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#1A1D26]/70 border border-[#252836] transition-colors cursor-pointer md:hidden"
            >
              <X size={15} />
            </button>
          </div>

          {/* Navigation Links inside Groups */}
          <div className="p-4.5 space-y-7 flex-1">
            
            {/* GROUP 1: OVERVIEW */}
            <div className="space-y-2">
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block px-3">
                  System Overview
                </span>
              )}
              <div className="flex flex-col gap-1">
                {[
                  { id: 'dashboard', label: 'Admin Terminal', icon: LayoutDashboard },
                  { id: 'analytics', label: 'Traffic Analytics', icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminMenu(item.id);
                        setIsMobileSidebarOpen(false);
                        showToast(`Simulated navigation to section: "${item.label}"`);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#FF4757]/10 border border-[#FF4757]/20 shadow-md shadow-red-500/5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-[#FF4757]' : 'text-gray-500'} />
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="truncate leading-none">{item.label}</span>}
                      {isActive && (!isSidebarCollapsed || isMobileSidebarOpen) && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF4757]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 2: MANAGEMENT */}
            <div className="space-y-2">
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block px-3">
                  Reseller Management
                </span>
              )}
              <div className="flex flex-col gap-1">
                {[
                  { id: 'users', label: 'User Registries', icon: Users },
                  { id: 'orders', label: 'Bulk Orders', icon: ShoppingBag },
                  { id: 'services', label: 'SMM Services', icon: Layers },
                  { id: 'providers', label: 'System Providers', icon: Server },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminMenu(item.id);
                        setIsMobileSidebarOpen(false);
                        showToast(`Opening simulated component frame: [${item.label}]`);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#FF4757]/10 border border-[#FF4757]/20 shadow-md shadow-red-500/5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-[#FF4757]' : 'text-gray-500'} />
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="truncate leading-none">{item.label}</span>}
                      {isActive && (!isSidebarCollapsed || isMobileSidebarOpen) && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF4757]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 3: FINANCE */}
            <div className="space-y-2">
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block px-3">
                  Finance & Reports
                </span>
              )}
              <div className="flex flex-col gap-1">
                {[
                  { id: 'payments', label: 'Payments History', icon: CreditCard },
                  { id: 'coupons', label: 'Promo Coupons', icon: Tag },
                  { id: 'reports', label: 'Financial Reports', icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminMenu(item.id);
                        setIsMobileSidebarOpen(false);
                        showToast(`Simulated financial log loaded: ${item.label}`);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#FF4757]/10 border border-[#FF4757]/20 shadow-md shadow-red-500/5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-[#FF4757]' : 'text-gray-500'} />
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="truncate leading-none">{item.label}</span>}
                      {isActive && (!isSidebarCollapsed || isMobileSidebarOpen) && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF4757]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 4: SYSTEM */}
            <div className="space-y-2">
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block px-3">
                  System Settings
                </span>
              )}
              <div className="flex flex-col gap-1">
                {[
                  { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
                  { id: 'announcements', label: 'Announcements', icon: Megaphone },
                  { id: 'api_logs', label: 'Active API Logs', icon: Terminal },
                  { id: 'settings', label: 'Panel Variables', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminMenu(item.id);
                        setIsMobileSidebarOpen(false);
                        showToast(`Accessing core system config module: ${item.label}`);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#FF4757]/10 border border-[#FF4757]/20 shadow-md shadow-red-500/5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-[#FF4757]' : 'text-gray-500'} />
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="truncate leading-none">{item.label}</span>}
                      {isActive && (!isSidebarCollapsed || isMobileSidebarOpen) && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF4757]" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Bottom: Admin user badge, switch back trigger */}
        <div className="p-4 border-t border-[#1E2230] bg-[#0A0B0F] shrink-0 flex flex-col gap-2.5">
          <div className="flex items-center gap-3 p-1.5 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4757] to-[#8A111F] flex items-center justify-center font-black text-xs text-white border border-[#FF4757]/30">
              AD
            </div>
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-white capitalize truncate leading-normal">
                  Super Administrator
                </span>
                <span className="text-[10px] text-gray-500 truncate mt-0.5">
                  root@prosmm.panel
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onSwitchToUser}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-brand-cyan hover:text-white bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 border border-[#6C63FF]/25 rounded-xl transition-all cursor-pointer ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <Globe size={13} className="shrink-0" />
            {(!isSidebarCollapsed || isMobileSidebarOpen) && <span>View Client Panel</span>}
          </button>
        </div>

      </div>

      {/* =========================================================================
          MAIN ADMIN WORKSPACE & HEADER
         ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0B0F] relative">
        
        {/* TOP ADMIN HEADER */}
        <header className="h-[75px] border-b border-[#1E2230] px-4 md:px-6 lg:px-8 bg-[#12141A]/70 backdrop-blur-md flex items-center justify-between shrink-0 relative z-45">
          
          <div className="flex items-center gap-3.5 md:gap-4.5">
            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-gray-400 hover:text-white bg-[#1A1D26]/60 border border-[#252836] cursor-pointer md:hidden shrink-0"
              aria-label="Open administration menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile Header Logo */}
            <div className="flex items-center gap-2 md:hidden select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF4757] to-[#FF8A00] flex items-center justify-center text-white shrink-0">
                <ShieldAlert size={16} />
              </div>
              <span className="text-xs font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ProSMM Admin
              </span>
            </div>

            <h2 className="text-sm lg:text-lg font-black tracking-tight text-white uppercase tracking-wider hidden md:block">
              {adminMenu === 'dashboard' ? 'Overview Terminal' : adminMenu === 'users' ? 'User Core Registries' : adminMenu === 'orders' ? 'Bulk Orders Center' : adminMenu === 'services' ? 'Services Registry' : adminMenu === 'providers' ? 'Downstream Gateways' : `Section: ${adminMenu}`}
            </h2>

            {/* Admin Red pill hidden on mobile */}
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-md shrink-0 hidden sm:block">
              ● ADMIN NODE
            </span>
          </div>

          {/* Date time and quick controls */}
          <div className="flex items-center gap-4">
            
            {/* Clock display */}
            <span className="text-xs font-bold text-gray-400 font-mono hidden xl:block border border-[#252836] bg-[#12141A]/95 px-3 py-1.5 rounded-xl">
              UTC: 2026-06-05 23:49:18
            </span>

            {/* Quick action buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white bg-gradient-to-r from-teal-500 to-[#00D4FF] hover:opacity-95 shadow-lg shadow-teal-500/5 border border-teal-500/10 transition-all cursor-pointer uppercase tracking-tight"
              >
                <Plus size={12} />
                <span>Add User</span>
              </button>

              <button
                onClick={() => setShowAddServiceModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white bg-gradient-to-r from-indigo-500 to-brand-primary hover:opacity-95 shadow-lg shadow-indigo-500/5 border border-indigo-500/10 transition-all cursor-pointer uppercase tracking-tight"
              >
                <Plus size={12} />
                <span>Add Service</span>
              </button>
            </div>

            {/* Simulated Alerts Hub */}
            <div className="relative">
              <button
                onClick={() => showToast('Simulating: 3 urgent server API logs await review.')}
                className="p-2.5 rounded-xl border border-[#1E2230] bg-[#1A1D26]/60 hover:bg-[#1A1D26]/90 text-gray-400 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell size={15} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4757] border-2 border-[#12141A] rounded-full text-[8.5px] font-bold text-white flex items-center justify-center animate-pulse">
                  5
                </span>
              </button>
            </div>

            {/* Admin Avatar ID info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E2230]">
              <div className="w-8.5 h-8.5 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-brand-cyan shrink-0 font-extrabold text-xs">
                JD
              </div>
              <div className="flex flex-col hidden sm:block text-right">
                <span className="text-xs font-bold text-white block">John Devins</span>
                <span className="text-[9.5px]/none font-black text-gray-500 block mt-0.5 tracking-wider uppercase">Master Operator</span>
              </div>
            </div>

          </div>

        </header>

        {/* ADMIN WORKSPACE VIEWER */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-7 relative z-10">

          <AnimatePresence mode="wait">
            {adminMenu === 'users' ? (
              <motion.div
                key="users-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminUserManagement
                  onShowToast={showToast}
                  openAddUserModal={() => setShowAddUserModal(true)}
                />
              </motion.div>
            ) : adminMenu === 'orders' ? (
              <motion.div
                key="orders-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminOrderManagement
                  onShowToast={showToast}
                  onInspectUser={(username) => {
                    setAdminMenu('users');
                    showToast(`Searching directory records database for "@${username}"...`);
                  }}
                />
              </motion.div>
            ) : adminMenu === 'services' ? (
              <motion.div
                key="services-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminServiceManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu === 'providers' ? (
              <motion.div
                key="providers-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminProviderManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu === 'payments' || adminMenu === 'reports' ? (
              <motion.div
                key="payments-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminPaymentManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu === 'coupons' ? (
              <motion.div
                key="coupons-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminCouponManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu === 'settings' ? (
              <motion.div
                key="settings-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminSettingsManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu === 'tickets' ? (
              <motion.div
                key="tickets-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminTicketsManagement
                  onShowToast={showToast}
                />
              </motion.div>
            ) : adminMenu !== 'dashboard' ? (
              <motion.div
                key="subpanel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#1A1D26] border border-[#252836] p-7 rounded-3xl shadow-xl flex flex-col text-center items-center justify-center max-w-2xl mx-auto my-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FF4757]/10 border border-[#FF4757]/20 flex items-center justify-center text-[#FF4757] mb-5">
                  <ShieldAlert size={30} />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
                  Integrated Component Hook: {adminMenu}
                </h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed max-w-md">
                  You have accessed the fully functional controller flow for <strong>{adminMenu}</strong>. Integrated endpoints are listening in high-speed proxy lanes, tracking orders data, processing API keys, and preparing SQL operations safely.
                </p>
                <button
                  onClick={() => setAdminMenu('dashboard')}
                  className="mt-6 px-5 py-2.5 bg-[#FF4757]/15 hover:bg-[#FF4757]/25 text-[#FF4757] border border-[#FF4757]/20 rounded-xl text-xs font-extrabold transition-all cursor-pointer uppercase tracking-tight"
                >
                  Return to Dashboard Node
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-viewport"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-7"
              >
                
                {/* =========================================================================
                    ROW 1: FOUR HIGHEST-PRIORITY MAIN ANALYTIC CARDS (With Recharts Sparklines)
                   ========================================================================= */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                  
                  {/* Card 1: Today's Revenue */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-3.5 sm:p-5 shadow flex flex-col hover:border-[#00C896]/30 transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between pb-2 sm:pb-3">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-wider sm:tracking-widest truncate">
                        Today's Net Revenue
                      </span>
                      <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <DollarSign size={13} className="sm:size-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-sm sm:text-2xl font-black text-white tracking-tight">$1,284.50</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-emerald-400 font-mono">+23%</span>
                    </div>

                    {/* Sparkline integration */}
                    <div className="h-8 sm:h-11 w-full mt-2 sm:mt-3 block">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_SPARK}>
                          <Bar dataKey="val" fill="#00C896" radius={[2, 2, 0, 0]} opacity={0.8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Card 2: Today's Orders */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-3.5 sm:p-5 shadow flex flex-col hover:border-brand-primary/30 transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between pb-2 sm:pb-3">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-wider sm:tracking-widest truncate">
                        Today's SMM Campaigns
                      </span>
                      <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-cyan shrink-0">
                        <ShoppingBag size={13} className="sm:size-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-sm sm:text-2xl font-black text-white tracking-tight">847 Orders</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-[#00D4FF] font-mono">+12%</span>
                    </div>

                    {/* Sparkline integration */}
                    <div className="h-8 sm:h-11 w-full mt-2 sm:mt-3 block">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={ORDERS_SPARK}>
                          <Line type="basis" dataKey="val" stroke="#00D4FF" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Card 3: New Users Today */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-3.5 sm:p-5 shadow flex flex-col hover:border-brand-primary/30 transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between pb-2 sm:pb-3">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-wider sm:tracking-widest truncate">
                        Today's New Registries
                      </span>
                      <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] shrink-0">
                        <UserPlus size={13} className="sm:size-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-sm sm:text-2xl font-black text-white tracking-tight">+34 Users</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-[#6C63FF] font-mono">+5%</span>
                    </div>

                    {/* Sparkline integration */}
                    <div className="h-8 sm:h-11 w-full mt-2 sm:mt-3 block">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={USERS_SPARK}>
                          <Line type="monotone" dataKey="val" stroke="#6C63FF" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Card 4: Pending Tickets */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-3.5 sm:p-5 shadow flex flex-col hover:border-red-500/30 transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between pb-2 sm:pb-3">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-wider sm:tracking-widest truncate">
                        Urgent Pending Support
                      </span>
                      <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-[#FF4757]/10 border border-[#FF4757]/20 flex items-center justify-center text-[#FF4757] shrink-0">
                        <AlertCircle size={13} className="sm:size-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-sm sm:text-2xl font-black text-white tracking-tight">8 Open</span>
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#FF4757] bg-[#FF4757]/10 px-1 sm:px-2.5 py-0.5 rounded font-mono font-sans font-bold">
                        2 Urgent
                      </span>
                    </div>

                    {/* Sparkline integration */}
                    <div className="h-8 sm:h-11 w-full mt-2 sm:mt-3 block">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={TICKETS_SPARK}>
                          <Bar dataKey="val" fill="#FF4757" radius={[2, 2, 0, 0]} opacity={0.8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* =========================================================================
                    ROW 2: SECOND STATISTICAL TRACKER HUB (All-Time Aggregates)
                   ========================================================================= */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                  
                  {[
                    { label: 'Cumulative Revenue', val: '$128,430', color: 'text-emerald-400 border-l border-emerald-500/30' },
                    { label: 'Aggregate Clients Count', val: '4,281 Accounts', color: 'text-indigo-400 border-l border-indigo-500/30' },
                    { label: 'Bulk Orders Logged', val: '89,472 Delivered', color: 'text-brand-cyan border-l border-[#00D4FF]/30' },
                    { label: 'Active SMM Pipelines', val: '156 Channels', color: 'text-amber-500 border-l border-amber-500/30' }
                  ].map((agg, aIdx) => (
                    <div key={aIdx} className={`bg-[#12141A] border-y border-r border-[#1E2230] p-3 sm:p-4.5 rounded-xl text-left bg-gradient-to-tr from-[#12141A] to-[#1A1D26] ${agg.color}`}>
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-widest block">{agg.label}</span>
                      <span className="text-xs sm:text-lg font-black text-white font-sans mt-1 sm:mt-1.5 block tracking-tight truncate">{agg.val}</span>
                    </div>
                  ))}

                </div>

                {/* =========================================================================
                    ROW 3: COMPOSED DOCK CHARTS (Dual Y-axes and Interactive Donut Segment)
                   ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Composed Chart: Revenue & Orders Stack (65% column span) */}
                  <div className="lg:col-span-8 bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#252836] gap-3">
                      <div>
                        <h3 className="text-xs font-black uppercase text-white tracking-widest">
                          Revenue Performance & Order Scaling (30-Day Cohort)
                        </h3>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Analytic representation of billing triggers mapped on cumulative customer operations.</p>
                      </div>

                      {/* Date selection controller component as requested */}
                      <div className="flex items-center bg-[#12141A] p-1.5 rounded-xl border border-[#252836] shadow-inner shrink-0 leading-none">
                        {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setTimeRange(r);
                              showToast(`Visual frame timeframe updated. Range size: ${r}`);
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              timeRange === r
                                ? 'bg-gradient-to-tr from-[#FF4757] to-[#FF8A00] text-white shadow font-extrabold'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[200px] md:h-[310px] w-full text-[10.5px] font-semibold text-gray-400">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={composedData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252836" />
                          <XAxis dataKey="day" stroke="#4C5270" tickLine={false} minTickGap={35} />
                          <YAxis yAxisId="left" stroke="#6C63FF" tickLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#00D4FF" tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#12141A',
                              borderRadius: '1rem',
                              border: '1px solid #2E334D',
                              color: '#fff',
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                          <Bar yAxisId="left" dataKey="Revenue" fill="#6C63FF" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={12} name="Daily Revenue ($)" />
                          <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#00D4FF" strokeWidth={3.5} dot={{ r: 2 }} name="Daily Orders Count" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                  </div>

                  {/* Donut Chart: platform distribution (35% columns span) */}
                  <div className="lg:col-span-4 bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 md:p-6 shadow-md flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-[#252836]">
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Network Traffic Division
                      </h3>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Aggregate user queries relative by target database.</p>
                    </div>

                    <div className="h-[170px] sm:h-[210px] w-full flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={PLATFORM_PIE_DATA}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {PLATFORM_PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Centered overall metric */}
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-white leading-none block">100%</span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 mt-1 block">Traffic Sync</span>
                      </div>
                    </div>

                    {/* Interactive legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-brand-border/20 text-xs">
                      {PLATFORM_PIE_DATA.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded shrink-0 block" style={{ backgroundColor: p.color }} />
                          <span className="text-gray-400 font-medium text-[11px] font-mono leading-none">{p.name}: <strong>{p.value}%</strong></span>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* =========================================================================
                    ROW 4: THREE RE-ORGANIZED COMPACT INDUSTRIAL WORKBENCH BLOCKS
                   ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Column 1: Recent Orders log (40% width / 5 cols) */}
                  <div className="lg:col-span-5 bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Live Campaign Logs
                      </h3>
                      <button
                        onClick={() => { setAdminMenu('orders'); showToast('Loaded full bulk orders master ledger queue.'); }}
                        className="text-[10px] font-black text-[#FF4757] hover:underline"
                      >
                        View All Systems
                      </button>
                    </div>

                    {/* Mini table list */}
                    <div className="overflow-x-auto text-[11px] flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#252836] text-gray-500 uppercase text-[9.5px] font-extrabold">
                            <th className="pb-2.5">ID</th>
                            <th className="pb-2.5">Provider User</th>
                            <th className="pb-2.5">Service Details</th>
                            <th className="pb-2.5 text-right">Net Value</th>
                            <th className="pb-2.5 text-center">Engine</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D202B]/60 font-semibold text-gray-300">
                          {adminOrdersList.slice(0, 5).map((o) => (
                            <tr key={o.id} className="group hover:bg-[#12141A]/50 transition-colors">
                              <td className="py-3 font-mono text-white text-[10.5px] select-all leading-none">{o.id}</td>
                              <td className="py-3 text-slate-400 filter hover:text-white leading-none">@{o.user}</td>
                              <td className="py-3 max-w-[120px] truncate leading-none text-white font-sans flex items-center gap-1.5">
                                <span className="text-xs shrink-0">{o.logo}</span>
                                <span className="truncate">{o.service}</span>
                              </td>
                              <td className="py-3 font-mono text-right text-emerald-400 font-bold leading-none">{o.amount}</td>
                              <td className="py-3 text-center leading-none">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-black tracking-wider ${
                                  o.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : o.status === 'In Progress'
                                    ? 'bg-blue-500/10 text-blue-400 animate-pulse'
                                    : o.status === 'Processing'
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'bg-yellow-500/10 text-amber-500'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Column 2: Top reseller agencies (30% width / 3.5 cols) */}
                  <div className="lg:col-span-3.5 bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-[#252836]">
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Volume Leaderboards
                      </h3>
                      <p className="text-[9.5px] text-gray-500 font-bold mt-0.5">Top-spending reseller accounts today.</p>
                    </div>

                    <div className="space-y-4 flex-1">
                      {topUsersSpending.map((u, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold leading-none">
                            <div className="flex items-center gap-2">
                              <span className="w-5.5 h-5.5 rounded-md bg-[#12141A] border border-[#252836] text-[#FF8A00] font-black text-[10px] flex items-center justify-center">
                                #{u.rank}
                              </span>
                              <span className="text-white text-[11px] truncate">@{u.user}</span>
                            </div>
                            <span className="text-brand-cyan text-[11.5px] font-mono">{u.amount}</span>
                          </div>

                          {/* Relative progress bar bar */}
                          <div className="w-full h-1.5 bg-[#12141A] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-teal-500 to-[#FF4757] rounded-full" style={{ width: `${u.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Column 3: Platform operations health index (30% width / 3.5 cols) */}
                  <div className="lg:col-span-3.5 bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Operational Status
                      </h3>
                      
                      <button
                        onClick={handleRefreshSystemHealth}
                        disabled={isRefreshingHealth}
                        className="text-gray-400 hover:text-white transition-transform active:rotate-180 cursor-pointer disabled:opacity-40"
                      >
                        <RefreshCw size={13} className={isRefreshingHealth ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    <div className="space-y-3 flex-1 text-xs font-bold">
                      
                      {[
                        { title: 'Central API Node', status: 'Optimal', icon: <Globe size={13} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { title: 'Global Database Cluster', status: '99.98% Uptime', icon: <Database size={13} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { title: 'Payments Vault Routing', status: 'Secure Mode', icon: <CreditCard size={13} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { title: 'Reseller Distribution APIs', status: '2 latency warnings', icon: <Activity size={13} />, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                        { title: 'Campaign Order Queue', status: '847 tasks', icon: <Smartphone size={13} />, color: 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/20' }
                      ].map((hs, hIdx) => (
                        <div key={hIdx} className="flex items-center justify-between bg-[#12141A] border border-[#252836] p-2.5 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <span className="text-gray-400">{hs.icon}</span>
                            <span className="text-gray-300 text-[11px] font-sans truncate">{hs.title}</span>
                          </div>
                          <span className={`text-[9.5px] uppercase font-black tracking-wider px-2 py-0.5 rounded border leading-none ${hs.color}`}>
                            {hs.status}
                          </span>
                        </div>
                      ))}

                    </div>

                    {/* Check status timestamp footer */}
                    <div className="pt-2 text-[9.5px] text-gray-500 flex items-center justify-between">
                      <span className="uppercase font-extrabold tracking-wider">Cron Job: Active</span>
                      <span>{systemUptimeCheck}</span>
                    </div>

                  </div>

                </div>

                {/* =========================================================================
                    ROW 5: REVENUE BY CATEGORY & RECENT USERS SIGNUPS LIST
                   ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left: Category Volume Allocation bar chart (50%) */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 md:p-6 shadow flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-[#252836]">
                      <h3 className="text-xs font-black uppercase text-white tracking-widest">
                        Category Yield Metric
                      </h3>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Yield distribution by target network catalog.</p>
                    </div>

                    <div className="h-[210px] w-full text-[10px] font-bold">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={STATS_CATEGORY_DATA}
                          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#252836" />
                          <XAxis type="number" stroke="#4C5270" tickLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#4C5270" tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#12141A',
                              borderRadius: '0.5rem',
                              border: '1px solid #2E334D',
                            }}
                          />
                          <Bar dataKey="Revenue" radius={[0, 4, 4, 0]} maxBarSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                  </div>

                  {/* Right: Last registrations directory overview (50%) */}
                  <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl p-5 md:p-6 shadow flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
                      <div>
                        <h3 className="text-xs font-black uppercase text-white tracking-widest">
                          Accounts Directories Registry
                        </h3>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Directory database for recent platform registrations.</p>
                      </div>
                      
                      <button
                        onClick={() => { setAdminMenu('users'); showToast('Searching client directories lists...'); }}
                        className="text-[10px] font-black text-[#FF4757] hover:underline"
                      >
                        All Users Directory
                      </button>
                    </div>

                    {/* Card grid representation of registration records */}
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {recentUsers.slice(0, 4).map((u, uIdx) => (
                        <div key={uIdx} className="flex items-center justify-between bg-[#12141A] border border-[#1d202b] hover:border-brand-primary/20 p-3 rounded-2xl shadow-inner transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8.5 h-8.5 rounded-xl font-black text-xs flex items-center justify-center border border-white/5 ${u.color}`}>
                              {u.initial}
                            </div>
                            <div className="flex flex-col text-left text-xs font-bold leading-normal">
                              <span className="text-white">@{u.name}</span>
                              <span className="text-gray-500 text-[10px] font-mono leading-none mt-1">{u.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div className="flex flex-col text-right">
                              <span className="text-gray-400 text-[10px] leading-none">Registered Node</span>
                              <span className="text-gray-600 text-[10px] font-semibold font-mono mt-1 leading-none">{u.registered}</span>
                            </div>

                            <button
                              onClick={() => showToast(`Opening profile dossier for "@${u.name}"`)}
                              className="px-3.5 py-1.5 bg-[#1A1D26] hover:bg-[#FF4757]/15 hover:text-white border border-[#252836] text-[10.5px] text-slate-400 rounded-lg cursor-pointer transition-all font-black uppercase tracking-tight"
                            >
                              Inspect User
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* FLOATING QUICK STATS BASE BAR - Commercial quality look */}
        <footer className="bg-[#12141a]/95 border-t border-[#1E2230] px-6 lg:px-8 py-3.5 text-xs text-gray-500 font-bold tracking-tight shrink-0 flex flex-col md:flex-row justify-between items-center gap-3 relative z-40">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase text-gray-400 text-[9.5px]">Systems Checkpoints Status: Perfect</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-5 lg:gap-8 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Vol Today:</span>
              <span className="text-white font-extrabold pb-0.5">1.2M API Cycles</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-brand-border/20 pl-5">
              <span className="text-gray-500">Ticket SLA:</span>
              <span className="text-emerald-400 font-extrabold pb-0.5">11m resolution response</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-brand-border/20 pl-5">
              <span className="text-gray-500">Performance Index:</span>
              <span className="text-[#00D4FF] font-extrabold pb-0.5">142ms delay latency</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-brand-border/20 pl-5">
              <span className="text-gray-500">Cloud Host:</span>
              <span className="text-white font-black">99.98% uptime node</span>
            </div>
          </div>
        </footer>

      </div>

      {/* =========================================================================
          MODAL LAYERS FOR ADMISSION ACTIONS (ADD USER & ADD SERVICE)
         ========================================================================= */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-sm flex items-center justify-center z-[990] p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-lg shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-[#FF4757]" size={18} />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">
                    Provision Master Client Account
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1 rounded-md cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-bold text-gray-300">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Username Domain</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g., hypermarket_boost"
                    className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF4757]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Email Address ID</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g., boost@marketingsales.net"
                    className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF4757]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Starting Balance ($)</label>
                    <input
                      type="number"
                      value={newUserBalance}
                      onChange={(e) => setNewUserBalance(e.target.value)}
                      placeholder="e.g., 250.00"
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF4757]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Default Tier Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#FF4757] cursor-pointer"
                    >
                      <option value="retail">Retailer Client</option>
                      <option value="reseller">Standard API Reseller</option>
                      <option value="vip">Tier-1 Strategic VIP</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#2C3147]">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 text-xs font-extrabold transition-all cursor-pointer"
                  >
                    Dismiss Form
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4757] to-[#FF8A00] hover:opacity-95 text-white text-xs font-black transition-all cursor-pointer uppercase tracking-tight"
                  >
                    Confirm Generation
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {showAddServiceModal && (
          <div className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-sm flex items-center justify-center z-[990] p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-lg shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <Layers className="text-brand-primary" size={18} />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">
                    Create SMM Pipeline Channel
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1 rounded-md cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-4 text-xs font-bold text-gray-300">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Platform Category</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter/X">Twitter/X</option>
                      <option value="Telegram">Telegram</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Bulk API Provider source</label>
                    <select
                      value={providerSource}
                      onChange={(e) => setProviderSource(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                    >
                      <option value="Direct Pipeline">Direct Pipeline (Zero Delay)</option>
                      <option value="Partner Mirror API">SMM Global Network Resell Partner</option>
                      <option value="Manual Dispatch Core">Manual Operator Queue</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Service Name Header</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., Target Country Targeted Likes [Instant, Speed: 50K/day]"
                    className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Rate per 1000 ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={serviceRate}
                      onChange={(e) => setServiceRate(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Min Qty</label>
                    <input
                      type="number"
                      value={serviceMin}
                      onChange={(e) => setServiceMin(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Max Qty</label>
                    <input
                      type="number"
                      value={serviceMax}
                      onChange={(e) => setServiceMax(e.target.value)}
                      className="bg-[#12141A] border border-[#2E334D] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#2C3147]">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-4.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 text-xs font-extrabold transition-all cursor-pointer"
                  >
                    Dismiss Form
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-cyan hover:opacity-95 text-white text-xs font-black transition-all cursor-pointer uppercase tracking-tight"
                  >
                    Integrate Channel
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DevToolsOverlay
        isAdmin={true}
        setIsAdmin={(val) => {
          if (!val) {
            onSwitchToUser();
          }
        }}
        activeMenu={adminMenu}
        setActiveMenu={(val) => setAdminMenu(val)}
        onResetState={() => {
          showToast('Admin state registers reset. System logs synchronized, providers cleared, database indexes optimized.');
        }}
      />
    </div>
  );
}
