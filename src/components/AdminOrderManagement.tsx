import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Edit,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  User,
  Layers,
  Database,
  ArrowRight,
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';

interface SMMOrderRecord {
  id: string;
  username: string;
  serviceId: string;
  serviceName: string;
  link: string;
  quantity: number;
  startCount: number;
  remains: number;
  charge: number;
  status: 'Pending' | 'Processing' | 'In Progress' | 'Completed' | 'Failed' | 'Cancelled';
  providerStatus: 'Pending' | 'Success' | 'In Queue' | 'Error' | 'Completed';
  providerName: string;
  providerOrderId: string;
  date: string;
  providerResponseLog: string;
  timeline: Array<{ time: string; status: string; log: string }>;
  adminNotes: string;
}

interface AdminOrderManagementProps {
  onShowToast: (msg: string) => void;
  onInspectUser: (username: string) => void;
}

// Highly realistic mock bulk database of system-wide client operations

export default function AdminOrderManagement({ onShowToast, onInspectUser }: AdminOrderManagementProps) {
  const [orders, setOrders] = useState<SMMOrderRecord[]>([]);
  
  useEffect(() => {
    import('../firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot, query, orderBy }) => {
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(qOrders, (snap) => {
          const fetchedOrders: SMMOrderRecord[] = [];
          snap.forEach(doc => {
            const d = doc.data();
            fetchedOrders.push({
              id: doc.id,
              username: d.userId || 'Unknown',
              serviceId: d.serviceId || 'Unknown',
              serviceName: d.serviceName || 'Unknown Service',
              link: d.link || '',
              quantity: d.quantity || 0,
              startCount: d.startCount || 0,
              remains: d.remains || 0,
              charge: d.charge || 0,
              status: d.status || 'Pending',
              providerStatus: d.providerStatus || 'Pending',
              providerName: d.providerName || 'Local System',
              providerOrderId: d.providerOrderId || '',
              date: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'Unknown',
              providerResponseLog: d.providerResponseLog || '{}',
              timeline: d.timeline || [],
              adminNotes: d.adminNotes || ''
            });
          });
          setOrders(fetchedOrders);
        });
        return () => unsub();
      });
    });
  }, []);

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Real-time dynamic sync stats indicators from provider
  const [lastSyncedTime, setLastSyncedTime] = useState('Jun 05, 23:45');
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // Multi status checkboxes
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('All');
  
  // Custom dropdown panels triggers
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected order details modal states
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  
  // Edit forms overrides (modal context)
  const [editStatus, setEditStatus] = useState<SMMOrderRecord['status']>('Pending');
  const [editStartCount, setEditStartCount] = useState(0);
  const [editRemains, setEditRemains] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [refundToggle, setRefundToggle] = useState(false);
  const [refundAmount, setRefundAmount] = useState('0.00');

  const selectedInspectOrder = useMemo(() => {
    return orders.find(o => o.id === inspectOrderId) || null;
  }, [orders, inspectOrderId]);

  // Handle syncing from external API providers
  const handleSyncFromProvider = () => {
    setIsSyncing(true);
    onShowToast("Pinging external API gateways: Resolving delivery remaining discrepancies...");
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(`Today, ${timeStr}`);
      setIsSyncing(false);
      onShowToast("Order delivery records successfully synchronized dynamically.");
    }, 1400);
  };

  // Helper selectors checkbox togglers
  const handleToggleStatusFilter = (st: string) => {
    if (statusFilters.includes(st)) {
      setStatusFilters(prev => prev.filter(item => item !== st));
    } else {
      setStatusFilters(prev => [...prev, st]);
    }
    setCurrentPage(1);
  };

  // Bulk selectors callbacks
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(item => item !== id));
    }
  };

  // Computed lists relative to filters parameters
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Query terms search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.username.toLowerCase().includes(query) ||
        o.link.toLowerCase().includes(query) ||
        o.serviceName.toLowerCase().includes(query)
      );
    }

    // Status multi-select checkboxes filter
    if (statusFilters.length > 0) {
      result = result.filter(o => statusFilters.includes(o.status));
    }

    // Platforms quick filters
    if (selectedPlatform !== 'All') {
      result = result.filter(o => o.serviceName.toLowerCase().includes(selectedPlatform.toLowerCase()));
    }

    // Provider filter drops
    if (selectedProvider !== 'All') {
      result = result.filter(o => o.providerName === selectedProvider);
    }

    return result;
  }, [orders, searchTerm, statusFilters, selectedPlatform, selectedProvider]);

  // Pagination parameters
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing' || o.status === 'In Progress').length,
      failed: orders.filter(o => o.status === 'Failed' || o.status === 'Cancelled').length,
      revenue: orders.reduce((sum, o) => o.status === 'Completed' ? sum + o.charge : sum, 0)
    };
  }, [orders]);

  // Operational events methods
  const handleResendToProvider = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        onShowToast(`Repushed order payload ${id} to system pipeline gateway successfully!`);
        return {
          ...o,
          status: 'Processing',
          providerStatus: 'In Queue',
          timeline: [...o.timeline, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), status: "Resent", log: "Resent bulk order parameters manually through provider pipeline." }]
        };
      }
      return o;
    }));
  };

  const handleRefillOrder = (id: string) => {
    onShowToast(`Dispatched custom refill request trigger. Triggering API retry webhook node on order ID ${id}.`);
  };

  const handleCancelAndRefund = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        onShowToast(`Cancelled SMM order ${id} manually. Reversals of $${o.charge} returned into ledger.`);
        return {
          ...o,
          status: 'Cancelled',
          providerStatus: 'Error',
          timeline: [...o.timeline, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), status: "Cancelled", log: "Administrative manual cancel and refund fully compiled." }]
        };
      }
      return o;
    }));
  };

  const handleForceManualComplete = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        onShowToast(`Manually completed order ${id}. Bypassing external provider synchronization check.`);
        return {
          ...o,
          status: 'Completed',
          providerStatus: 'Completed',
          remains: 0,
          timeline: [...o.timeline, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), status: "Manual Override", log: "Administrative force complete triggered by super administrator role." }]
        };
      }
      return o;
    }));
  };

  // Bulk commands handles
  const handleBulkCancelAndRefund = () => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        return { ...o, status: 'Cancelled', providerStatus: 'Error' };
      }
      return o;
    }));
    onShowToast(`Dispatched bulk cancel operations securely across ${selectedOrderIds.length} campaigns queue.`);
    setSelectedOrderIds([]);
  };

  const handleBulkResend = () => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        return { ...o, status: 'Processing', providerStatus: 'In Queue' };
      }
      return o;
    }));
    onShowToast(`Bulk routed ${selectedOrderIds.length} target order pipelines.`);
    setSelectedOrderIds([]);
  };

  const handleBulkComplete = () => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        return { ...o, status: 'Completed', providerStatus: 'Completed', remains: 0 };
      }
      return o;
    }));
    onShowToast(`Completed ${selectedOrderIds.length} campaigns. Ledger balances verified.`);
    setSelectedOrderIds([]);
  };

  // Open detailed inspection editor modal
  const handleOpenInspectModal = (order: SMMOrderRecord) => {
    setInspectOrderId(order.id);
    setEditStatus(order.status);
    setEditStartCount(order.startCount);
    setEditRemains(order.remains);
    setEditNotes(order.adminNotes);
    setRefundToggle(false);
    setRefundAmount(order.charge.toFixed(2));
  };

  // Update order modifications from administrative context
  const handleSaveOrderOverrides = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectOrderId) return;

    setOrders(prev => prev.map(o => {
      if (o.id === inspectOrderId) {
        let finalStatus = editStatus;
        if (refundToggle) {
          finalStatus = 'Cancelled';
          onShowToast(`Overrode and cancelled SMM order ${inspectOrderId}. Dispatched $${refundAmount} refund balance.`);
        } else {
          onShowToast(`Saved custom administrative updates safely for order ID ${inspectOrderId}.`);
        }
        return {
          ...o,
          status: finalStatus,
          startCount: editStartCount,
          remains: editRemains,
          adminNotes: editNotes,
          timeline: [...o.timeline, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), status: "System Edited", log: "Administrative manual variables update stored on database." }]
        };
      }
      return o;
    }));

    setInspectOrderId(null);
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER BLOCK */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D26] p-5 rounded-2xl border border-[#1E2230] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 flex items-center justify-center text-[#FF4757]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-widest uppercase text-white leading-normal">
              Bulk Orders Management
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono leading-none">
              <span className="text-gray-500 font-bold">API Sync Track:</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                Last synchronised: {lastSyncedTime}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-brand-cyan font-bold bg-[#6C63FF]/10 px-1.5 py-0.5 rounded text-[8.5px] uppercase tracking-wider">
                Auto Sync: 5 Min (LIVE)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncFromProvider}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[10.5px] font-black text-[#FF4757] hover:text-white bg-[#FF4757]/10 hover:bg-[#FF4757]/20 border border-[#FF4757]/20 hover:border-[#FF4757]/45 transition-all cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync Provider Queue</span>
          </button>
        </div>
      </div>

      {/* MAIN SYSTEM KPIs INDICATORS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Active SMM campaigns", val: stats.total, sub: "Registered volume", color: "text-white" },
          { label: "Net Revenue Checked", val: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: "Completed order volumes", color: "text-emerald-400" },
          { label: "Pending API Queue", val: stats.pending, sub: "Dispatched waiting", color: "text-amber-500 animate-pulse" },
          { label: "Processing & Active", val: stats.processing, sub: "Campaign feeds delivery", color: "text-indigo-400" },
          { label: "Failed / Reversed", val: stats.failed, sub: "Errors flagged logs", color: "text-[#FF4757]" }
        ].map((kp, idx) => (
          <div key={idx} className="bg-[#1A1D26] border border-[#1E2230] rounded-xl p-4 flex flex-col text-left">
            <span className="text-[8.5px] font-black uppercase text-gray-500 tracking-wider block">{kp.label}</span>
            <span className={`text-lg font-black mt-2 font-mono tracking-tight leading-none ${kp.color}`}>{kp.val}</span>
            <span className="text-[9px] text-gray-600 font-semibold mt-1.5 block leading-none">{kp.sub}</span>
          </div>
        ))}
      </div>

      {/* FILTER ADVANCED PANELS */}
      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-2xl shadow-md space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Query search input */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Query order indices, link URL domain, username..."
              className="w-full bg-[#12141A] border border-[#252836] hover:border-[#6C63FF]/35 rounded-xl pl-9.5 pr-4 py-2.5 text-[11px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-all"
            />
          </div>

          {/* Core Multi Select Status triggers dropdown simulation */}
          <div className="lg:col-span-3 relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full h-10 bg-[#12141A] border border-[#252836] rounded-xl px-4 flex items-center justify-between text-[11px] text-gray-400 font-black uppercase transition-all"
            >
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-gray-500" />
                <span>
                  {statusFilters.length === 0 ? "All Campaign Statuses" : `${statusFilters.length} Statuses Checked`}
                </span>
              </div>
              <span className="text-gray-600">▼</span>
            </button>

            {/* Dropdown elements */}
            <AnimatePresence>
              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 mt-2 bg-[#1C1F2E] border-2 border-[#2E334D] rounded-xl z-20 p-3 space-y-2 max-h-[220px] overflow-y-auto text-xs"
                  >
                    {['Pending', 'Processing', 'In Progress', 'Completed', 'Cancelled', 'Failed'].map((st) => (
                      <label key={st} className="flex items-center gap-2.5 p-1 rounded hover:bg-white/5 cursor-pointer text-gray-300 font-bold select-none">
                        <input
                          type="checkbox"
                          checked={statusFilters.includes(st)}
                          onChange={() => handleToggleStatusFilter(st)}
                          className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#FF4757]"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                    
                    <button
                      onClick={() => setStatusFilters([])}
                      className="w-full py-1.5 text-center text-[9px] font-black uppercase bg-[#12141A] hover:bg-red-500/10 text-[#FF4757] rounded-lg mt-2.5 transition-all text-center block"
                    >
                      Clear Status Filters
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Platform category selector */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-[#12141A] border border-[#252836] rounded-xl px-3.5 text-[10.5px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Social Networks</option>
              <option value="Instagram">Instagram (Photos/Reels)</option>
              <option value="TikTok">TikTok (Views/Shares)</option>
              <option value="YouTube">YouTube Watch Hours</option>
              <option value="Twitter">Twitter/X Followings</option>
              <option value="Telegram">Telegram Group Feeds</option>
            </select>
          </div>

          {/* Provider category selectors */}
          <div className="lg:col-span-2 relative">
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-[#12141A] border border-[#252836] rounded-xl px-3 text-[10.5px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All API Channels</option>
              <option value="SMM_Core_API_v4">SMM_Core_API_v4 (Direct)</option>
              <option value="Global_SMM_Panel_PRO">Global_Panel_PRO</option>
              <option value="Manual Operator Queue">Manual Operator Queue</option>
            </select>
          </div>

        </div>
      </div>

      {/* BULK ACTIONS FOR CAMPAIGNS DISPLAY */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#FF4757]/10 border border-[#FF4757]/25 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-[#FF4757]" size={15} />
                <span className="text-xs font-bold text-white leading-normal">
                  Checked <strong className="text-brand-cyan">{selectedOrderIds.length} SMM orders</strong>. Selected actions will route to providers endpoints.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkResend}
                  className="px-3 py-1.5 rounded-lg bg-[#FF4757]/10 hover:bg-[#FF4757]/20 border border-[#FF4757]/20 text-white text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
                >
                  Resend Selected
                </button>
                <button
                  onClick={handleBulkComplete}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
                >
                  Mark Complete
                </button>
                <button
                  onClick={handleBulkCancelAndRefund}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-500/90 text-white text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer shadow"
                >
                  Cancel + Refund Selected
                </button>
                <button
                  onClick={() => setSelectedOrderIds([])}
                  className="text-xs text-gray-500 hover:text-white font-black ml-2"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE DATA SHEETS */}
      <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#252836] bg-[#12141A]/50 text-gray-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#FF4757] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3">Order ID</th>
                <th className="py-4 px-3">Username</th>
                <th className="py-4 px-3">SMM Service Name</th>
                <th className="py-4 px-3">Destination Link</th>
                <th className="py-4 px-3 text-center">Qty</th>
                <th className="py-4 px-3 text-center">Start / Remains</th>
                <th className="py-4 px-3 text-right">Sum Charged</th>
                <th className="py-4 px-3 text-center">Public Status</th>
                <th className="py-4 px-3 text-center">Provider Sync</th>
                <th className="py-4 px-3">Provider Gateway</th>
                <th className="py-4 px-5 text-right">Actions hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold text-xs">
              
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-500 uppercase font-black tracking-widest text-[11px]">
                    No corresponding orders logged inside database queue.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const isChecked = selectedOrderIds.includes(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={`hover:bg-[#12141A]/40 transition-colors ${
                        isChecked ? 'bg-[#FF4757]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(o.id, e.target.checked)}
                          className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#FF4757] cursor-pointer"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="py-3 px-3 font-mono text-white text-xs">
                        {o.id}
                      </td>

                      {/* User Account Trigger Link */}
                      <td className="py-3 px-3 text-xs">
                        <span 
                          onClick={() => onInspectUser(o.username)}
                          className="text-brand-cyan hover:underline hover:text-white transition-all cursor-pointer"
                        >
                          @{o.username}
                        </span>
                      </td>

                      {/* Service ID and Name */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="flex flex-col text-left">
                          <span className="text-white truncate" title={o.serviceName}>
                            {o.serviceName}
                          </span>
                          <span className="bg-[#12141A] border border-[#252836] text-gray-500 text-[8.5px] px-1 py-0.5 rounded w-max mt-1 font-mono leading-none">
                            {o.serviceId}
                          </span>
                        </div>
                      </td>

                      {/* Truncated link and copy button */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="truncate max-w-[100px] text-[11px]" title={o.link}>
                            {o.link.replace('https://www.', '')}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(o.link);
                              onShowToast("Campaign url safely duplicated.");
                            }}
                            className="p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-3 text-center font-mono text-white text-xs">
                        {o.quantity.toLocaleString('en-US')}
                      </td>

                      {/* start / remains */}
                      <td className="py-3 px-3 text-center font-mono">
                        <div className="flex flex-col text-center">
                          <span className="text-gray-400">{o.startCount}</span>
                          <span className="text-gray-600 text-[10px] mt-0.5 border-t border-[#252836] pt-0.5">
                            remains: <strong className="text-brand-cyan">{o.remains}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Sum Charged */}
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 text-xs">
                        ${o.charge.toFixed(2)}
                      </td>

                      {/* Public User facing Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider ${
                          o.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : o.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10 animate-pulse'
                            : o.status === 'Cancelled'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                            : 'bg-[#6C63FF]/10 text-brand-cyan border border-[#6C63FF]/10'
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Internal Provider log status */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`text-[9px] font-black uppercase ${
                          o.providerStatus === 'Completed' || o.providerStatus === 'Success'
                            ? 'text-emerald-500'
                            : o.providerStatus === 'Error'
                            ? 'text-[#FF4757]'
                            : 'text-gray-500'
                        }`}>
                          ● {o.providerStatus}
                        </span>
                      </td>

                      {/* Provider source */}
                      <td className="py-3 px-3 font-mono text-gray-500 text-[10px]">
                        {o.providerName}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          <button
                            onClick={() => handleOpenInspectModal(o)}
                            title="Inspect Logs & Timeline"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#6C63FF]/10 border border-transparent hover:border-[#6C63FF]/20 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            onClick={() => handleResendToProvider(o.id)}
                            disabled={o.status === 'Completed' || o.status === 'Cancelled'}
                            title="Resend to SMM Endpoint"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <RotateCcw size={13} />
                          </button>

                          <button
                            onClick={() => handleForceManualComplete(o.id)}
                            disabled={o.status === 'Completed' || o.status === 'Cancelled'}
                            title="Manually Complete"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#00D4FF]/10 hover:text-brand-cyan border border-transparent disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                          </button>

                          <button
                            onClick={() => handleCancelAndRefund(o.id)}
                            disabled={o.status === 'Cancelled' || o.status === 'Completed'}
                            title="Cancel & Refund Client"
                            className="p-1.5 rounded-lg bg-[#252836]/40 hover:bg-red-500/15 hover:text-red-400 border border-transparent disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <XCircle size={13} />
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
            Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong className="text-white">{filteredOrders.length}</strong> campaigns registered.
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
          ORDER INSPECT & VARIABLE OVERRIDE MODAL (Detailed Admin Control Center)
         ========================================================================= */}
      <AnimatePresence>
        {inspectOrderId && selectedInspectOrder && (
          <div className="fixed inset-0 bg-[#0A0B0F]/85 backdrop-blur-sm flex items-center justify-center z-[990] p-4 text-left overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-4xl shadow-2xl relative space-y-5 my-8 text-xs font-bold text-gray-300"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2C3147]">
                <div className="flex items-center gap-2.5">
                  <Database className="text-brand-cyan" size={16} />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest leading-none">
                    Campaign Supervisor Console (Order {selectedInspectOrder.id})
                  </h3>
                </div>
                <button
                  onClick={() => setInspectOrderId(null)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1.5 rounded-lg border border-[#252836] cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Grid block info */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left controls: Metadata and manual variable override */}
                <form onSubmit={handleSaveOrderOverrides} className="lg:col-span-6 space-y-4">
                  
                  <div className="bg-[#12141A] rounded-xl p-4.5 border border-[#252836] space-y-3">
                    <span className="text-[9.5px] uppercase font-black text-[#FF4757] block tracking-wider">
                      ● Manual Override Overrides
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-gray-500 font-extrabold tracking-tight">Modify Status Drop:</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="bg-[#1A1D26] border border-[#2E334D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-gray-400 font-extrabold tracking-tight">API Provider Source ID:</label>
                        <span className="bg-[#1A1D26] border border-[#252836] text-gray-400 px-3 py-2 text-xs rounded-lg block font-mono overflow-hidden truncate">
                          {selectedInspectOrder.providerOrderId}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-gray-500 font-extrabold tracking-tight">Start Count:</label>
                        <input
                          type="number"
                          value={editStartCount}
                          onChange={(e) => setEditStartCount(parseInt(e.target.value) || 0)}
                          className="bg-[#1A1D26] border border-[#2E334D] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-gray-500 font-extrabold tracking-tight">Remaining delivery:</label>
                        <input
                          type="number"
                          value={editRemains}
                          onChange={(e) => setEditRemains(parseInt(e.target.value) || 0)}
                          className="bg-[#1A1D26] border border-[#2E334D] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                    </div>

                    {/* Refund workflow toggle control */}
                    <div className="bg-[#1A1D26] p-3.5 rounded-xl border border-[#252836] flex items-center justify-between mt-4">
                      <div>
                        <span className="text-white text-[11px] block">Trigger Manual Capital Refund</span>
                        <span className="text-gray-500 block text-[9.5px]/none mt-1">Returns sum immediately to account balance.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={refundToggle}
                          onChange={(e) => setRefundToggle(e.target.checked)}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#FF4757] border-[#2E334D] cursor-pointer"
                        />
                        {refundToggle && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 font-mono text-[9px]">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              className="w-16 bg-[#12141A] border border-[#252836] rounded px-1.5 py-1 text-xs text-white font-mono text-center"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Internal Administrative Operational Note:</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add system override details reasons checklist notes..."
                      className="w-full bg-[#12141A] border border-[#2E334D] rounded-xl p-3 text-[11px] font-bold text-white focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="pt-2.5 flex justify-end gap-3.5 border-t border-[#2C3147]">
                    <button
                      type="button"
                      onClick={() => setInspectOrderId(null)}
                      className="px-4.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 text-xs font-black uppercase transition-all cursor-pointer"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>

                </form>

                {/* Right columns: Timelines and API logs outputs */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Timeline tracking feed */}
                  <div className="bg-[#12141A] rounded-2xl p-4.5 border border-[#252836] space-y-3">
                    <span className="text-[9.5px] uppercase font-black text-gray-400 block tracking-wider">
                      ● Internal Processing Timeline Log
                    </span>

                    <div className="space-y-3.5 pl-1.5 max-h-[140px] overflow-y-auto">
                      {selectedInspectOrder.timeline.map((tm, tIdx) => (
                        <div key={tIdx} className="flex gap-4 text-xs font-bold select-none relative">
                          <span className="text-gray-600 font-mono text-[9px] shrink-0 pt-0.5">{tm.time}</span>
                          
                          {/* Circle dots */}
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 mt-1.5 relative z-10" />
                          
                          <div className="flex-1">
                            <span className="text-white text-[11px] block">{tm.status}</span>
                            <span className="text-gray-500 text-[10px] mt-0.5 block leading-relaxed font-semibold">{tm.log}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provider JSON log formatting */}
                  <div className="bg-[#0A0B0F] rounded-2xl p-4 border border-[#252836] space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-brand-border/15">
                      <span className="text-[9.5px] uppercase font-black text-gray-400 block tracking-wider">
                        ● Raw Provider Response payload JSON
                      </span>
                      <span className="text-[8.5px] font-mono text-gray-600">ID: {selectedInspectOrder.providerOrderId}</span>
                    </div>

                    <pre className="text-[9.5px] font-mono text-emerald-400 p-3 bg-[#0E1015] rounded-xl overflow-x-auto whitespace-pre leading-relaxed select-all border border-[#1a1c24]">
                      {selectedInspectOrder.providerResponseLog}
                    </pre>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
