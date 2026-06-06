import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  Info,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  CheckCircle,
  TrendingUp,
  ArrowDownCircle,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  ThumbsUp,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Tag,
  Copy,
  Download,
  Calendar,
  XCircle,
  Eye,
  Trash2,
  Lock,
  MessageSquare,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Music,
  Share2
} from 'lucide-react';

const CATEGORIES_LIST = [
  { id: 'all', name: 'All Categories', dotColor: 'bg-brand-primary' },
  { id: 'instagram', name: 'Instagram', dotColor: 'bg-[#E1306C]' },
  { id: 'tiktok', name: 'TikTok', dotColor: 'bg-white' },
  { id: 'youtube', name: 'YouTube', dotColor: 'bg-[#FF0000]' },
  { id: 'telegram', name: 'Telegram', dotColor: 'bg-[#24A1DE]' },
  { id: 'facebook', name: 'Facebook', dotColor: 'bg-[#1877F2]' },
  { id: 'twitter', name: 'Twitter / X', dotColor: 'bg-slate-400' },
  { id: 'spotify', name: 'Spotify', dotColor: 'bg-[#1DB954]' },
  { id: 'soundcloud', name: 'SoundCloud', dotColor: 'bg-[#FF5500]' },
  { id: 'pinterest', name: 'Pinterest', dotColor: 'bg-[#BD081C]' },
  { id: 'linkedin', name: 'LinkedIn', dotColor: 'bg-[#0A66C2]' }
];

export interface SmmOrder {
  id: string; // #ORD-XXXX
  service: string;
  category: string;
  target: string;
  qty: number;
  startCount: number;
  currentCount: number;
  remains: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Partial' | 'Cancelled' | 'Refunded';
  date: string; // ISO 8601 formatting for absolute
  dateRelative: string;
  price: number;
  refillAvailable: boolean;
  refillUntil?: string;
  quality?: string;
  pipelineType?: string;
}

interface OrderHistorySectionProps {
  ordersList?: SmmOrder[];
  setOrdersList?: React.Dispatch<React.SetStateAction<SmmOrder[]>>;
  availableBalance?: number;
  deductBalance?: (amount: number) => void;
  integratedOrders?: any[]; // For syncing parent recent orders
}

export default function OrderHistorySection({
  ordersList: parentOrdersList,
  setOrdersList: parentSetOrdersList,
  integratedOrders = []
}: OrderHistorySectionProps) {
  
  // 1. Core State & 25 Mock Orders Database
  
  // Internal Fallback state if parent properties are omitted
  const [localOrdersList, setLocalOrdersList] = useState<SmmOrder[]>([]);

  // Sync integratedOrders containing the real Firestore collection logs
  const finalOrdersList = useMemo(() => {
    if (!integratedOrders || integratedOrders.length === 0) {
      return [];
    }

    return integratedOrders.map((item) => {
      const displayId = item.id.startsWith('#') ? item.id : `#${item.id.substring(0, 7).toUpperCase()}`;
      const serviceLabel = item.serviceName || item.service || 'Reseller SMM Service';

      return {
        id: displayId,
        service: serviceLabel,
        category: serviceLabel.toLowerCase().includes('instagram') ? 'instagram' :
                  serviceLabel.toLowerCase().includes('tiktok') ? 'tiktok' :
                  serviceLabel.toLowerCase().includes('youtube') ? 'youtube' :
                  serviceLabel.toLowerCase().includes('telegram') ? 'telegram' :
                  serviceLabel.toLowerCase().includes('facebook') ? 'facebook' :
                  serviceLabel.toLowerCase().includes('twitter') ? 'twitter' :
                  serviceLabel.toLowerCase().includes('x.com') ? 'twitter' :
                  serviceLabel.toLowerCase().includes('spotify') ? 'spotify' : 'all',
        target: item.link || item.target || '',
        qty: Number(item.quantity) || 0,
        startCount: Number(item.startCount) || 0,
        currentCount: Math.max(0, (Number(item.quantity) || 0) - (Number(item.remains) || 0)) || 0,
        remains: Number(item.remains) || 0,
        status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) as any : 'Pending',
        date: item.createdAt || new Date().toISOString(),
        dateRelative: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now',
        price: Number(item.charge) || 0,
        refillAvailable: item.refill || false,
        quality: 'Database Verified ✓',
        pipelineType: 'Instant Automated Reseller API'
      };
    });
  }, [integratedOrders]);

  const updateOrdersListState = (updatedList: SmmOrder[]) => {
    if (parentSetOrdersList) {
      parentSetOrdersList(updatedList);
    } else {
      setLocalOrdersList(updatedList);
    }
  };

  // 2. Interactive Filtering & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed' | 'Partial' | 'Cancelled' | 'Refunded'>('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dropdowns toggling
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Stats calculation
  const statsCounters = useMemo(() => {
    const list = finalOrdersList;
    return {
      total: list.length,
      completed: list.filter(o => o.status === 'Completed').length,
      active: list.filter(o => o.status === 'In Progress' || o.status === 'Partial').length,
      pending: list.filter(o => o.status === 'Pending').length,
      cancelled: list.filter(o => o.status === 'Cancelled' || o.status === 'Refunded').length,
    };
  }, [finalOrdersList]);

  // Handle active card filter triggers
  const handleStatCardClick = (targetStatus: string) => {
    if (targetStatus === 'All') {
      setStatusFilter('All');
    } else if (targetStatus === 'Completed') {
      setStatusFilter('Completed');
    } else if (targetStatus === 'Active') {
      setStatusFilter('In Progress'); // Shows in progress
    } else if (targetStatus === 'Pending') {
      setStatusFilter('Pending');
    } else if (targetStatus === 'Cancelled') {
      setStatusFilter('Cancelled');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSelectedCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  // 3. Row check select states
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  const handleToggleRowSelect = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 4. Filtering mechanism
  const filteredOrders = useMemo(() => {
    return finalOrdersList.filter(order => {
      // Search Box filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(searchLower) ||
        order.service.toLowerCase().includes(searchLower) ||
        order.target.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === 'All' || order.status === statusFilter;

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || order.category === selectedCategory;

      // Date Range Filter
      let matchesDate = true;
      if (dateFrom) {
        const fromTime = new Date(dateFrom).getTime();
        const orderTime = new Date(order.date).getTime();
        if (orderTime < fromTime) matchesDate = false;
      }
      if (dateTo) {
        // Set to end of day to include the to-date fully
        const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
        const orderTime = new Date(order.date).getTime();
        if (orderTime > toTime) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [finalOrdersList, searchTerm, statusFilter, selectedCategory, dateFrom, dateTo]);

  const handleToggleAllSelect = () => {
    const visibleIds = filteredOrders.map(o => o.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedRowIds.includes(id));
    if (allSelected) {
      setSelectedRowIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedRowIds(prev => {
        const added = visibleIds.filter(id => !prev.includes(id));
        return [...prev, ...added];
      });
    }
  };

  // 5. Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<10 | 25 | 50>(10);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  // Adjust page count if page out of bounds
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  // 6. Bulk Action Handlers
  const handleBulkCancel = () => {
    const updated = finalOrdersList.map(order => {
      if (selectedRowIds.includes(order.id) && order.status === 'Pending') {
        return { ...order, status: 'Cancelled' as const };
      }
      return order;
    });
    updateOrdersListState(updated);
    setSelectedRowIds([]);
    alert(`Successfully processed cancel actions on qualified selected SMM campaigns.`);
  };

  const handleBulkExport = () => {
    const targetItems = finalOrdersList.filter(o => selectedRowIds.includes(o.id));
    exportCsvFile(targetItems, 'selected-smm-orders.csv');
  };

  const exportCsvFile = (data: SmmOrder[], filename: string) => {
    if (data.length === 0) {
      alert('No orders selected as matching items to output export.');
      return;
    }
    const headers = ['Order ID', 'SMM Service', 'Platform', 'Destination Link', 'Qty', 'Start Count', 'Remains', 'Price Paid', 'Status', 'Requested Time'];
    const csvContent = [
      headers.join(','),
      ...data.map(order => [
        `"${order.id}"`,
        `"${order.service.replace(/"/g, '""')}"`,
        `"${order.category}"`,
        `"${order.target}"`,
        order.qty,
        order.startCount,
        order.remains,
        `$${order.price.toFixed(2)}`,
        `"${order.status}"`,
        `"${order.date}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSingleExportCsv = () => {
    exportCsvFile(filteredOrders, 'prosmm-filtered-registry.csv');
  };

  // 7. Individual Row Action Handlers
  const [activeDetailOrder, setActiveDetailOrder] = useState<SmmOrder | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);
  
  const handleCopyLink = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedbackId(orderId);
    setTimeout(() => setCopyFeedbackId(null), 1800);
  };

  const handleCancelSingle = (orderId: string) => {
    const updated = finalOrdersList.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'Cancelled' as const };
      }
      return order;
    });
    updateOrdersListState(updated);
    if (activeDetailOrder?.id === orderId) {
      setActiveDetailOrder(prev => prev ? { ...prev, status: 'Cancelled' as const } : null);
    }
  };

  const [refillLoading, setRefillLoading] = useState(false);
  const handleRefillSingle = (orderId: string) => {
    setRefillLoading(true);
    setTimeout(() => {
      setRefillLoading(false);
      alert(`Refill pipeline triggered successfully for ${orderId}. Re-scanning database node targets...`);
    }, 1500);
  };

  // Rendering Helper: Platform icon wrapper
  const renderPlatformBadgeIcon = (category: string) => {
    switch (category) {
      case 'instagram':
        return <Instagram size={13} className="text-[#E1306C]" />;
      case 'youtube':
        return <Youtube size={13} className="text-[#FF0000]" />;
      case 'tiktok':
        return <span className="text-[10px] bg-white text-black font-semibold rounded px-1 scale-95 shrink-0 inline-block leading-none py-0.5">TT</span>;
      case 'telegram':
        return <MessageSquare size={13} className="text-[#24A1DE]" />;
      case 'facebook':
        return <Facebook size={13} className="text-[#1877F2]" />;
      case 'twitter':
        return <Twitter size={13} className="text-slate-200" />;
      case 'spotify':
        return <Music size={13} className="text-[#1DB954]" />;
      case 'linkedin':
        return <Linkedin size={13} className="text-[#0A66C2]" />;
      default:
        return <TrendingUp size={13} className="text-brand-cyan" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/25';
      case 'In Progress':
        return 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25';
      case 'Completed':
        return 'bg-emerald-500/10 text-brand-success border-brand-success/25';
      case 'Partial':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/25';
      case 'Cancelled':
        return 'bg-red-500/10 text-brand-danger border-brand-danger/25';
      case 'Refunded':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      default:
        return 'bg-[#252836] text-white border-transparent';
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* A. PAGE HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:px-6 md:py-5.5 shadow-md">
        <div>
          <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="text-brand-primary" size={19} />
            <span>Order History Suite</span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-0.5 font-medium leading-relaxed max-w-xl">
            Audit, filter, tracking, and handle programmatic active SMM distribution nodes. Access custom timeline views and trigger automatic refill algorithms.
          </p>
        </div>

        <button
          onClick={handleSingleExportCsv}
          className="bg-[#12141A] hover:bg-[#12141A]/70 text-slate-100 hover:text-brand-cyan border border-[#252836] hover:border-brand-cyan/40 px-4 py-2.5 rounded-xl text-xs font-black select-none cursor-pointer flex items-center gap-2 transition-all shrink-0 self-stretch sm:self-center justify-center hover:scale-[1.01]"
        >
          <Download size={14} />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* B. MINICARDS STATS SELECT ROW (Click filters automatically) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'All Orders', value: statsCounters.total.toLocaleString(), filterKey: 'All', color: 'border-brand-primary/20 text-indigo-400 bg-brand-primary/5 hover:border-brand-primary/60' },
          { label: 'Completed', value: statsCounters.completed.toLocaleString(), filterKey: 'Completed', color: 'border-emerald-500/15 text-emerald-400 bg-emerald-500/5 hover:border-brand-success/50' },
          { label: 'Active', value: statsCounters.active.toLocaleString(), filterKey: 'Active', color: 'border-brand-cyan/15 text-[#00D4FF] bg-[#00D4FF]/4 hover:border-brand-cyan/50 animate-pulse-subtle' },
          { label: 'Pending', value: statsCounters.pending.toLocaleString(), filterKey: 'Pending', color: 'border-[#FFB800]/15 text-[#FFB800] bg-[#FFB800]/4 hover:border-[#FFB800]/50' },
          { label: 'Cancelled', value: statsCounters.cancelled.toLocaleString(), filterKey: 'Cancelled', color: 'border-brand-danger/15 text-[#FF4757] bg-[#FF4757]/4 hover:border-brand-danger/50' }
        ].map((c) => {
          const isSelected = (c.filterKey === 'All' && statusFilter === 'All') ||
                             (c.filterKey === 'Completed' && statusFilter === 'Completed') ||
                             (c.filterKey === 'Active' && statusFilter === 'In Progress') ||
                             (c.filterKey === 'Pending' && statusFilter === 'Pending') ||
                             (c.filterKey === 'Cancelled' && (statusFilter === 'Cancelled' || statusFilter === 'Refunded'));

          return (
            <button
              onClick={() => handleStatCardClick(c.filterKey)}
              key={c.label}
              className={`border rounded-2xl p-4 flex flex-col gap-1 text-left cursor-pointer transition-all duration-300 relative overflow-hidden group select-none shadow-sm ${
                isSelected 
                  ? 'border-brand-cyan/60 ring-2 ring-brand-cyan/25 bg-[#12141A] scale-[1.01]' 
                  : `bg-[#1A1D26] ${c.color}`
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{c.label}</span>
              <span className="text-2xl font-black text-white font-mono tracking-tight">{c.value}</span>
              <div className="absolute right-3.5 bottom-3.5 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingBag size={20} />
              </div>
            </button>
          );
        })}
      </div>

      {/* C. COMPLEX FILTER BAR CONTAINER */}
      <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 shadow-lg flex flex-col gap-4.5">
        
        {/* Core Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* 1. Main Text Search Input */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[#9BA3C7] tracking-wider">Search Campaigns</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, link, or service target..."
                className="w-full bg-[#12141A] text-white text-xs py-3.5 pl-10 pr-4 rounded-xl border border-brand-border/60 focus:border-brand-cyan outline-none transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          {/* 2. Platform Category Selector */}
          <div className="md:col-span-3 flex flex-col gap-1.5 relative">
            <label className="text-[10px] uppercase font-bold text-[#9BA3C7] tracking-wider">Filter Platform</label>
            <button
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left bg-[#12141A] text-slate-100 text-xs py-3.5 px-4 rounded-xl border border-brand-border/60 hover:border-brand-cyan/40 outline-none flex items-center justify-between cursor-pointer font-bold select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${CATEGORIES_LIST.find(c => c.id === selectedCategory)?.dotColor || 'bg-brand-cyan'}`} />
                <span>{CATEGORIES_LIST.find(c => c.id === selectedCategory)?.name || 'All Platform'}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsCategoryDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute z-40 top-[65px] left-0 w-full bg-[#12141A] border border-[#252836] rounded-xl overflow-hidden shadow-2xl p-1 max-h-56 overflow-y-auto"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <button
                        align-left="true"
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id ? 'bg-brand-primary/10 text-white' : 'text-slate-400 hover:bg-white/4 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                          <span>{cat.name}</span>
                        </div>
                        {selectedCategory === cat.id && <Check size={12} className="text-brand-cyan" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Status Badge Selector */}
          <div className="md:col-span-3 flex flex-col gap-1.5 relative">
            <label className="text-[10px] uppercase font-bold text-[#9BA3C7] tracking-wider">Filter Status</label>
            <button
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsCategoryDropdownOpen(false);
              }}
              className="w-full text-left bg-[#12141A] text-slate-100 text-xs py-3.5 px-4 rounded-xl border border-brand-border/60 hover:border-brand-cyan/40 outline-none flex items-center justify-between cursor-pointer font-bold select-none"
            >
              <span>{statusFilter === 'All' ? 'All Statuses' : `${statusFilter}`}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            <AnimatePresence>
              {isStatusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsStatusDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute z-40 top-[65px] left-0 w-full bg-[#12141A] border border-[#252836] rounded-xl overflow-hidden shadow-2xl p-1"
                  >
                    {['All', 'Pending', 'In Progress', 'Completed', 'Partial', 'Cancelled', 'Refunded'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st as any);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                          statusFilter === st ? 'bg-brand-primary/10 text-white' : 'text-slate-400 hover:bg-white/4 hover:text-white'
                        }`}
                      >
                        <span>{st === 'All' ? 'All Statuses' : st}</span>
                        {statusFilter === st && <Check size={12} className="text-brand-cyan" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Date Range Picking */}
          <div className="md:col-span-2 flex items-center justify-start gap-2 self-stretch pt-5 md:pt-0">
            <button
              onClick={handleResetFilters}
              className="w-full h-11 border border-[#252836] hover:border-rose-500/30 text-slate-400 hover:text-rose-500 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 select-none cursor-pointer hover:bg-rose-500/4"
            >
              <X size={14} />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>

        {/* Date Calendar inputs bar */}
        <div className="pt-3 border-t border-[#252836]/40 flex flex-col sm:flex-row sm:items-center gap-3.5 text-xs text-brand-text-secondary select-none">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-brand-cyan shrink-0" />
            <span className="font-bold text-[#9BA3C7] uppercase tracking-wider text-[10px]">Filter Date Range:</span>
          </div>

          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-[#12141A] border border-brand-border/60 hover:border-brand-cyan/30 text-white rounded-lg py-1.5 px-3 select-none text-xs outline-none focus:border-brand-primary w-full"
            />
            <span className="text-[#9BA3C7] font-bold text-[10px]">TO</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-[#12141A] border border-brand-border/60 hover:border-brand-cyan/30 text-white rounded-lg py-1.5 px-3 select-none text-xs outline-none focus:border-brand-primary w-full"
            />
          </div>
        </div>

      </div>

      {/* D. BULK ACTIONS BAR (Shows only when checkbox checked) */}
      <AnimatePresence>
        {selectedRowIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-[#12141A] border border-brand-cyan/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-3 select-none"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {selectedRowIds.length} SMM Reseller Campaign Nodes Selected
              </span>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <button
                onClick={handleBulkCancel}
                className="flex-1 sm:flex-none py-2.5 px-4 border border-brand-danger/30 hover:bg-brand-danger hover:text-white hover:border-transparent text-brand-danger rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <XCircle size={13} />
                <span>Cancel Pending Nodes</span>
              </button>

              <button
                onClick={handleBulkExport}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-[#1A1D26] hover:bg-[#1A1D26]/85 text-white border border-[#252836] hover:border-brand-cyan/40 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                <span>Export Selected (CSV)</span>
              </button>

              <button
                onClick={() => setSelectedRowIds([])}
                className="p-2.5 text-gray-500 hover:text-white transition-colors"
                aria-label="Clear bulk selection"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* E. CORE REGISTRY DATA TABLE CARD */}
      <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[450px] md:min-w-[950px] overflow-hidden">
            <thead>
              <tr className="border-b border-brand-border/40 bg-[#12141A] text-[9.5px] font-bold text-[#8F94B5] uppercase tracking-wider select-none">
                <th className="py-4 px-4.5 text-center w-12">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedRowIds.includes(o.id))}
                    onChange={handleToggleAllSelect}
                    className="w-4 h-4 rounded accent-brand-cyan outline-none cursor-pointer border-[#252836]"
                  />
                </th>
                <th className="py-4 px-4.5">Order ID</th>
                <th className="py-4 px-4.5">SMM Service Target</th>
                <th className="py-4 px-4.5 hidden lg:table-cell">Destination Link</th>
                <th className="py-4 px-4.5 font-mono">Qty</th>
                <th className="py-4 px-4.5 font-mono hidden xl:table-cell">Start cnt</th>
                <th className="py-4 px-4.5 font-mono hidden xl:table-cell">Remains</th>
                <th className="py-4 px-4.5">Status</th>
                <th className="py-4 px-4.5 hidden sm:table-cell">Requested</th>
                <th className="py-4 px-4.5 text-right pr-6">Action</th>
              </tr>
            </thead>

            {paginatedOrders.length > 0 ? (
              <tbody className="divide-y divide-brand-border/15 text-xs font-semibold text-slate-100">
                {paginatedOrders.map((order) => {
                  const isChecked = selectedRowIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/[0.012] transition-colors leading-relaxed ${
                        isChecked ? 'bg-[#6C63FF]/2' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRowSelect(order.id)}
                          className="w-4 h-4 rounded accent-brand-cyan cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-3 px-4.5">
                        <span className="font-mono text-[11px] font-black text-slate-400 block hover:text-brand-cyan transition-colors cursor-pointer" onClick={() => setActiveDetailOrder(order)}>
                          {order.id}
                        </span>
                      </td>

                      {/* Service Target */}
                      <td className="py-3 px-4.5 max-w-[260px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6.5 h-6.5 rounded-lg bg-[#12141A] border border-[#252836] flex items-center justify-center shrink-0">
                            {renderPlatformBadgeIcon(order.category)}
                          </div>
                          <span
                            className="truncate text-white font-bold leading-normal block hover:text-brand-cyan cursor-pointer pr-1"
                            title={order.service}
                            onClick={() => setActiveDetailOrder(order)}
                          >
                            {order.service}
                          </span>
                        </div>
                      </td>

                      {/* Web Link */}
                      <td className="py-3 px-4.5 max-w-[170px] relative group pointer-events-auto hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-brand-cyan hover:underline hover:text-brand-cyan/85 cursor-pointer">
                          <a href={order.target} target="_blank" rel="noreferrer" className="truncate text-[11.5px] font-mono leading-none flex items-center gap-1">
                            <span>{order.target}</span>
                          </a>
                          <ExternalLink size={10} className="shrink-0 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                        </div>
                        
                        {/* Elegant custom tooltip overlay on hover */}
                        <div className="absolute z-50 left-2 top-[-25px] bg-[#12141A] text-[10px] text-white border border-[#252836] px-2 py-1 rounded shadow-2xl transition-all duration-200 scale-0 group-hover:scale-100 max-w-sm break-all font-mono">
                          {order.target}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4.5 font-mono">{order.qty.toLocaleString()}</td>

                      {/* Start count */}
                      <td className="py-3 px-4.5 font-mono text-slate-400 hidden xl:table-cell">{order.startCount.toLocaleString()}</td>

                      {/* Remains */}
                      <td className="py-3 px-4.5 font-mono text-slate-400 hidden xl:table-cell">{order.remains.toLocaleString()}</td>

                      {/* Status badge */}
                      <td className="py-3 px-4.5">
                        <span className={`inline-flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider py-1 px-2.5 rounded-md border ${getStatusBadgeStyles(order.status)}`}>
                          {order.status === 'In Progress' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                          )}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4.5 relative group cursor-help text-[11.5px] hidden sm:table-cell">
                        <span className="text-slate-200 border-b border-dashed border-slate-600 pb-0.5">{order.dateRelative}</span>
                        
                        {/* Hover Tooltip display absolute exact ISO stamp */}
                        <div className="absolute z-50 bottom-[35px] left-1/2 -translate-x-1/2 bg-[#12141A] text-[9.5px] text-white border border-[#252836] py-1 px-2.5 rounded font-mono shadow-xl scale-0 group-hover:scale-100 transition-all text-center whitespace-nowrap leading-relaxed">
                          Full timestamp:<br />{new Date(order.date).toLocaleString()}
                        </div>
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-3 px-4.5 text-right pr-6">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => setActiveDetailOrder(order)}
                            className="bg-[#12141A] hover:bg-brand-primary/10 hover:text-white border border-brand-border text-[#9BA3C7] py-1.5 px-2.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1 hover:border-brand-primary"
                            title="Inspect complete ledger tracker details"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>

                          <button
                            onClick={() => handleCopyLink(order.target, order.id)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              copyFeedbackId === order.id
                                ? 'bg-emerald-500/10 border-brand-success text-brand-success'
                                : 'bg-[#12141A] border-brand-border/60 hover:border-brand-cyan/40 text-slate-400 hover:text-white'
                            }`}
                            title="Copy target URL destination link"
                          >
                            <Copy size={11.5} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3.5 text-brand-text-secondary select-none">
                      <ShoppingBag size={38} className="text-gray-600 animate-bounce" />
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-extrabold text-white text-xs uppercase tracking-wider">No Reseller Campaigns Found</span>
                        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                          Could not locate any matching SMM reseller orders in this filter block. Please verify your search inputs, status checkboxes, or calendars range parameters.
                        </p>
                      </div>
                      <button
                        onClick={handleResetFilters}
                        className="mt-1 bg-[#12141A] border border-[#252836] hover:border-brand-cyan py-2 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Reset Filtration Parameters
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* F. PAGINATION CONTROLS PANEL */}
        <div className="bg-[#12141A] px-4.5 py-4 border-t border-brand-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-brand-text-secondary select-none">
          
          {/* Rows count selector */}
          <div className="flex items-center gap-3 font-semibold">
            <span>Show per page:</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value) as any);
                  setCurrentPage(1);
                }}
                className="bg-[#1A1D26] border border-[#252836] text-white py-1.5 pl-3.5 pr-7 rounded-lg text-xs outline-none cursor-pointer focus:border-brand-cyan appearance-none font-bold"
              >
                <option value={10}>10 records</option>
                <option value={25}>25 records</option>
                <option value={50}>50 records</option>
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <span className="text-slate-400 text-[11px]">
              Showing <span className="font-bold text-white">{filteredOrders.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to{' '}
              <span className="font-bold text-white">{Math.min(filteredOrders.length, currentPage * rowsPerPage)}</span> of{' '}
              <span className="font-bold text-white">{filteredOrders.length}</span> matching indices
            </span>
          </div>

          {/* Nav list */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border select-none transition-colors cursor-pointer flex items-center justify-center ${
                currentPage === 1
                  ? 'bg-transparent border-brand-border/10 text-zinc-700 cursor-not-allowed'
                  : 'bg-[#1A1D26] border-[#252836] hover:border-brand-cyan text-slate-300 hover:text-white'
              }`}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (totalPages <= 5) return true;
                return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1.5">
                    {showEllipsis && <span className="text-slate-600 px-1 font-bold">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors select-none cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? 'bg-brand-primary text-white shadow shadow-brand-primary/20 border border-transparent'
                          : 'bg-[#1A1D26] border-[#252836] hover:border-slate-500 text-slate-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border select-none transition-colors cursor-pointer flex items-center justify-center ${
                currentPage === totalPages
                  ? 'bg-transparent border-brand-border/10 text-zinc-700 cursor-not-allowed'
                  : 'bg-[#1A1D26] border-[#252836] hover:border-brand-cyan text-slate-300 hover:text-white'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

      {/* F. ORDER DETAIL IN-DEPTH DRAWER MODAL OVERLAY */}
      <AnimatePresence>
        {activeDetailOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailOrder(null)}
              className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-sm z-50 pointer-events-auto"
            />

            {/* Right-sided elegant large drawer modal */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg md:max-w-xl bg-[#13151D] border-l border-[#252836] shadow-2xl z-50 flex flex-col text-slate-200"
            >
              
              {/* Header block with glowing line boundary */}
              <div className="p-5.5 md:p-6 border-b border-[#252836] bg-[#1A1D26] flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-primary/10 border border-brand-primary/20 text-[#00D4FF] rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider block">
                      Campaign Ledger: {activeDetailOrder.id}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      Platform category node: {activeDetailOrder.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-[9.5px] uppercase font-bold tracking-wider py-1 px-3.5 rounded-md border ${getStatusBadgeStyles(activeDetailOrder.status)}`}>
                    {activeDetailOrder.status === 'In Progress' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                    )}
                    <span>{activeDetailOrder.status}</span>
                  </span>

                  <button
                    onClick={() => setActiveDetailOrder(null)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-[#252836] transition-all cursor-pointer"
                    aria-label="Close panel"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-5.5 md:p-6 space-y-5">
                
                {/* 1. Core Meta Information Widget Card */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-xl p-4.5 space-y-3 shadow-md text-xs relative">
                  <div className="text-[9px] uppercase tracking-widest font-bold text-brand-cyan">SMM Service Identifier</div>
                  <h4 className="text-white font-bold leading-relaxed text-[13px]">{activeDetailOrder.service}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-bold text-slate-300">
                    <div className="bg-[#12141A] p-2 rounded-lg border border-[#252836]/40 flex flex-col gap-0.5">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Interface Layer</span>
                      <span className="text-white capitalize">{activeDetailOrder.pipelineType || 'API Autoreflow'}</span>
                    </div>
                    <div className="bg-[#12141A] p-2 rounded-lg border border-[#252836]/40 flex flex-col gap-0.5">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Client Quality</span>
                      <span className="text-emerald-400 font-semibold">{activeDetailOrder.quality || 'Premium Verified'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Status Vertical Timeline Flow */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-xl p-4.5 shadow-md flex flex-col gap-4">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-brand-cyan">Workflow Delivery Timeline</span>
                  
                  <div className="relative pl-6 space-y-5 border-l border-brand-border/40 ml-3.5">
                    
                    {/* Step 1: Initial Created */}
                    <div className="relative">
                      <div className="absolute left-[-30px] top-1 w-5 h-5 rounded-full bg-emerald-500/10 border border-brand-success text-brand-success flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="flex flex-col text-[11px] font-bold">
                        <span className="text-white">Order Placed & Sanitized</span>
                        <p className="text-[10px] text-[#9BA3C7] mt-0.5 font-normal leading-normal">
                          Funds authorized successfully via internal balance ledger. Service initialized.
                        </p>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">{new Date(new Date(activeDetailOrder.date).getTime() - 25 * 60 * 1000).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Step 2: API Pipeline Start */}
                    <div className="relative">
                      <div className={`absolute left-[-30px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                        activeDetailOrder.status === 'Pending'
                          ? 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800] animate-pulse'
                          : 'bg-emerald-500/10 border-brand-success text-brand-success'
                      }`}>
                        {activeDetailOrder.status === 'Pending' ? '•' : '✓'}
                      </div>
                      <div className="flex flex-col text-[11px] font-bold">
                        <span className="text-white">API Dispatch Handshake</span>
                        <p className="text-[10px] text-[#9BA3C7] mt-0.5 font-normal leading-normal">
                          Platform routed request to corresponding social provider pipeline keys successfully.
                        </p>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">{new Date(new Date(activeDetailOrder.date).getTime() - 5 * 60 * 1000).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Step 3: Action Delivery */}
                    <div className="relative">
                      <div className={`absolute left-[-30px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                        activeDetailOrder.status === 'Pending'
                          ? 'bg-zinc-850 border-[#252836] text-slate-600'
                          : activeDetailOrder.status === 'In Progress' || activeDetailOrder.status === 'Partial'
                          ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan animate-pulse'
                          : 'bg-emerald-500/10 border-brand-success text-brand-success'
                      }`}>
                        {activeDetailOrder.status === 'Pending' ? '' : activeDetailOrder.status === 'In Progress' || activeDetailOrder.status === 'Partial' ? '•' : '✓'}
                      </div>
                      <div className="flex flex-col text-[11px] font-bold">
                        <span className="text-white">Active Social Streaming</span>
                        <p className="text-[10px] text-[#9BA3C7] mt-0.5 font-normal leading-normal">
                          Accounts subscribing/liking node points manually. Natural drip delivery active.
                        </p>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">
                          {activeDetailOrder.status === 'Pending' ? 'Awaiting start trigger' : `${new Date(activeDetailOrder.date).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. Detailed Numerical Figures Grid */}
                <div className="bg-[#1A1D26] border border-[#252836] rounded-xl p-4.5 space-y-4 shadow-md text-xs">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-brand-cyan">Pipeline Quantitative Ledger</span>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-bold text-slate-200">
                    
                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Destination URL Target</span>
                      <a href={activeDetailOrder.target} target="_blank" rel="noreferrer" className="text-brand-cyan truncate font-mono text-[10px] flex items-center gap-1">
                        <span>{activeDetailOrder.target}</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>

                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Total Ordered Volume</span>
                      <span className="text-white font-mono">{activeDetailOrder.qty.toLocaleString()} units</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Start Counter Metric</span>
                      <span className="text-slate-200 font-mono">{activeDetailOrder.startCount.toLocaleString()} index</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Current Checked Metric</span>
                      <span className="text-slate-200 font-mono">{(activeDetailOrder.currentCount).toLocaleString()} index</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Remains Distribution</span>
                      <span className="text-[#FF4757] font-mono">{activeDetailOrder.remains.toLocaleString()} remains</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pb-2 border-b border-[#252836]/40">
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Transaction pricing</span>
                      <span className="text-brand-success font-mono">${activeDetailOrder.price.toFixed(2)} USD</span>
                    </div>

                  </div>
                </div>

                {/* 4. Refill Section if Applicable */}
                {activeDetailOrder.refillAvailable && activeDetailOrder.status === 'Completed' && (
                  <div className="bg-[#1A1D26] border border-emerald-500/20 rounded-xl p-4.5 shadow-md flex flex-col gap-3.5 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-brand-success" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">Refill Guarantee Enabled</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          This order holds drop-monitoring refill guarantees active until <span className="text-brand-success font-bold">{activeDetailOrder.refillUntil}</span>.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRefillSingle(activeDetailOrder.id)}
                      disabled={refillLoading}
                      className="w-full py-2 px-3 border border-brand-success/30 hover:bg-brand-success hover:text-white hover:border-transparent text-brand-success rounded-xl text-xs font-black transition-colors cursor-pointer select-none inline-flex items-center justify-center gap-1.5"
                    >
                      {refillLoading ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                      <span>Trigger Drop Refill</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Bottom Action Footer */}
              <div className="p-5.5 md:p-6 border-t border-[#252836] bg-[#12141A] flex items-center gap-3">
                
                {activeDetailOrder.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelSingle(activeDetailOrder.id)}
                    className="flex-1 py-3 bg-brand-danger/10 hover:bg-brand-danger text-brand-danger hover:text-white border border-brand-danger/25 hover:border-transparent rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <XCircle size={14} />
                    <span>Cancel Pending Order</span>
                  </button>
                )}

                <button
                  onClick={() => handleCopyLink(activeDetailOrder.target, activeDetailOrder.id)}
                  className="flex-1 py-3 bg-[#1A1D26] hover:bg-[#1A1D26]/80 text-white border border-[#252836] hover:border-brand-cyan/40 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Copy size={13} />
                  <span>Copy Destination Link</span>
                </button>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
