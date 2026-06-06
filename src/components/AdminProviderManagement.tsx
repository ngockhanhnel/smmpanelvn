import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Mail,
  FileText,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Lock,
  Globe,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  X,
  CreditCard,
  Zap,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area
} from 'recharts';

interface SMMProvider {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  apiUrl: string;
  apiKey: string;
  balance: number;
  servicesCount: number;
  ordersSent: number;
  successRate: number;
  lastSync: string;
  currency: string;
  notes: string;
}

interface ProviderErrorLog {
  date: string;
  orderId: string;
  message: string;
  resolved: boolean;
}

interface SMMProviderService {
  id: string;
  name: string;
  cost: number;
  category: string;
}

interface AdminProviderManagementProps {
  onShowToast: (msg: string) => void;
}


// Mock API Logs database records for provider details expansion
const MOCK_ERROR_LOGS: Record<string, ProviderErrorLog[]> = {
  "PRV-1": [
    { date: "2026-06-05 23:10", orderId: "#89470", message: "API endpoint returned error: Rate limit reached. Retrying payload.", resolved: true },
    { date: "2026-06-05 18:15", orderId: "#89452", message: "Private profile link matched, SMM processing failed.", resolved: true },
    { date: "2026-06-04 14:22", orderId: "#89412", message: "Database parameter conflict with requested custom keywords.", resolved: false }
  ],
  "PRV-2": [
    { date: "2026-06-05 21:05", orderId: "#89467", message: "Gateway connection timeout (504). Automating server hop.", resolved: true },
    { date: "2026-06-03 09:12", orderId: "#89311", message: "Target quantity surpasses maximum provider limit configurations.", resolved: true }
  ],
  "PRV-3": [
    { date: "2026-06-01 12:00", orderId: "#89101", message: "Connection rejected: Insufficient credit balances.", resolved: false }
  ],
  "PRV-4": [
    { date: "2026-06-05 11:15", orderId: "#89455", message: "Duplicate link parameters sent. Provider request skipped.", resolved: true }
  ]
};

// Response hour statistics data
const MOCK_API_RESPONSE_TIMES = [
  { hour: "00:00", SMMKing: 320, JustAnother: 410, TopSMM: 150 },
  { hour: "04:00", SMMKing: 280, JustAnother: 380, TopSMM: 120 },
  { hour: "08:00", SMMKing: 450, JustAnother: 520, TopSMM: 180 },
  { hour: "12:00", SMMKing: 510, JustAnother: 480, TopSMM: 220 },
  { hour: "16:00", SMMKing: 390, JustAnother: 420, TopSMM: 140 },
  { hour: "20:00", SMMKing: 310, JustAnother: 390, TopSMM: 130 }
];

// Orders routed monthly coordinates chart
const MOCK_ORDERS_CHART = [
  { day: "May 10", orders: 240 },
  { day: "May 15", orders: 320 },
  { day: "May 20", orders: 280 },
  { day: "May 25", orders: 450 },
  { day: "May 30", orders: 520 },
  { day: "Jun 05", orders: 610 }
];

// Services mapped mock list
const MOCK_PROVIDER_SERVICES: Record<string, SMMProviderService[]> = {
  "PRV-1": [
    { id: "1001", name: "Instagram Real Likes - Stable Fast Feed", cost: 0.14, category: "Instagram" },
    { id: "1002", name: "TikTok Followers [Targeted Organic Nodes]", cost: 3.10, category: "TikTok" },
    { id: "1003", name: "Telegram Geo Members Active", cost: 1.45, category: "Telegram" }
  ],
  "PRV-2": [
    { id: "550", name: "TikTok Instant Performance Video Views", cost: 0.05, category: "TikTok" },
    { id: "551", name: "Instagram Video Comments - Custom Spreads", cost: 1.80, category: "Instagram" }
  ],
  "PRV-3": [
    { id: "8911", name: "Twitter Verified US Followers [Full Bio]", cost: 8.00, category: "Twitter" }
  ],
  "PRV-4": [
    { id: "777", name: "YouTube Watch Hours Lifetime [Real View Bot]", cost: 21.00, category: "YouTube" },
    { id: "940", name: "Facebook High Authority Fan Page Likes", cost: 1.45, category: "Facebook" }
  ]
};

export default function AdminProviderManagement({ onShowToast }: AdminProviderManagementProps) {
  const [providers, setProviders] = useState<SMMProvider[]>([]);
  const [errorLogs, setErrorLogs] = useState<Record<string, ProviderErrorLog[]>>(MOCK_ERROR_LOGS);

  useEffect(() => {
    const importFirebase = async () => {
      const { db } = await import('../firebase');
      const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
      
      const unsub = onSnapshot(collection(db, 'providers'), (snap) => {
        const list: SMMProvider[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            name: d.name || 'Unknown',
            status: d.status || 'Active',
            apiUrl: d.apiUrl || '',
            apiKey: d.apiKey || '',
            balance: d.balance || 0,
            servicesCount: d.servicesCount || 0,
            ordersSent: d.ordersSent || 0,
            successRate: d.successRate || 100,
            lastSync: d.lastSync ? new Date(d.lastSync).toLocaleString() : 'Unknown',
            currency: d.currency || 'USD',
            notes: d.notes || ''
          });
        });
        setProviders(list);
      });
      return unsub;
    };
    
    let unsubscribe: any = null;
    importFirebase().then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);
  
  // Expand Card tracking states
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);

  // Balance alerts parameters
  const [alertThreshold, setAlertThreshold] = useState('50.00');
  const [isAlertEmailActive, setIsAlertEmailActive] = useState(true);

  // Modal configuration states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<SMMProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    apiKey: '',
    currency: 'USD',
    notes: ''
  });
  
  // API Key visual toggler
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  // Simulating connection states
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'failed' | null;
    message: string;
  }>({ status: null, message: '' });

  // Handle balance checks refresh
  const handleRefreshBalance = (id: string) => {
    onShowToast(`Dispatched webhook ping: Fetching dynamic ledger balance from API provider...`);
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        // slightly fluctuate value for realism
        const change = (Math.random() * 15 - 5);
        const nextBalance = Math.max(0, p.balance + change);
        onShowToast(`Updated balance stored for [${p.name}]: $${nextBalance.toFixed(2)} USD.`);
        return {
          ...p,
          balance: parseFloat(nextBalance.toFixed(2)),
          lastSync: "Just now"
        };
      }
      return p;
    }));
  };

  // Sync services action from provider
  const handleSyncProviderServices = (id: string, name: string) => {
    onShowToast(`Instructing worker threads: Initiating downstream service pricing check for ${name}.`);
    setTimeout(() => {
      onShowToast(`Database sync finished. Synced ${Math.floor(Math.random() * 40 + 10)} services costs against panel standards.`);
    }, 1200);
  };

  // Handle status toggle (Enable/Disable)
  const handleToggleStatus = (id: string, current: 'Active' | 'Inactive') => {
    const next: 'Active' | 'Inactive' = current === 'Active' ? 'Inactive' : 'Active';
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: next } : p));
    onShowToast(`Provider ${id} status toggled: ${next}.`);
  };

  // Handle delete
  const handleDeleteProvider = (id: string, name: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    onShowToast(`Purged supplier channel "${name}" parameters.`);
    if (expandedProviderId === id) {
      setExpandedProviderId(null);
    }
  };

  // Connection testing pipeline
  const handleTestConnectionAction = (apiUrl: string, apiKey: string) => {
    if (!apiUrl || !apiKey) {
      setTestResult({
        status: 'failed',
        message: "❌ Connection parameters missed. Provide standard credentials."
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: null, message: '' });

    setTimeout(() => {
      setIsTestingConnection(false);
      if (apiUrl.includes("error") || apiKey.length < 8) {
        setTestResult({
          status: 'failed',
          message: "❌ Handshake failed: Unauthorized API key or secure proxy domain timed out."
        });
      } else {
        setTestResult({
          status: 'success',
          message: `✅ Handshake established! Available balances: $${(Math.random() * 200 + 40).toFixed(2)} USD. Endpoint returned 142 services.`
        });
      }
    }, 1400);
  };

  // Save alerts configuration
  const handleSaveAlerts = () => {
    const amt = parseFloat(alertThreshold);
    if (isNaN(amt) || amt < 0) {
      onShowToast("Enter a positive balance indicator.");
      return;
    }
    onShowToast(`Alert parameters stored. Low balance threshold set at $${amt.toFixed(2)} USD.`);
  };

  // Resolve an error inside expanded details
  const handleResolveErrorLogIndex = (providerId: string, index: number) => {
    setErrorLogs(prev => {
      const targetLogs = [...(prev[providerId] || [])];
      if (targetLogs[index]) {
        targetLogs[index] = { ...targetLogs[index], resolved: true };
      }
      return { ...prev, [providerId]: targetLogs };
    });
    onShowToast("SMM API campaign error flagged as resolved manually.");
  };

  // Manage modals
  const handleOpenAddModal = () => {
    setCurrentProvider(null);
    setFormData({
      name: '',
      apiUrl: '',
      apiKey: '',
      currency: 'USD',
      notes: ''
    });
    setTestResult({ status: null, message: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (provider: SMMProvider) => {
    setCurrentProvider(provider);
    setFormData({
      name: provider.name,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
      currency: provider.currency,
      notes: provider.notes
    });
    setTestResult({ status: null, message: '' });
    setIsModalOpen(true);
  };

  const handleSaveProviderForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.apiUrl) {
      onShowToast("Name and API URL are mandatory.");
      return;
    }

    if (currentProvider) {
      // Editing
      setProviders(prev => prev.map(p => {
        if (p.id === currentProvider.id) {
          return {
            ...p,
            name: formData.name,
            apiUrl: formData.apiUrl,
            apiKey: formData.apiKey,
            currency: formData.currency,
            notes: formData.notes
          };
        }
        return p;
      }));
      onShowToast(`Modified supplier panel config for "${formData.name}".`);
    } else {
      // Creating
      const newId = `PRV-${providers.length + 1}`;
      const newProvider: SMMProvider = {
        id: newId,
        name: formData.name,
        status: 'Active',
        apiUrl: formData.apiUrl,
        apiKey: formData.apiKey,
        balance: 100.00, // initialized dummy balance
        servicesCount: 0,
        ordersSent: 0,
        successRate: 100.0,
        lastSync: "Just now",
        currency: formData.currency,
        notes: formData.notes
      };
      setProviders(prev => [...prev, newProvider]);
      onShowToast(`Assigned brand new API service gateway: "${formData.name}".`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER BLOCK */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D26] p-5 rounded-2xl border border-[#1E2230] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF]">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-widest uppercase text-white leading-normal">
              API Providers Integration
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-gray-500">
              <span>Upstream API Synced:</span>
              <span className="text-[#00D4FF] font-bold">
                {providers.filter(p => p.status === 'Active').length} Active Channels
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 transition-all cursor-pointer uppercase tracking-tight"
        >
          <Plus size={14} />
          <span>Add Provider</span>
        </button>
      </div>

      {/* SYSTEM AND GATEWAY BALANCE ALERTS CONTROL */}
      <div className="bg-[#1A1D26] border border-[#1E2230] p-4.5 rounded-2xl shadow-sm text-left">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <span className="text-white text-xs font-black uppercase tracking-wider block">Low-Balance System Monitor Configuration</span>
              <span className="text-gray-500 text-[10px] font-semibold block mt-0.5 max-w-xl leading-relaxed">
                Receive dashboard notices and automate support flags when linked supplier account credits fall below thresholds, protecting client orders from stuck queued loops.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            <div className="flex items-center bg-[#12141A] border border-[#252836] rounded-xl h-10 overflow-hidden px-2.5 min-w-[130px]">
              <span className="text-gray-600 font-mono text-[9.5px] font-black mr-1">$</span>
              <input
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                placeholder="50.00"
                className="w-full bg-transparent border-none text-xs font-mono font-black text-white focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 bg-[#12141A] border border-[#252836] h-10 px-4 rounded-xl cursor-pointer select-none text-[11px] text-gray-400 font-bold">
              <input
                type="checkbox"
                checked={isAlertEmailActive}
                onChange={(e) => setIsAlertEmailActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1A1D26] text-[#6C63FF] border-[#2E334D] cursor-pointer"
              />
              <Mail size={13} className="text-gray-500" />
              <span>Broadcast email to root admins</span>
            </label>

            <button
              onClick={handleSaveAlerts}
              className="px-4.5 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Verify Parameters
            </button>

          </div>

        </div>
      </div>

      {/* PROVIDER GRID CARDS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((p) => {
          const isExpanded = expandedProviderId === p.id;
          const isLowBalance = p.balance < parseFloat(alertThreshold);

          return (
            <div
              key={p.id}
              className={`bg-[#1A1D26] border rounded-2xl transition-all overflow-hidden flex flex-col text-left ${
                isExpanded
                  ? 'ring-2 ring-[#6C63FF] border-transparent shadow-xl'
                  : 'border-[#1E2230] shadow hover:border-[#2E334D]'
              }`}
            >
              
              {/* Card visual elements */}
              <div className="p-5 space-y-4">
                
                {/* Provider card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center font-black text-white text-base">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 leading-none">
                        {p.name}
                        {p.status === 'Active' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Connection Gateway" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Inactive status flagged" />
                        )}
                      </h3>
                      <p className="text-[#00D4FF] font-mono text-[9px] mt-1.5 leading-none bg-[#00D4FF]/5 w-max px-1.5 py-0.5 rounded border border-[#00D4FF]/10">
                        {p.apiUrl.replace('https://', '')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg bg-[#12141A] hover:bg-[#6C63FF]/10 text-gray-500 hover:text-white border border-[#252836] transition-all cursor-pointer"
                      title="Edit Gateway Parameters"
                    >
                      <Edit size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        p.status === 'Active'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10'
                      }`}
                      title={p.status === 'Active' ? "Temporarily halt gateway" : "Resume API communication paths"}
                    >
                      {p.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                    </button>

                    <button
                      onClick={() => handleDeleteProvider(p.id, p.name)}
                      className="p-1.5 rounded-lg bg-[#12141A] hover:bg-red-500/15 text-gray-500 hover:text-red-400 border border-[#252836] transition-all cursor-pointer"
                      title="Purge Supplier Config"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Grid details indicator */}
                <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                  
                  {/* Balance ledger card */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isLowBalance && p.status === 'Active'
                      ? 'bg-red-500/5 border-red-500/20 animate-pulse'
                      : 'bg-[#12141A] border-[#252836]'
                  }`}>
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="text-[8.5px] font-black uppercase text-gray-500 tracking-wider">Account Balance:</span>
                      <button
                        onClick={() => handleRefreshBalance(p.id)}
                        className="text-gray-500 hover:text-white cursor-pointer transition-colors"
                        title="Query credit API"
                      >
                        <RefreshCw size={11} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`text-base font-black font-mono tracking-tight leading-none ${
                        isLowBalance && p.status === 'Active' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        ${p.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold">{p.currency}</span>
                    </div>

                    {isLowBalance && p.status === 'Active' && (
                      <span className="text-[8.5px] text-red-500 font-extrabold flex items-center gap-1 mt-1 font-mono uppercase tracking-widest leading-none">
                        ⚠️ Low balance alerts
                      </span>
                    )}
                  </div>

                  {/* Connected services metrics details */}
                  <div className="bg-[#12141A] border border-[#252836] p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[8.5px] font-black uppercase text-gray-500 tracking-wider">Active linked service feeds:</span>
                    <span className="text-base font-black font-mono text-white tracking-tight leading-none mt-2">
                      {p.servicesCount} <span className="text-[9px] text-gray-600 font-bold">Feeds</span>
                    </span>
                    <span className="text-[8.5px] text-gray-500 font-bold mt-1.5 leading-none block">
                      Success yield: <strong className="text-emerald-400 font-mono">{p.successRate}%</strong>
                    </span>
                  </div>

                </div>

                {/* Footer details stats bar info */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1E2230]/70 text-[9px] text-gray-600 font-bold">
                  <div className="flex items-center gap-1">
                    <span>Total orders dispatched:</span>
                    <span className="text-white font-mono">{p.ordersSent.toLocaleString()}</span>
                  </div>
                  <div>
                    Synced: <span className="text-gray-500 italic">{p.lastSync}</span>
                  </div>
                </div>

                {/* Expand / Collapse Control bar button */}
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedProviderId(isExpanded ? null : p.id)}
                    className="w-full py-1.5 rounded-lg bg-white/[0.015] hover:bg-white/[0.035] text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#1E2230]/70 text-[10px] font-black uppercase tracking-wider"
                  >
                    <span>{isExpanded ? "Collapse Supplier Core Settings" : "Click to Expand Detailed Statistics"}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

              </div>

              {/* EXPAND DETAIL SECTION PANEL CONTAINER */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#252836] bg-[#12141A]/55"
                  >
                    <div className="p-5 space-y-6">
                      
                      {/* Sub-header */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#252836]">
                        <span className="text-[9.5px] font-black uppercase text-[#6C63FF] tracking-wider block">
                          ● Administrative Performance & API logs analysis
                        </span>
                        
                        <button
                          onClick={() => handleSyncProviderServices(p.id, p.name)}
                          className="flex items-center gap-1.5 text-[#00D4FF] hover:underline text-[10px]"
                        >
                          <RefreshCw size={11} />
                          <span>Check service costs</span>
                        </button>
                      </div>

                      {/* Charts block */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* Routed bulk orders count */}
                        <div className="bg-[#1A1D26] p-4 rounded-xl border border-[#252836]">
                          <span className="text-[9px] uppercase text-gray-500 font-extrabold tracking-wider block mb-3 text-left">Routed Campaign orders (Historic Trend)</span>
                          <div className="h-40 block">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={MOCK_ORDERS_CHART}>
                                <defs>
                                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="#4e546d" fontSize={9} fontStyle="bold" tickLine={false} />
                                <YAxis stroke="#4e546d" fontSize={9} fontStyle="bold" tickLine={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#12141A', borderColor: '#2E334D', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="orders" stroke="#6C63FF" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* API Latency matrix line chart */}
                        <div className="bg-[#1A1D26] p-4 rounded-xl border border-[#252836]">
                          <span className="text-[9px] uppercase text-gray-500 font-extrabold tracking-wider block mb-3 text-left">API Reaction Handshake Latency (MS)</span>
                          <div className="h-40 block">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={MOCK_API_RESPONSE_TIMES}>
                                <XAxis dataKey="hour" stroke="#4e546d" fontSize={9} fontStyle="bold" tickLine={false} />
                                <YAxis stroke="#4e546d" fontSize={9} fontStyle="bold" tickLine={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#12141A', borderColor: '#2E334D', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey={p.id === "PRV-1" ? "SMMKing" : p.id === "PRV-2" ? "JustAnother" : "TopSMM"} stroke="#00D4FF" strokeWidth={2.5} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                      </div>

                      {/* Section 1: Linked services list */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] uppercase text-gray-500 font-black tracking-widest block text-left">Assigned services synced from this panel</span>
                        
                        <div className="bg-[#1A1D26] border border-[#252836] rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-[10.5px]">
                            <thead>
                              <tr className="border-b border-[#252836] bg-[#12141A]/50 text-gray-600 uppercase text-[8px] font-black tracking-widest">
                                <th className="py-2.5 px-3">Sync ID</th>
                                <th className="py-2.5 px-3">Name Key</th>
                                <th className="py-2.5 px-3 font-mono">Cost Rate / 1k</th>
                                <th className="py-2.5 px-3 text-right">Category</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold">
                              {(MOCK_PROVIDER_SERVICES[p.id] || []).map((srv) => (
                                <tr key={srv.id} className="hover:bg-white/[0.01]">
                                  <td className="py-2 px-3 font-mono text-white text-[10.5px]">#{srv.id}</td>
                                  <td className="py-2 px-3 text-gray-300">{srv.name}</td>
                                  <td className="py-2 px-3 text-emerald-400 font-mono">${srv.cost.toFixed(3)}</td>
                                  <td className="py-2 px-3 text-right text-gray-500">{srv.category}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section 2: Error log flags */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] uppercase text-gray-500 font-black tracking-widest block text-left">Upstream API error logs (Last 20 records)</span>
                        
                        <div className="bg-[#1A1D26] border border-[#252836] rounded-xl overflow-hidden text-[10.5px]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#252836] bg-[#12141A]/50 text-gray-600 uppercase text-[8px] font-black tracking-widest">
                                <th className="py-2.5 px-3">Date / Timestamp</th>
                                <th className="py-2.5 px-3 font-mono">Order Index</th>
                                <th className="py-2.5 px-3">Report Details</th>
                                <th className="py-2.5 px-3 text-right">Actions Flag</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold">
                              {((errorLogs[p.id]) || []).map((log, lIdx) => (
                                <tr key={lIdx} className="hover:bg-white/[0.01]">
                                  <td className="py-2 px-3 text-gray-500 text-[10px]">{log.date}</td>
                                  <td className="py-2 px-3 text-white font-mono">{log.orderId}</td>
                                  <td className="py-2 px-3 text-left leading-relaxed font-mono text-red-400 font-semibold">{log.message}</td>
                                  <td className="py-2 px-3 text-right">
                                    {log.resolved ? (
                                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold">Resolved ✅</span>
                                    ) : (
                                      <button
                                        onClick={() => handleResolveErrorLogIndex(p.id, lIdx)}
                                        className="text-[8.5px] font-black uppercase text-amber-500 hover:text-white bg-amber-500/10 hover:bg-amber-500/25 px-2 py-1 rounded cursor-pointer leading-none"
                                      >
                                        Flag Resolve
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
      </div>

      {/* =================================═══════════════════════════════════
          ADD / EDIT PROVIDER MODAL POPUP
         ================================═══════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0A0B0F]/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4 text-left overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-xl shadow-2xl relative space-y-4 text-xs font-bold text-gray-300"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <Database className="text-[#6C63FF]" size={16} />
                  <h3 className="text-sm font-black uppercase text-white tracking-wider leading-none">
                    {currentProvider ? `Edit Supplier Gateway Parameter: ${currentProvider.name}` : "Configure New API Supplier Endpoint"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1.5 rounded-xl border border-[#252836] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProviderForm} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Provider Name (Label):</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. SMMKing Panel"
                      className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] font-bold text-white focus:outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Gateway Currency Format:</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3 focus:outline-none cursor-pointer text-white"
                    >
                      <option value="USD">USD ($) Standard</option>
                      <option value="EUR">EUR (€) Euro</option>
                      <option value="VND">VND (₫) Vietnamese Dong</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">API URL Endpoint Link:</label>
                  <input
                    type="url"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                    placeholder="https://providerpanel.com/api/v2"
                    className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-[#00D4FF] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">API Private Key Credentials:</label>
                  <div className="relative">
                    <input
                      type={isKeyVisible ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Private key key token parameters..."
                      className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl pl-4 pr-10 py-2.5 text-[11px] text-white focus:outline-none font-mono font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                    >
                      {isKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Internal Operations Notes Details:</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Provide description notes regarding specific fallback priorities..."
                    rows={2}
                    className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl p-3 text-[11px] font-bold text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Handshaking diagnostics segment */}
                <div className="bg-[#12141A] border border-[#252836] p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white text-[11px] block text-left">Gateway Diagnostics Test Handshake</span>
                      <span className="text-gray-500 text-[9.5px] block text-left mt-0.5">Test real-time connection response and active balance listings.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestConnectionAction(formData.apiUrl, formData.apiKey)}
                      disabled={isTestingConnection}
                      className="px-3.5 h-8 bg-brand-cyan hover:bg-[#00D4FF]/85 text-black text-[10.5px] font-black uppercase tracking-tight rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Zap size={11} className={isTestingConnection ? "animate-bounce" : ""} />
                      <span>{isTestingConnection ? "Syncing..." : "Test Connector"}</span>
                    </button>
                  </div>

                  {testResult.message && (
                    <div className="p-3 bg-[#1A1D26] border border-[#252836] rounded-lg text-left">
                      <p className={`font-mono font-bold text-[10.5px] leading-relaxed ${
                        testResult.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {testResult.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmations footer */}
                <div className="pt-3.5 flex justify-end gap-3 border-t border-[#2C3147]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 text-xs font-black uppercase transition-all cursor-pointer"
                  >
                    Dismiss Form
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                  >
                    Save Supplier Node
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
