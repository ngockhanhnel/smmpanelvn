import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Undo2,
  Settings2,
  Copy,
  UserCheck,
  PlusCircle,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Briefcase,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Transaction {
  id: string;
  user: string;
  method: string;
  methodIcon: string;
  amount: number;
  fee: number;
  net: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded' | 'Awaiting';
  date: string;
  note?: string;
}

interface Gateway {
  id: string;
  name: string;
  logo: string;
  status: 'Active' | 'Inactive';
  fee: number;
  minDeposit: number;
  maxDeposit: number;
  currency: string;
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  testMode: boolean;
}

interface ManualFundLog {
  id: string;
  user: string;
  action: 'Add' | 'Deduct';
  amount: number;
  method: 'Bank Transfer' | 'Cash' | 'Promo' | 'Other';
  txnId: string;
  adminNote: string;
  date: string;
  adminUser: string;
}

interface AdminPaymentManagementProps {
  onShowToast: (msg: string) => void;
}

export default function AdminPaymentManagement({ onShowToast }: AdminPaymentManagementProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'gateways' | 'manual' | 'reports'>('transactions');
  
  // ==========================================
  // TAB 1 STATES (TRANSACTIONS)
  // ==========================================
  const [searchUser, setSearchUser] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Selected Filter States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    import('../firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot, query, orderBy }) => {
        const qTx = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(qTx, (snap) => {
          const list: Transaction[] = [];
          snap.forEach(doc => {
            const d = doc.data();
            list.push({
              id: doc.id,
              user: d.userId || 'Unknown',
              method: d.method || 'Unknown',
              methodIcon: '💵',
              amount: d.amount || 0,
              fee: d.fee || 0,
              net: (d.amount || 0) + (d.fee || 0),
              status: d.status === 'completed' ? 'Completed' : d.status === 'pending' ? 'Pending' : d.status === 'refunded' ? 'Refunded' : 'Failed',
              date: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'Unknown',
              note: d.note || ''
            });
          });
          setTransactions(list);
        });
        return () => unsub();
      });
    });
  }, []);

  // Summaries Calculations
  const statsOverview = useMemo(() => {
    const todayStr = '2026-06-05';
    let todayTot = 0;
    let monthTot = 0;
    let totalTot = 0;
    let refundTot = 0;

    transactions.forEach(t => {
      if (t.status === 'Completed') {
        totalTot += t.amount;
        if (t.date.startsWith(todayStr)) {
          todayTot += t.amount;
        }
        monthTot += t.amount; // simplification
      } else if (t.status === 'Refunded') {
        refundTot += t.amount;
      }
    });

    return {
      today: todayTot,
      month: monthTot + 12450, // base constant + dynamic
      total: totalTot + 89450, // base constant + dynamic
      refunded: refundTot + 1200
    };
  }, [transactions]);

  const handleUpdateStatus = (id: string, newStatus: Transaction['status']) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        onShowToast(`Transaction ${id} status updated to ${newStatus}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
    if (selectedTxn && selectedTxn.id === id) {
      setSelectedTxn(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchUser = t.user.toLowerCase().includes(searchUser.toLowerCase()) || t.id.toLowerCase().includes(searchUser.toLowerCase());
      const matchMethod = filterMethod === 'All' || t.method.includes(filterMethod);
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const amountVal = t.amount;
      const minVal = filterMinAmount ? parseFloat(filterMinAmount) : 0;
      const maxVal = filterMaxAmount ? parseFloat(filterMaxAmount) : Infinity;
      const matchAmount = amountVal >= minVal && amountVal <= maxVal;

      return matchUser && matchMethod && matchStatus && matchAmount;
    });
  }, [transactions, searchUser, filterMethod, filterStatus, filterMinAmount, filterMaxAmount]);


  // ==========================================
  // TAB 2 STATES (GATEWAYS)
  // ==========================================
  const [gateways, setGateways] = useState<Gateway[]>([
    { id: 'GW-01', name: 'Stripe API checkout', logo: '💳', status: 'Active', fee: 2.9, minDeposit: 10, maxDeposit: 5000, currency: 'USD', apiKey: 'pk_live_51MszB4e3s8wL1A...', secretKey: 'sk_live_51MszB4e...', webhookUrl: 'https://api.prosmm.panel/v1/webhooks/stripe-secure', testMode: false },
    { id: 'GW-02', name: 'PayPal Direct Gateway', logo: '🅿️', status: 'Active', fee: 4.4, minDeposit: 5, maxDeposit: 2000, currency: 'USD', apiKey: 'client_id_99x811a2f_live', secretKey: 'secret_key_88z...', webhookUrl: 'https://api.prosmm.panel/v1/webhooks/paypal', testMode: false },
    { id: 'GW-03', name: 'Coinbase Commerce API', logo: '🪙', status: 'Active', fee: 1.0, minDeposit: 20, maxDeposit: 10000, currency: 'USDT', apiKey: 'cb_comm_882a1_key', secretKey: 'cb_secret_88...', webhookUrl: 'https://api.prosmm.panel/v1/webhooks/coinbase', testMode: true },
    { id: 'GW-04', name: 'Perfect Money Reseller', logo: '💼', status: 'Active', fee: 2.0, minDeposit: 15, maxDeposit: 1500, currency: 'USD', apiKey: 'pm_member_id_812', secretKey: 'pass_pm_xxx', webhookUrl: 'https://api.prosmm.panel/v1/webhooks/perfectmoney', testMode: false },
    { id: 'GW-05', name: 'Manual Vietcombank Transfer', logo: '🏦', status: 'Active', fee: 0.0, minDeposit: 10, maxDeposit: 100000, currency: 'VND', apiKey: 'VCB_992147101', secretKey: 'HANOI_OFFICE', webhookUrl: 'https://api.prosmm.panel/v1/webhooks/manual-vcb', testMode: false }
  ]);

  const [configuringGate, setConfiguringGate] = useState<Gateway | null>(null);

  const handleToggleGateway = (id: string) => {
    setGateways(prev => prev.map(gw => {
      if (gw.id === id) {
        const nextStatus = gw.status === 'Active' ? 'Inactive' : 'Active';
        onShowToast(`Gateway ${gw.name} turned ${nextStatus}`);
        return { ...gw, status: nextStatus };
      }
      return gw;
    }));
  };

  const handleSaveGatewayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringGate) return;
    setGateways(prev => prev.map(g => g.id === configuringGate.id ? configuringGate : g));
    onShowToast(`Configuration details for ${configuringGate.name} saved.`);
    setConfiguringGate(null);
  };

  const handleGenerateAndCopyWebhook = () => {
    if (!configuringGate) return;
    const cleanUrl = `https://api.prosmm.panel/v1/webhooks/${configuringGate.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    setConfiguringGate(prev => prev ? { ...prev, webhookUrl: cleanUrl } : null);
    navigator.clipboard.writeText(cleanUrl);
    onShowToast('New secure Webhook endpoint generated & copied to clipboard.');
  };


  // ==========================================
  // TAB 3 STATES (MANUAL FUNDS)
  // ==========================================
  const [manualUserSearch, setManualUserSearch] = useState('');
  const [manualAction, setManualAction] = useState<'Add' | 'Deduct'>('Add');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState<'Bank Transfer' | 'Cash' | 'Promo' | 'Other'>('Bank Transfer');
  const [manualTxnId, setManualTxnId] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Suggested users list
  const suggestedManualUsers = ['global_resell', 'vietnam_agency', 'agent_supreme', 'hyperScale_co', 'nasdaq_hype', 'mick_t_views', 'synergy_smm', 'crypto_influ', 'beta_reseller', 'vietnam_agency'];
  const [selectedManualUser, setSelectedManualUser] = useState('');

  // Manual logs
  const [manualLogs, setManualLogs] = useState<ManualFundLog[]>([
    { id: 'MAN-1089', user: 'global_resell', action: 'Add', amount: 500.00, method: 'Bank Transfer', txnId: 'MAN-VCB-9124', adminNote: 'Approved major wire deposit via desk agent', date: '2026-06-04 15:20', adminUser: 'Root Operator' },
    { id: 'MAN-1088', user: 'agent_supreme', action: 'Add', amount: 50.00, method: 'Promo', txnId: 'PROMO-WINTER-66', adminNote: 'Winter reseller loyalty credits allocation', date: '2026-06-03 13:00', adminUser: 'Finance Admin' },
    { id: 'MAN-1087', user: 'hyperScale_co', action: 'Deduct', amount: 15.00, method: 'Other', txnId: 'REF-REV-09', adminNote: 'Correcting double entry mistake on stripe API webhook', date: '2026-06-01 10:11', adminUser: 'Root Operator' }
  ]);

  const handleAddDeductFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManualUser) {
      onShowToast('Please search and select a target user record first.');
      return;
    }
    const amt = parseFloat(manualAmount);
    if (isNaN(amt) || amt <= 0) {
      onShowToast('Please specify a valid numeric amount to adjust.');
      return;
    }
    if (!manualNote.trim()) {
      onShowToast('Admin confirmation note is strictly required for auditing.');
      return;
    }

    setIsSubmittingManual(true);
    setTimeout(() => {
      const generatedId = `MAN-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      const newLog: ManualFundLog = {
        id: generatedId,
        user: selectedManualUser,
        action: manualAction,
        amount: amt,
        method: manualMethod,
        txnId: manualTxnId || `${generatedId}-MOCK`,
        adminNote: manualNote.trim(),
        date: nowStr,
        adminUser: 'John Devins'
      };

      setManualLogs(prev => [newLog, ...prev]);
      
      // Inject transaction record
      const transId = `TXN-${Math.floor(90000 + Math.random() * 9999)}`;
      const newTxn: Transaction = {
        id: transId,
        user: selectedManualUser,
        method: `Manual: ${manualMethod} (${manualAction === 'Add' ? 'Credit' : 'Debit'})`,
        methodIcon: '🛠️',
        amount: amt,
        fee: 0.00,
        net: amt,
        status: 'Completed',
        date: nowStr,
        note: manualNote
      };
      setTransactions(prev => [newTxn, ...prev]);

      onShowToast(`Successfully ${manualAction === 'Add' ? 'credited' : 'deducted'} $${amt.toFixed(2)} to ${selectedManualUser}. Ledger synced.`);
      setIsSubmittingManual(false);
      setManualAmount('');
      setManualTxnId('');
      setManualNote('');
      setSelectedManualUser('');
    }, 1000);
  };


  // ==========================================
  // TAB 4 STATES (REPORTS)
  // ==========================================
  const [reportTimeframe, setReportTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const sampleBreakdownMethod = [
    { method: 'Stripe Direct (USD)', volume: '$64,120.00', percentage: '45%', fees: '$1,859.40' },
    { method: 'Bank Transfer (VCB / Chase)', volume: '$42,500.00', percentage: '30%', fees: '$0.00' },
    { method: 'Coinbase Crypto Wallet', volume: '$21,430.00', percentage: '15%', fees: '$214.30' },
    { method: 'PayPal Automated Checkout', volume: '$11,400.00', percentage: '8%', fees: '$501.60' },
    { method: 'Perfect Money API', volume: '$2,850.00', percentage: '2%', fees: '$57.00' }
  ];

  // Daily revenue charts
  const revenueChartData = [
    { name: 'Jun 01', Stripe: 2400, Crypto: 1100, Bank: 3500 },
    { name: 'Jun 02', Stripe: 3800, Crypto: 1500, Bank: 4000 },
    { name: 'Jun 03', Stripe: 3100, Crypto: 900, Bank: 5000 },
    { name: 'Jun 04', Stripe: 4200, Crypto: 2200, Bank: 6500 },
    { name: 'Jun 05', Stripe: 5900, Crypto: 3100, Bank: 8000 }
  ];

  const handleExportDataCsv = () => {
    onShowToast('Preparing high-fidelity payment ledger export. CSV download compiling...');
    setTimeout(() => {
      onShowToast('SUCCESS: Export complete. ProSMM_Revenue_Ledger_Q2_2026.csv downloaded.');
    }, 1200);
  };


  return (
    <div className="space-y-6">
      
      {/* 4-COLUMN SUMMARY OVERVIEW CARD GRID */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2.5xl p-5 shadow flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Today Completed Payments</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl lg:text-2xl font-black text-emerald-400">${statsOverview.today.toFixed(2)}</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">UTC Date</span>
            </div>
          </div>
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2.5xl p-5 shadow flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">This Month Gross</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl lg:text-2xl font-black text-white">${statsOverview.month.toLocaleString()}</span>
              <span className="text-[9.5px] font-black text-emerald-500 bg-emerald-500/10 px-1 rounded-sm font-mono">+18%</span>
            </div>
          </div>
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2.5xl p-5 shadow flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">All-Time Net Inflow</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl lg:text-2xl font-black text-[#00D4FF]">${statsOverview.total.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 hover:text-white transition-colors cursor-help">Master Lock</span>
            </div>
          </div>
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2.5xl p-5 shadow flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Refunded Base</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl lg:text-2xl font-black text-purple-400">${statsOverview.refunded.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 font-mono">Disputed rate 0.4%</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION TABS CONTROL */}
      <div className="bg-[#10121a] p-1.5 rounded-2xl flex items-center justify-between border border-[#222533] select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'transactions', label: 'Completed Ledger', icon: CreditCard },
            { id: 'gateways', label: 'Payment Gateways', icon: Settings2 },
            { id: 'manual', label: 'Manual Adjustments', icon: PlusCircle },
            { id: 'reports', label: 'Revenue Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden md:flex items-center gap-3 pr-2.5">
          <span className="text-[10px] font-black text-gray-600 font-mono">FINANCE_CORE_V2</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==========================================
            TAB 1: TRANSACTIONS
           ========================================== */}
        {activeTab === 'transactions' && (
          <motion.div
            key="transactions-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-5"
          >
            {/* Filter controls */}
            <div className="bg-[#1A1D26] border border-[#252836] p-4 rounded-2.5xl flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search User or TXN ID..."
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs py-2.5 pl-9 pr-3 rounded-xl text-white outline-none focus:border-[#6C63FF] placeholder:text-gray-600 transition-all font-mono"
                  />
                </div>

                <div>
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                  >
                    <option value="All">All Payment Systems</option>
                    <option value="Stripe">Stripe Card Core</option>
                    <option value="PayPal">PayPal Checkouts</option>
                    <option value="Coinbase">Coinbase USDT/BTC</option>
                    <option value="Bank">Manual Wire Transfer</option>
                    <option value="Perfect Money">Perfect Money API</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                  >
                    <option value="All">All Status Levels</option>
                    <option value="Completed">Completed Only</option>
                    <option value="Pending">Pending Wire Auditing</option>
                    <option value="Awaiting">Awaiting Gate Clearance</option>
                    <option value="Refunded">Refunded Only</option>
                    <option value="Failed">Failed System Txs</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filterMinAmount}
                    onChange={(e) => setFilterMinAmount(e.target.value)}
                    placeholder="Min $"
                    className="w-1/2 bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF] placeholder:text-gray-600 font-mono"
                  />
                  <input
                    type="number"
                    value={filterMaxAmount}
                    onChange={(e) => setFilterMaxAmount(e.target.value)}
                    placeholder="Max $"
                    className="w-1/2 bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF] placeholder:text-gray-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* TRANSACTIONS MASTER TABLE */}
            <div className="bg-[#1A1D26] border border-[#252836] rounded-3xl overflow-hidden shadow">
              <div className="px-5 py-4 border-b border-[#252836] flex justify-between items-center bg-[#13151f]">
                <h3 className="text-xs font-black uppercase text-white tracking-wider">Filtered Payment Registries</h3>
                <span className="text-[10px] font-black text-brand-cyan">{filteredTransactions.length} items mapped</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#12141A] border-b border-brand-border/40 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-3.5 px-5">TXN ID</th>
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-5">Method</th>
                      <th className="py-3.5 px-5 text-right">Gross Amount</th>
                      <th className="py-3.5 px-5 text-right">Fee Charge</th>
                      <th className="py-3.5 px-5 text-right">Net Value</th>
                      <th className="py-3.5 px-5">Status Badge</th>
                      <th className="py-3.5 px-5">Logged Date</th>
                      <th className="py-3.5 px-5 text-right">Administration Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252836] text-xs font-medium text-gray-200">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-500 text-xs">
                          No transaction records matched the chosen filters. Try resetting.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => {
                        return (
                          <tr key={t.id} className="hover:bg-white/[0.012] transition-colors leading-relaxed">
                            <td className="py-3.5 px-5 font-mono text-[#00D4FF] font-bold">{t.id}</td>
                            <td className="py-3.5 px-5 font-extrabold text-white">@{t.user}</td>
                            <td className="py-3.5 px-5 text-gray-300">
                              <span className="mr-2 text-sm">{t.methodIcon}</span>
                              {t.method}
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-bold text-white">${t.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-5 text-right font-mono text-gray-400">${t.fee.toFixed(2)}</td>
                            <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-400">${t.net.toFixed(2)}</td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md border ${
                                t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                t.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                t.status === 'Refunded' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                t.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                                'bg-blue-500/10 text-blue-400 border-blue-500/15'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-gray-500 text-[10.5px] font-mono">{t.date}</td>
                            <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedTxn(t)}
                                className="text-[10px] font-bold text-gray-400 hover:text-white bg-[#12141A] px-2.5 py-1.5 rounded-lg border border-[#2b2e3e] hover:border-gray-500 transition-all cursor-pointer"
                              >
                                View
                              </button>
                              
                              {t.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(t.id, 'Completed')}
                                    className="text-[10px] font-black text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(t.id, 'Failed')}
                                    className="text-[10px] font-bold text-gray-200 bg-red-650 hover:bg-red-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {t.status === 'Completed' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'Refunded')}
                                  className="text-[10px] font-bold text-[#FF4757] hover:text-white bg-red-500/8 hover:bg-[#FF4757] px-2.5 py-1.5 rounded-lg border border-[#FF4757]/20 hover:border-transparent transition-all cursor-pointer"
                                >
                                  Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            TAB 2: PAYMENT GATEWAYS
           ========================================== */}
        {activeTab === 'gateways' && (
          <motion.div
            key="gateways-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* GATEWAY CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gateways.map((g) => (
                <div
                  key={g.id}
                  className={`bg-[#1A1D26] border rounded-2.5xl p-5 flex flex-col justify-between shadow transition-all duration-300 relative ${
                    g.status === 'Active' ? 'border-[#252836] hover:border-brand-primary/40' : 'border-[#252836]/40 opacity-70'
                  }`}
                >
                  <div>
                    {/* Header: Name, logo, status toggle */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{g.logo}</span>
                        <div className="flex flex-col">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">{g.name}</h4>
                          <span className="text-[10px] text-gray-500 font-mono uppercase">{g.id}</span>
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleGateway(g.id)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                          g.status === 'Active'
                            ? 'bg-emerald-500/15 border-emerald-500/30 justify-end'
                            : 'bg-slate-800 border-slate-700 justify-start'
                        }`}
                      >
                        <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                          g.status === 'Active' ? 'bg-[#00C896]' : 'bg-gray-400'
                        }`} />
                      </button>
                    </div>

                    {/* Specifications */}
                    <table className="w-full mt-4 text-[11px] font-semibold text-slate-400 space-y-2">
                      <tbody>
                        <tr className="flex justify-between">
                          <span>Gateway Fee %</span>
                          <span className="text-white font-bold">{g.fee}% per transaction</span>
                        </tr>
                        <tr className="flex justify-between">
                          <span>Deposit Sizing Limit</span>
                          <span className="text-white font-mono">${g.minDeposit} — ${g.maxDeposit.toLocaleString()}</span>
                        </tr>
                        <tr className="flex justify-between">
                          <span>SaaS Currency</span>
                          <span className="text-brand-cyan uppercase font-mono">{g.currency}</span>
                        </tr>
                        <tr className="flex justify-between">
                          <span>System Environment</span>
                          <span className={`${g.testMode ? 'text-[#FFB800] bg-brand-warning/10 border border-brand-warning/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'} text-[9px] px-1.5 rounded uppercase font-black`}>
                            {g.testMode ? 'Sandbox Mode' : 'Production'}
                          </span>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Configuring buttons */}
                  <button
                    onClick={() => setConfiguringGate(g)}
                    className="w-full mt-5.5 py-2.5 bg-[#12141A] hover:bg-brand-primary hover:text-white border border-[#2b2e3e] hover:border-transparent text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Configure Gateway variables
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==========================================
            TAB 3: MANUAL ADJUSTMENTS
           ========================================== */}
        {activeTab === 'manual' && (
          <motion.div
            key="manual-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Form Side (45%) */}
            <div className="lg:col-span-2 bg-[#1A1D26] border border-[#252836] p-5 rounded-2.5xl flex flex-col justify-between shadow h-fit">
              <form onSubmit={handleAddDeductFunds} className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#252836]">
                  <HelpCircle size={15} className="text-[#00D4FF]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Adjustment Request Form</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target User</label>
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={manualUserSearch}
                      onChange={(e) => {
                        setManualUserSearch(e.target.value);
                        setSelectedManualUser(e.target.value);
                      }}
                      placeholder="Type username (e.g. global_resell)..."
                      className="bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                    {manualUserSearch && (
                      <div className="bg-[#12141A] border border-[#292c3d] rounded-xl p-1.5 max-h-32 overflow-y-auto flex flex-col gap-0.5">
                        {suggestedManualUsers
                          .filter(u => u.toLowerCase().includes(manualUserSearch.toLowerCase()))
                          .map(u => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => {
                                setSelectedManualUser(u);
                                setManualUserSearch(u);
                              }}
                              className={`text-left text-xs p-1.5 rounded hover:bg-white/5 font-semibold font-mono flex justify-between items-center ${
                                selectedManualUser === u ? 'text-[#00D4FF]' : 'text-slate-400'
                              }`}
                            >
                              <span>@{u}</span>
                              {selectedManualUser === u && <Check size={12} />}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  {selectedManualUser && (
                    <span className="text-[10px] text-emerald-400 font-bold block">Selected Partner Account: @{selectedManualUser}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Action Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualAction('Add')}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer uppercase tracking-tight ${
                        manualAction === 'Add'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-[#12141A] border border-transparent text-slate-400'
                      }`}
                    >
                      (+) Credit Funds
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualAction('Deduct')}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer uppercase tracking-tight ${
                        manualAction === 'Deduct'
                          ? 'bg-red-500/10 text-[#FF4757] border border-[#FF4757]/25'
                          : 'bg-[#12141A] border border-transparent text-slate-400'
                      }`}
                    >
                      (-) Deduct Funds
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Amount USD</label>
                    <input
                      type="number"
                      required
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ledger Method</label>
                    <select
                      value={manualMethod}
                      onChange={(e) => setManualMethod(e.target.value as any)}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    >
                      <option value="Bank Transfer">Bank Wire</option>
                      <option value="Cash">Cash office</option>
                      <option value="Promo">Promo allocation</option>
                      <option value="Other">Other adjustment</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reference ID <span className="text-gray-600">(Optional)</span></label>
                  <input
                    type="text"
                    value={manualTxnId}
                    onChange={(e) => setManualTxnId(e.target.value)}
                    placeholder="e.g. wire-9921a"
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auditable Explanation <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    rows={2}
                    placeholder="Specify exact ledger reasons for compliance logs..."
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="w-full py-3 bg-[#6C63FF] hover:bg-[#5a52d3] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingManual ? 'Locking State...' : 'Authorize Adjustment Ledger'}
                </button>
              </form>
            </div>

            {/* List Side (55%) */}
            <div className="lg:col-span-3 bg-[#1A1D26] border border-[#252836] rounded-2.5xl flex flex-col justify-between shadow">
              <div>
                <div className="px-5 py-4 border-b border-[#252836] bg-[#13151f] rounded-t-2.5xl flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Adjustment Ledger Records</h3>
                  <span className="text-[10px] text-gray-500 uppercase font-mono">Verified auditing</span>
                </div>

                <div className="divide-y divide-[#252836] overflow-y-auto max-h-[500px]">
                  {manualLogs.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col gap-2 hover:bg-white/[0.005]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            log.action === 'Add' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {log.action === 'Add' ? 'CREDIT' : 'DEBIT'}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#00D4FF]">{log.id}</span>
                        </div>
                        <span className="text-gray-500 text-[10px] font-mono">{log.date}</span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white">Target Account: <span className="text-yellow-500">@{log.user}</span></span>
                        <span className={`text-sm font-mono font-black ${
                          log.action === 'Add' ? 'text-emerald-400' : 'text-[#FF4757]'
                        }`}>
                          {log.action === 'Add' ? '+' : '-'}${log.amount.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 bg-[#12141A] p-2 rounded-lg border border-[#222533] leading-relaxed">
                        Reason: {log.adminNote}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span>Cleared via: <strong className="text-gray-300">{log.method}</strong></span>
                        <span>Operator ID: <strong className="text-gray-300">{log.adminUser}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            TAB 4: REPORTS
           ========================================== */}
        {activeTab === 'reports' && (
          <motion.div
            key="reports-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Top Toolbar */}
            <div className="bg-[#1A1D26] border border-[#252836] p-4 rounded-2.5xl flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2.5">
                <Calendar size={14} className="text-brand-cyan" />
                <span className="text-xs font-bold text-white">Date Window Selector:</span>
                <div className="flex items-center gap-1.5 bg-[#12141A] border border-[#2b2e3e] p-1.5 rounded-xl">
                  {['daily', 'weekly', 'monthly'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setReportTimeframe(tf as any)}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        reportTimeframe === tf ? 'bg-brand-primary text-white' : 'text-gray-550'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExportDataCsv}
                className="flex items-center gap-1.5 bg-[#12141A] hover:bg-brand-primary text-slate-300 hover:text-white px-3.5 py-2.5 border border-[#2b2e3e] hover:border-transparent text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Compile & Export Reports</span>
              </button>
            </div>

            {/* CHARTS GRAPHICS AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              
              <div className="lg:col-span-7 bg-[#1A1D26] border border-[#252836] p-5 rounded-2.5xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#252836] mb-5">
                  <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <TrendingUp size={14} className="text-brand-cyan animate-pulse" />
                    <span>Inflow Channel Performance Stack</span>
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono">Gross Amount USD</span>
                </div>

                <div className="h-[300px] w-full text-xs font-semibold select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorStripe" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C896" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#222533" vertical={false} />
                      <XAxis dataKey="name" stroke="#4a4f66" />
                      <YAxis stroke="#4a4f66" />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1D26', border: '1px solid #252836', color: '#fff' }} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Area type="monotone" dataKey="Stripe" stroke="#6C63FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStripe)" />
                      <Area type="monotone" dataKey="Crypto" stroke="#00D4FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCrypto)" />
                      <Area type="monotone" dataKey="Bank" stroke="#00C896" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBank)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown Side (30%) */}
              <div className="lg:col-span-3 bg-[#1A1D26] border border-[#252836] p-5 rounded-2.5xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider pb-3 border-b border-[#252836] mb-4">Channel Volume Breakdown</h4>
                  <div className="space-y-3.5">
                    {sampleBreakdownMethod.map((item, index) => (
                      <div key={index} className="flex flex-col gap-1 hover:bg-white/[0.015] p-1 rounded-lg">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-slate-200">{item.method}</span>
                          <span className="text-brand-cyan">{item.volume}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>SaaS Share: {item.percentage}</span>
                          <span>Est Fees: {item.fees}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-[#12141A] h-1.5 rounded-full overflow-hidden mt-1 pb-px">
                          <div
                            className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] h-full rounded-full"
                            style={{ width: item.percentage }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL 1: TRANSACTION DETAILED DRAWER */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] select-none text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D26] border border-[#252836] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-[#00D4FF]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Transaction Ledger Review</h3>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex justify-between bg-[#12141A] p-2.5 rounded-xl border border-[#242738]">
                  <span>System Reference ID</span>
                  <span className="font-mono font-bold text-[#00D4FF]">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Author Client</span>
                  <strong className="text-white">@{selectedTxn.user}</strong>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Payment Gateway Channel</span>
                  <span className="text-white">{selectedTxn.methodIcon} {selectedTxn.method}</span>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Gross Funds Sent</span>
                  <strong className="text-white font-mono">${selectedTxn.amount.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Deducted Gate Fees</span>
                  <span className="text-gray-500 font-mono">${selectedTxn.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Deposited Net Capital</span>
                  <strong className="text-emerald-400 font-mono">${selectedTxn.net.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Current Ledger Status</span>
                  <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded ${
                    selectedTxn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#252836] pb-2">
                  <span>Logged Date</span>
                  <span className="text-gray-400 font-mono">{selectedTxn.date}</span>
                </div>
                {selectedTxn.note && (
                  <div className="flex flex-col gap-1 bg-[#12141A]/60 p-3 rounded-xl border border-[#252836]">
                    <span className="text-[10px] uppercase font-black text-slate-500 font-sans">Audit Internal Notes</span>
                    <p className="text-[11px] leading-relaxed text-slate-350">{selectedTxn.note}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                {selectedTxn.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedTxn.id, 'Completed')}
                      className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-black tracking-wide text-xs text-white rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Manually Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTxn.id, 'Failed')}
                      className="w-1/2 py-2.5 bg-red-650 hover:bg-red-700 font-black tracking-wide text-xs text-white rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Reject Txn
                    </button>
                  </>
                )}
                {selectedTxn.status === 'Completed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTxn.id, 'Refunded')}
                    className="w-full py-2.5 bg-purple-500/15 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-purple-400 font-black tracking-wide text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Refund Entire Invoice
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIG GATEWAY MODAL */}
      <AnimatePresence>
        {configuringGate && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] select-none text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D26] border border-[#252836] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-[#00D4FF]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Gateway Configuration Panel</h3>
                </div>
                <button
                  onClick={() => setConfiguringGate(null)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveGatewayConfig} className="space-y-4">
                
                <div className="flex items-center gap-3 p-3 bg-[#12141A] rounded-2xl border border-[#252836]">
                  <span className="text-3xl">{configuringGate.logo}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">{configuringGate.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Reference Gateway Node: {configuringGate.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Merchant API Key</label>
                    <input
                      type="text"
                      required
                      value={configuringGate.apiKey}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, apiKey: e.target.value })}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Secret Key / Salt Hash</label>
                    <input
                      type="password"
                      required
                      value={configuringGate.secretKey}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, secretKey: e.target.value })}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex justify-between items-center">
                    <span>Generated Live Webhook endpoint URL</span>
                    <button
                      type="button"
                      onClick={handleGenerateAndCopyWebhook}
                      className="text-[9px] text-[#00D4FF] hover:underline flex items-center gap-1 uppercase"
                    >
                      <Copy size={10} /> Generate & Copy
                    </button>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={configuringGate.webhookUrl}
                    className="w-full bg-[#12141A]/55 border border-[#292c3d] text-[10.5px] font-mono p-2.5 rounded-xl text-gray-400 outline-none block"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gateway Fee %</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={configuringGate.fee}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, fee: parseFloat(e.target.value) })}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min Deposit $</label>
                    <input
                      type="number"
                      required
                      value={configuringGate.minDeposit}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, minDeposit: parseInt(e.target.value) })}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Max Deposit $</label>
                    <input
                      type="number"
                      required
                      value={configuringGate.maxDeposit}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, maxDeposit: parseInt(e.target.value) })}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 font-sans">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfiguringGate({ ...configuringGate, testMode: !configuringGate.testMode })}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                        configuringGate.testMode
                          ? 'bg-amber-500/15 border-amber-500/30 justify-end'
                          : 'bg-slate-800 border-slate-700 justify-start'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                        configuringGate.testMode ? 'bg-[#FFB800]' : 'bg-gray-400'
                      }`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">Activate Sandbox / Test Mode</span>
                      <span className="text-[9.5px] text-gray-500">Enable dummy checking for routing trials</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pb-0.5">Currency System</label>
                    <select
                      value={configuringGate.currency}
                      onChange={(e) => setConfiguringGate({ ...configuringGate, currency: e.target.value })}
                      className="bg-[#12141A] border border-[#292c3d] text-xs p-1 px-2 rounded-lg text-white font-mono"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="USDT">USDT (Crypt)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="VND">VND (₫)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#252836]">
                  <button
                    type="button"
                    onClick={() => setConfiguringGate(null)}
                    className="px-4 py-2 bg-[#12141A] border border-[#1b1d28] hover:bg-[#1C1F2E] text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-[#6C63FF] hover:bg-[#5952cf] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Save configuration
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
