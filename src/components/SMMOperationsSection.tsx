import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, doc, runTransaction, onSnapshot, query, where } from 'firebase/firestore';
import {
  Download,
  Search,
  Check,
  X,
  CreditCard,
  DollarSign,
  Coins,
  Building,
  ArrowRight,
  TrendingUp,
  Activity,
  Code2,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Terminal,
  Zap,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Icon mapping helper for payment methods
import { ReactNode } from 'react';

// Design System Colors:
// Background: #0A0B0F
// Card / Container BG: #1A1D26
// Panel Border: #252836
// Accent Primary: #6C63FF
// Brand Cyan (Success): #00D4FF or #00C896

interface SMMOperationsSectionProps {
  activeTab: 'services' | 'add-funds' | 'api';
  setActiveTab: (tab: 'services' | 'add-funds' | 'api' | string) => void;
  walletBalance: number;
  setWalletBalance: (updater: number | ((prev: number) => number)) => void;
  totalSpent: number;
  setTotalSpent: (updater: number | ((prev: number) => number)) => void;
  onRedirectToNewOrder?: (serviceName: string, serviceId: string) => void;
}

// ==========================================
// MOCK DATA FOR SERVICES (30 Services)
// ==========================================
interface SMMService {
  id: string;
  name: string;
  category: string;
  type: 'Default' | 'Drip Feed' | 'Custom';
  ratePer1000: number;
  minOrder: number;
  maxOrder: number;
  avgSpeed: string;
  refill: boolean;
}


// ==========================================
// MOCK DATA FOR TRANSACTIONS HISTORY
// ==========================================
interface SMMTransaction {
  id: string;
  date: string;
  method: string;
  amount: number;
  fee: number;
  netAmt: number;
  status: 'Approved' | 'Pending' | 'Failed';
}


export default function SMMOperationsSection({
  activeTab,
  setActiveTab,
  walletBalance,
  setWalletBalance,
  totalSpent,
  setTotalSpent,
  onRedirectToNewOrder
}: SMMOperationsSectionProps) {

  // For toast and alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // ==========================================
  // PAGE A: SERVICES LIST LOCAL STATES
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState<string>('All Services');
  const [servicesQuery, setServicesQuery] = useState('');
  const [servicesType, setServicesType] = useState<'All' | 'Default' | 'Drip Feed' | 'Custom'>('All');
  const [servicesSortBy, setServicesSortBy] = useState<'ID' | 'Name' | 'PriceAsc' | 'PriceDesc'>('ID');

  const categories = [
    'All Services', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Telegram', 'Spotify', 'Pinterest'
  ];

  const [dbServices, setDbServices] = useState<SMMService[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snap) => {
      const svcs: SMMService[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status === 'active' || d.status === 'Active') {
          svcs.push({
            id: doc.id,
            name: d.name || '',
            category: d.category || 'Others',
            type: (d.type === 'Custom Comments' || d.type === 'comments') ? 'Custom' : 'Default',
            ratePer1000: d.rate || 0,
            minOrder: d.minOrder || d.min || 0,
            maxOrder: d.maxOrder || d.max || 0,
            avgSpeed: d.avgSpeed || d.speed || 'Normal',
            refill: !!d.refill
          });
        }
      });
      setDbServices(svcs);
    });
    return () => unsub();
  }, []);

  // Services filtering & sorting
  const filteredAndSortedServices = useMemo(() => {
    let result = [...dbServices];

    // 1. Platform Category Tab Filter
    if (selectedCategory !== 'All Services') {
      result = result.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Search Text Query Filter
    if (servicesQuery.trim() !== '') {
      const q = servicesQuery.toLowerCase();
      result = result.filter(s =>
        s.id.includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    // 3. Service Type Filter
    if (servicesType !== 'All') {
      result = result.filter(s => s.type === servicesType);
    }

    // 4. Sort By Order
    result.sort((a, b) => {
      if (servicesSortBy === 'ID') {
        return a.id.localeCompare(b.id);
      } else if (servicesSortBy === 'Name') {
        return a.name.localeCompare(b.name);
      } else if (servicesSortBy === 'PriceAsc') {
        return a.ratePer1000 - b.ratePer1000;
      } else if (servicesSortBy === 'PriceDesc') {
        return b.ratePer1000 - a.ratePer1000;
      }
      return 0;
    });

    return result;
  }, [selectedCategory, servicesQuery, servicesType, servicesSortBy]);

  const handleExportCSV = () => {
    const headers = 'ID,Service Name,Platform,Type,Rate per 1000 (USD),Min Order,Max Order,Speed,Refill\n';
    const csvContent = filteredAndSortedServices.map(s => 
      `"${s.id}","${s.name.replace(/"/g, '""')}","${s.category}","${s.type}","${s.ratePer1000.toFixed(2)}","${s.minOrder}","${s.maxOrder}","${s.avgSpeed}","${s.refill ? 'Yes' : 'No'}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ProSMM_Services_${selectedCategory.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    displayToast('Services catalogue successfully exported to CSV!');
  };

  const handleOrderNowClick = (serviceId: string, serviceName: string) => {
    displayToast(`Redirecting to New Order for Service #${serviceId}...`);
    setTimeout(() => {
      if (onRedirectToNewOrder) {
        onRedirectToNewOrder(serviceName, serviceId);
      } else {
        // Fallback if prop not bounded
        setActiveTab('new-order');
      }
    }, 1200);
  };


  // ==========================================
  // PAGE B: ADD FUNDS LOCAL STATES
  // ==========================================
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(1);
  const [depositAmount, setDepositAmount] = useState<string>('25');
  const [addFundsLedger, setAddFundsLedger] = useState<SMMTransaction[]>([]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const unsub = onSnapshot(query(collection(db, 'transactions'), where('userId', '==', u.uid)), (snap) => {
      const txs: SMMTransaction[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.type === 'deposit') {
          txs.push({
            id: doc.id,
            date: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'Unknown',
            method: d.method || 'Unknown',
            amount: d.amount || 0,
            fee: d.fee || 0,
            netAmt: (d.amount || 0) + (d.fee || 0),
            status: d.status === 'completed' ? 'Approved' : d.status === 'pending' ? 'Pending' : 'Failed'
          });
        }
      });
      // Sort newest first
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAddFundsLedger(txs);
    });
    return () => unsub();
  }, []);

  // Form Fields Credit Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Sync transactional history reactive ledger logs from Firestore
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const txCol = collection(db, 'transactions');
    const q = query(txCol, where('userId', '==', u.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: SMMTransaction[] = [];
      snap.forEach((doc) => {
        const val = doc.data();
        const dateObj = val.createdAt ? new Date(val.createdAt) : new Date();
        const df = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        
        list.push({
          id: doc.id.substring(0, 10).toUpperCase(),
          date: df,
          method: val.method || (val.type === 'spent' ? 'Order Purchase' : 'Deposit'),
          amount: val.amount || 0,
          fee: val.fee || 0,
          netAmt: (val.amount || 0) + (val.fee || 0),
          status: val.status === 'completed' || val.status === 'Approved' ? 'Approved' : 'Pending'
        });
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAddFundsLedger(list);
    });

    return () => unsub();
  }, []);

  // Payment gateway constants
  const PAYMENT_METHODS = [
    { id: 1, name: 'Credit/Debit Card (Stripe)', type: 'Instant', fee: '3.5%', feeVal: 0.035, helper: 'We accept Visa, Mastercard, AMEX and UnionPay securely via Stripe.', isCrypto: false },
    { id: 2, name: 'PayPal Gateway', type: 'Instant', fee: '4%', feeVal: 0.04, helper: 'Fast checkout using credit cards or PayPal balances.', isCrypto: false },
    { id: 3, name: 'Bitcoin Network', type: '30 min confirm', fee: '1%', feeVal: 0.01, helper: 'Blockchain automated verification. Requires 3 network validations.', isCrypto: true, address: 'bc1qf07u94s0aeflksjgkrle89vny9p383m6j960a7' },
    { id: 4, name: 'USDT (TRC20)', type: '15 min confirm', fee: '1%', feeVal: 0.01, helper: 'Tron Native USDT stablecoin address. Zero ERC25 network latency.', isCrypto: true, address: 'TY3WwK4V9Z5Xm7n6WpHf5p8a28XmqD9Yt1' },
    { id: 5, name: 'Ethereum Gas-Saver', type: '30 min confirm', fee: '1%', feeVal: 0.01, helper: 'Smart Contract wallet payment. Supports direct Arbitrum ETH transfer.', isCrypto: true, address: '0x9E75cf6B3E93C5b4E6AbdB91a27e7B3Dff069502' },
    { id: 6, name: 'Perfect Money', type: 'Instant', fee: '2%', feeVal: 0.02, helper: 'Redirect payment gateway. Instant activation key check.', isCrypto: false },
    { id: 7, name: 'Direct Bank Transfer', type: '1-3 days', fee: 'No fee', feeVal: 0.00, helper: 'Manual checking process. Please specify Reference Code in deposit record.', isCrypto: false },
    { id: 8, name: 'Payeer Wallet', type: 'Instant', fee: '2.5%', feeVal: 0.025, helper: 'Supports automatic balance routing via Payeer API.', isCrypto: false }
  ];

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedMethodId);

  // Calculations
  const depositAmountNum = Math.max(0, parseFloat(depositAmount) || 0);
  const selectedMethodFeePercentage = selectedMethod ? selectedMethod.feeVal : 0;
  const calculatedFee = depositAmountNum * selectedMethodFeePercentage;
  const totalBillCalculated = depositAmountNum + calculatedFee;

  const handleDepositProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmountNum < 1.0) {
      displayToast('Minimum funding deposit is strictly $1.00');
      return;
    }

    displayToast('Initiating secure gateway transaction tunnel...');

    try {
      const u = auth.currentUser;
      if (!u) {
        displayToast('Verification error: Please sign in to add funds.');
        return;
      }

      const txId = 'TX' + Math.floor(10000 + Math.random() * 90000);
      const isDeclinedOrPending = selectedMethod?.id === 7; // Bank transfer

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error("Client user profile record missing.");
        }

        const userData = userSnap.data();
        const currentBalance = userData.balance || 0.0;

        // If it is instant (not bank transfer), increment balance
        if (!isDeclinedOrPending) {
          transaction.update(userRef, {
            balance: currentBalance + depositAmountNum
          });
        }

        // Add deposit txn log
        const txColRef = collection(db, 'transactions');
        const nextTxRef = doc(txColRef);
        transaction.set(nextTxRef, {
          userId: u.uid,
          type: 'deposit',
          amount: depositAmountNum,
          fee: calculatedFee,
          method: selectedMethod?.name || 'Gateway',
          status: isDeclinedOrPending ? 'pending' : 'completed',
          reference: txId,
          note: `Funds Deposited via ${selectedMethod?.name || 'Gateway'}`,
          createdAt: new Date().toISOString()
        });
      });

      if (!isDeclinedOrPending) {
        setWalletBalance(prev => prev + depositAmountNum);
        displayToast(`Deposited $${depositAmountNum.toFixed(2)} credited immediately! Balance Refreshed.`);
      } else {
        displayToast('Bank Transfer deposit request logged. Pending manual review (1-3 days).');
      }

      // Reset Card Inputs
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardHolder('');
    } catch (err: any) {
      displayToast('Deposit failed: ' + err.message);
    }
  };


  // ==========================================
  // PAGE C: API ACCESS LOCAL STATES
  // ==========================================
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState('ps_live_a23f4g8910bcmx7w8q2zcd1ab1234');
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [activeCodeExampleTab, setActiveCodeExampleTab] = useState<'curl' | 'php' | 'py' | 'js' | 'node'>('curl');

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    displayToast(`${label} copied to clipboard!`);
  };

  const handleRegenerateApiKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randStr = '';
    for (let i = 0; i < 24; i++) {
      randStr += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = `ps_live_${randStr}abcd${Math.floor(1000 + Math.random() * 9000)}`;
    setCurrentApiKey(newKey);
    setShowRegenConfirm(false);
    displayToast('API Credentials regenerated successfully. Please update your client endpoints.');
  };

  // Code Blocks Map
  const codeExamples = {
    curl: `curl -X POST "https://prosmmanel.com/api/v2" \\
  -d "key=${currentApiKey}" \\
  -d "action=order" \\
  -d "service=1001" \\
  -d "link=https://instagram.com/username" \\
  -d "quantity=1000"`,

    php: `<?php
$ch = curl_init("https://prosmmanel.com/api/v2");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'key' => '${currentApiKey}',
    'action' => 'order',
    'service' => 1001,
    'link' => 'https://instagram.com/username',
    'quantity' => 1000
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,

    py: `import requests

response = requests.post(
    "https://prosmmanel.com/api/v2",
    data={
        "key": "${currentApiKey}",
        "action": "order",
        "service": "1001",
        "link": "https://instagram.com/username",
        "quantity": 1000
    }
)
print(response.json())`,

    js: `fetch("https://prosmmanel.com/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "${currentApiKey}",
    action: "order",
    service: "1001",
    link: "https://instagram.com/username",
    quantity: "1000"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error(error));`,

    node: `const axios = require('axios');

axios.post('https://prosmmanel.com/api/v2', {
  key: '${currentApiKey}',
  action: 'order',
  service: '1001',
  link: 'https://instagram.com/username',
  quantity: 1000
}, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('API Error:', error.message);
});`
  };


  return (
    <div className="space-y-7 pb-10 text-left animate-fade-in relative">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 bg-[#1A1D26] border-2 border-brand-primary text-white rounded-2xl p-4.5 shadow-2xl z-[999] flex items-center gap-3.5 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-cyan shrink-0 animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TAB SELECTOR (UNIFIED ROUTER)
          Keep exactly compatible under the requested local state system to switch between three pages.
         ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#252836] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Bulk Reseller Operations Suite</h2>
          <p className="text-xs text-brand-text-secondary mt-0.5">Control wholesale services, payment wallets, and API endpoints.</p>
        </div>

        <div className="bg-[#12141A] p-1.5 rounded-xl border border-[#252836] flex items-center gap-1">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Services List
          </button>
          <button
            onClick={() => setActiveTab('add-funds')}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'add-funds'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Add Funds
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'api'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            API Access
          </button>
        </div>
      </div>


      {/* ==========================================
          RENDER PAGE A: SERVICES LIST
         ========================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Page Sub-Header */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-md">
                Services Sheet
              </span>
              <h3 className="text-base font-extrabold text-white mt-2.5">SMM Bulk Services Panel</h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">Browse all available services, execution velocity, and pricing thresholds.</p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12141A] hover:bg-[#1A1D26] border border-brand-border hover:border-brand-primary/40 transition-all cursor-pointer shadow"
            >
              <Download size={14} />
              <span>Export CSV CATALOGUE</span>
            </button>
          </div>

          {/* Platforms categories horizontal-scroll navigation */}
          <div className="overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                    selectedCategory === cat
                      ? 'bg-brand-primary/15 text-brand-cyan border-brand-primary/45 shadow shadow-brand-primary/10'
                      : 'bg-[#12141A] text-gray-400 border-[#252836] hover:bg-[#12141A]/80 hover:text-white'
                  }`}
                >
                  {cat === 'All Services' ? '🌐 All Services' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#12141A] border border-[#252836] rounded-2xl p-4.5">
            
            {/* Search filter (Column 5) */}
            <div className="md:col-span-5 relative flex items-center">
              <Search className="absolute left-3.5 text-[#858da8]" size={15} />
              <input
                type="text"
                value={servicesQuery}
                onChange={(e) => setServicesQuery(e.target.value)}
                placeholder="Search services id, title/target name..."
                className="w-full bg-[#1A1D26] border border-[#252836] text-xs py-2.5 pl-10 pr-4 rounded-xl text-white outline-none focus:border-brand-primary placeholder:text-gray-600 transition-all"
              />
            </div>

            {/* Type Filter selector (Column 3.5) */}
            <div className="md:col-span-3.5 flex flex-col gap-1.5 text-left">
              <div className="relative">
                <select
                  value={servicesType}
                  onChange={(e) => setServicesType(e.target.value as any)}
                  className="w-full bg-[#1A1D26] border border-[#252836] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="All">All Delivery Types</option>
                  <option value="Default">Default Delivery</option>
                  <option value="Drip Feed">Drip Feed Service</option>
                  <option value="Custom">Custom / Comments</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Sort by parameter (Column 3.5) */}
            <div className="md:col-span-3.5 flex flex-col gap-1.5 text-left">
              <div className="relative">
                <select
                  value={servicesSortBy}
                  onChange={(e) => setServicesSortBy(e.target.value as any)}
                  className="w-full bg-[#1A1D26] border border-[#252836] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="ID">Sort by: Service ID</option>
                  <option value="Name">Sort by: Service Name</option>
                  <option value="PriceAsc">Sort by: Rate (Low to High)</option>
                  <option value="PriceDesc">Sort by: Rate (High to Low)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* SMM CATALOGUE TABULATED DATA GRID */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-brand-border/40 bg-[#12141A] text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider select-none leading-none">
                    <th className="py-4 px-4.5">ID</th>
                    <th className="py-4 px-4.5 w-1/3">Service Name</th>
                    <th className="py-4 px-4.5">Type</th>
                    <th className="py-4 px-4.5">Rate (Per K)</th>
                    <th className="py-4 px-4.5">Min Order</th>
                    <th className="py-4 px-4.5">Max Order</th>
                    <th className="py-4 px-4.5">Avg Speed</th>
                    <th className="py-4 px-4.5 text-center">Refill</th>
                    <th className="py-4 px-4.5 text-right">Place action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-xs font-medium text-gray-200">
                  {filteredAndSortedServices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500 font-semibold">
                        <AlertCircle className="mx-auto mb-2.5 text-[#5F6375]" size={28} />
                        No services matching current search/filter metrics. Try checking other parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedServices.map((service) => (
                      <tr key={service.id} className="hover:bg-white/[0.015] transition-colors leading-relaxed">
                        <td className="py-4 px-4.5 font-mono text-gray-400">
                          <span className="bg-[#12141A] border border-[#252836] text-[10.5px] px-2.5 py-1.5 rounded-md text-slate-300 font-extrabold">
                            {service.id}
                          </span>
                        </td>
                        <td className="py-4 px-4.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white leading-normal">{service.name}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{service.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4.5">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider py-1 px-2 rounded-md border ${
                            service.type === 'Drip Feed'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : service.type === 'Custom'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {service.type}
                          </span>
                        </td>
                        <td className="py-4 px-4.5">
                          <span className="text-emerald-400 text-xs font-black font-mono">
                            ${service.ratePer1000.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4.5 font-mono text-xs">{service.minOrder.toLocaleString()}</td>
                        <td className="py-4 px-4.5 font-mono text-xs">{service.maxOrder.toLocaleString()}</td>
                        <td className="py-4 px-4.5 text-[#858da8] text-xs font-bold">{service.avgSpeed}</td>
                        <td className="py-4 px-4.5 text-center">
                          {service.refill ? (
                            <span className="inline-flex w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center justify-center font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex w-6 h-6 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 items-center justify-center font-bold">
                              ✗
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4.5 text-right">
                          <button
                            onClick={() => handleOrderNowClick(service.id, service.name)}
                            className="bg-[#6C63FF]/15 text-[#6c63ff] hover:bg-[#6C63FF] hover:text-white border border-[#6C63FF]/30 hover:border-transparent px-3.5 py-1.8 rounded-lg text-[11px] font-black tracking-tight cursor-pointer transition-all uppercase"
                          >
                            Order Now
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ==========================================
          RENDER PAGE B: ADD FUNDS
         ========================================== */}
      {activeTab === 'add-funds' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Header Display wallet balance */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-brand-warning uppercase tracking-widest bg-brand-warning/10 border border-brand-warning/20 px-2.5 py-1 rounded-md">
                Secured Funding Portal
              </span>
              <h3 className="text-lg font-black text-white mt-3">Refill Account Ledger Balance</h3>
              <p className="text-xs text-brand-text-secondary mt-1">Select from instant payment options or manual wires to deposit funds to your platform wallet.</p>
            </div>

            {/* Wallet Display */}
            <div className="bg-gradient-to-r from-brand-warning/10 to-brand-warning/20 border-2 border-brand-warning/30 rounded-2xl p-4.5 flex items-center gap-4.5 min-w-[220px]">
              <div className="w-11 h-11 rounded-xl bg-brand-warning/20 flex items-center justify-center text-brand-warning animate-bounce">
                <Wallet size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">Active Balance</span>
                <span className="text-2xl font-black text-white tracking-tight">${walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS SELECTOR GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Select Payment Channel</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethodId === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`bg-[#1A1D26] border-2 rounded-2xl p-4.5 cursor-pointer hover:border-brand-primary/40 hover:shadow-lg transition-all relative group flex flex-col justify-between min-h-[145px] ${
                      isSelected ? 'border-brand-primary bg-brand-primary/4' : 'border-[#252836]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="p-2 bg-[#12141A] rounded-xl border border-[#252836] text-white">
                          {method.id === 1 && <CreditCard className="text-indigo-400" size={18} />}
                          {method.id === 2 && <DollarSign className="text-blue-400" size={18} />}
                          {method.id >= 3 && method.id <= 5 && <Coins className="text-yellow-500" size={18} />}
                          {method.id === 6 && <TrendingUp className="text-teal-400" size={18} />}
                          {method.id === 7 && <Building className="text-orange-400" size={18} />}
                          {method.id === 8 && <Wallet className="text-purple-400" size={18} />}
                        </div>

                        <span className={`text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded border leading-none ${
                          method.type === 'Instant'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : method.type.includes('confirm')
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {method.type}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">{method.name}</h5>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#252836] flex justify-between items-center text-[10px] text-gray-500">
                      <span>Gateway Fee:</span>
                      <span className="font-extrabold text-slate-300 font-mono">{method.fee}</span>
                    </div>

                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[10px] font-bold flex items-center justify-center border border-[#0A0B0F] shadow-md-indigo">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC FORM ACTIONS (Triggered upon selection) */}
          {selectedMethod && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[5px] h-full bg-brand-primary" />
              
              {/* Form Side parameters inputs */}
              <div className="lg:col-span-7 flex flex-col gap-5 justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 mb-2.5">
                    <span>Deposit Parameters Guide</span>
                    <span className="text-[10px] text-brand-cyan hover:underline hover:cursor-pointer flex items-center gap-1">
                      (Terms Apply)
                    </span>
                  </h4>
                  <p className="text-xs text-brand-text-secondary leading-relaxed bg-[#12141A] p-3 rounded-xl border border-[#252836]">
                    {selectedMethod.helper}
                  </p>
                </div>

                <form onSubmit={handleDepositProcess} className="space-y-4">
                  {/* Amount Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Deposit Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 inset-y-0 flex items-center font-extrabold text-[#6C63FF] font-mono text-base">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-[#12141A] border-2 border-[#252836] focus:border-brand-primary focus:outline-none rounded-xl text-white font-extrabold font-mono py-3.5 pl-9 pr-4 text-base"
                        required
                      />
                    </div>
                    {/* Quick values keys */}
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {['5', '10', '25', '50', '100', '200'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          className={`py-1.8 px-1.5 bg-[#12141A] border rounded-lg text-xs font-extrabold transition-all cursor-pointer select-none font-mono ${
                            depositAmount === amt
                              ? 'border-brand-primary text-[#6C63FF] bg-brand-primary/5'
                              : 'border-[#252836] text-gray-400 hover:text-white hover:border-[#525775]'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stripe Card parameters panel only if card selected */}
                  {selectedMethod.id === 1 && (
                    <div className="bg-[#12141A] p-4.5 border border-[#252836] rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CreditCard size={12} />
                        Stripe Secured Sandbox Credit Card
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Card Holder Name</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="bg-[#1A1D26] border border-[#252836] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="bg-[#1A1D26] border border-[#252836] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-400"
                            placeholder="4111 2222 3333 4444"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Expiry Metric (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                            className="bg-[#1A1D26] border border-[#252836] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-400"
                            placeholder="12/29"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">CVV Check</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={3}
                            className="bg-[#1A1D26] border border-[#252836] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-400/90"
                            placeholder="•••"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crypto address panel */}
                  {selectedMethod.isCrypto && selectedMethod.address && (
                    <div className="bg-[#12141A] p-4 border border-[#252836] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-extrabold text-yellow-500 uppercase tracking-wider block">
                          Deposit destination wallet ({selectedMethod.name})
                        </span>
                        <p className="text-[11px] font-mono select-all bg-[#1A1D26] p-2 rounded border border-[#252836] text-slate-300 break-all leading-relaxed">
                          {selectedMethod.address}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedMethod.address || '', 'Wallet Address')}
                        className="bg-[#1A1D26] hover:bg-[#252836] border border-[#252836] p-2.5 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Copy Wallet Address"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}

                  {/* Bank manual wire instructions */}
                  {selectedMethod.id === 7 && (
                    <div className="bg-[#12141A] p-4.5 border border-[#252836] rounded-xl space-y-2.5 text-xs leading-relaxed text-[#858da8]">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Offshore Automated Wire Bank Routing</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/[0.015] p-3 rounded-lg border border-[#252836]">
                        <span className="text-gray-400 font-semibold">Beneficiary Bank:</span>
                        <span className="text-white font-bold">Standard Sovereign Reseller Trust</span>
                        <span className="text-gray-400 font-semibold">IBAN Account:</span>
                        <span className="text-brand-cyan font-mono select-all font-bold">CH62 1004 8921 556q 8820 1</span>
                        <span className="text-gray-400 font-semibold">BIC / SWIFT Code:</span>
                        <span className="text-white font-mono select-all font-bold font-mono">SOVTRUSTCHZH</span>
                        <span className="text-gray-400 font-semibold">Instruction Ref Code:</span>
                        <span className="text-orange-400 font-bold font-mono">PS_MANUAL_TRANS_2026_WIRE</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        🚨 Important: Always write your reference code in your banking wire notes so our agents can immediately matching your dashboard account balance.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-xs select-none cursor-pointer transition-all bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:opacity-95 text-white shadow-xl shadow-[#6c63ff]/10 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>Proceed Deposit Gateway</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>

              {/* Deposit Billing Summary Calculation Sheet (3 columns) */}
              <div className="lg:col-span-5 bg-[#12141A] border border-[#252836] rounded-xl p-4.5 flex flex-col justify-between gap-5 text-xs">
                <div>
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider pb-2 border-b border-[#252836] mb-3">
                    Billing Calculation Sheet
                  </h4>

                  <ul className="space-y-3 text-slate-400">
                    <li className="flex justify-between font-medium">
                      <span>Gateway Base Amount</span>
                      <span className="text-white font-bold font-mono">${depositAmountNum.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between font-medium">
                      <span>Gateway Processing Fee ({selectedMethod.fee})</span>
                      <span className="text-white font-bold font-mono">+${calculatedFee.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between font-medium">
                      <span>Sovereign VAT / Taxes</span>
                      <span className="text-emerald-400 font-black uppercase font-mono">No Tax (0%)</span>
                    </li>
                    <li className="border-t border-[#252836] pt-3 flex justify-between font-medium items-center">
                      <span className="text-white font-extrabold uppercase">Total Billing (USD)</span>
                      <span className="text-[#00D4FF] font-black font-mono text-lg">${totalBillCalculated.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#1A1D26] border border-[#252836] rounded-xl p-3 flex gap-3 text-[11px] leading-relaxed text-[#858da8]">
                  <div className="text-brand-cyan shrink-0">
                    <Info size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-white block mb-0.5">Secure Transaction Guarantee</span>
                    Your payments are encapsulated inside AES-256 bit sandboxed TLS tunnels. Transaction ledger results are completely autonomous.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* HISTORIC DEPOSITS LEDGER LOGS */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping" />
                <h4 className="text-xs font-black uppercase text-white tracking-widest">
                  Personal Funding Ledger Logs
                </h4>
              </div>
              <span className="text-[10px] text-gray-500 font-extrabold font-mono uppercase">
                {addFundsLedger.length} Verified Records Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-brand-border/40 bg-[#12141A] text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest select-none leading-none">
                    <th className="py-3.5 px-4.5">Transaction ID</th>
                    <th className="py-3.5 px-4.5">Date / Hour</th>
                    <th className="py-3.5 px-4.5">Payment Method</th>
                    <th className="py-3.5 px-4.5">Deposit Amount</th>
                    <th className="py-3.5 px-4.5">Gateway Fee</th>
                    <th className="py-3.5 px-4.5">Net Credited</th>
                    <th className="py-3.5 px-4.5 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-xs font-medium text-gray-200">
                  {addFundsLedger.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.012] transition-colors leading-relaxed">
                      <td className="py-3.5 px-4.5 font-mono text-gray-400">{tx.id}</td>
                      <td className="py-3.5 px-4.5 text-gray-400 font-mono text-[11px]">{tx.date}</td>
                      <td className="py-3.5 px-4.5 font-bold text-white">{tx.method}</td>
                      <td className="py-3.5 px-4.5 font-mono text-slate-100">${tx.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4.5 font-mono text-gray-400">${tx.fee.toFixed(2)}</td>
                      <td className="py-3.5 px-4.5 font-mono font-black text-brand-cyan">${tx.netAmt.toFixed(2)}</td>
                      <td className="py-3.5 px-4.5 text-right">
                        <span className={`inline-block text-[9px] uppercase font-black tracking-wider py-1 px-2.5 rounded-md border ${
                          tx.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : tx.status === 'Pending'
                            ? 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* ==========================================
          RENDER PAGE C: API ACCESS
         ========================================== */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Sub-Header details */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-widest bg-[#6C63FF]/10 border border-[#6C63FF]/20 px-2.5 py-1 rounded-md">
              Programmatic Integrations
            </span>
            <h3 className="text-lg font-black text-white mt-3">Platform API Access Integration</h3>
            <p className="text-xs text-brand-text-secondary mt-1">
              Synchronize your own SMM panel with our automated distribution hubs. Place, list, and verify consumer orders instantly programmatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Your API key controls (7 columns width) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* API Token Key Control Card */}
              <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                  <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5ClassName bg-transparent">
                    <Key size={14} className="text-[#6C63FF]" />
                    <span>Your Secure Web API Key Token</span>
                  </h4>
                  <span className="text-[10px] text-[#00D4FF] font-black uppercase font-mono">
                    Live Credentials
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="relative">
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      value={currentApiKey}
                      readOnly
                      className="w-full bg-[#12141A] border-2 border-[#252836] rounded-xl text-xs py-3.5 pl-4 pr-24 text-slate-100 font-mono focus:outline-none"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      {/* Show / Hide */}
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="p-2 hover:bg-[#1A1D26] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title={apiKeyVisible ? 'Mask Key' : 'Reveal Key'}
                      >
                        {apiKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      {/* Copy */}
                      <button
                        onClick={() => handleCopyText(currentApiKey, 'API Key')}
                        className="p-2 hover:bg-[#1A1D26] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Key Token"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-3.5 pt-2 text-xs">
                    <span className="text-gray-500 font-medium">Last used: <strong className="text-slate-300 font-bold font-mono">2 hours ago</strong></span>
                    <button
                      onClick={() => setShowRegenConfirm(true)}
                      className="text-[11px] font-black text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} />
                      <span>Regenerate Credentials</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Endpoint Card */}
              <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                    <Terminal size={14} className="text-[#00D4FF]" />
                    <span>REST Server Endpoint Connection</span>
                  </h4>
                  <span className="bg-[#00C896]/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded leading-none">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 text-xs text-slate-400">
                  <div className="bg-[#12141A] p-3 border border-[#252836] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] block text-gray-500 uppercase font-black uppercase">Format Type</span>
                      <span className="font-extrabold text-white">JSON Parser Formatter</span>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold font-mono rounded">JSON</span>
                  </div>

                  <div className="bg-[#12141A] p-3 border border-[#252836] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] block text-gray-500 uppercase font-black uppercase">Authorization Params</span>
                      <span className="font-extrabold text-white">API Key Header parameter</span>
                    </div>
                    <span className="px-2.5 py-1 bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 text-[10px] font-bold font-mono rounded">HTTP POST</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#12141A] p-3.5 border border-[#252836] rounded-xl text-xs font-mono">
                  <span className="text-brand-cyan select-all break-all pr-4">https://prosmmanel.com/api/v2</span>
                  <button
                    onClick={() => handleCopyText('https://prosmmanel.com/api/v2', 'API Endpoint URL')}
                    className="p-2 hover:bg-[#1A1D26] border border-[#252836] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

            </div>

            {/* Right: API Interactive stats (5 columns width) */}
            <div className="lg:col-span-5 bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col justify-between gap-5 text-xs">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider pb-2 border-b border-[#252836] mb-4 flex items-center gap-1.5 bg-transparent">
                  <Activity size={14} className="text-[#00D4FF]" />
                  <span>Interactive Live API usage statistics</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total API Calls', val: '4,821', meta: 'Lifetime Synced', color: 'text-indigo-400 bg-indigo-505/5 border-indigo-500/10' },
                    { label: 'Orders via API', val: '892', meta: 'Completed Node Checks', color: 'text-brand-cyan bg-[#00D4FF]/5 border-[#00D4FF]/10' },
                    { label: 'Success rate', val: '99.2%', meta: '24h Server Average', color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
                    { label: 'Avg Latency Speed', val: '145ms', meta: 'Vite Native Edge', color: 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#12141A] border border-[#252836] p-3.5 rounded-xl text-left flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 font-black uppercase uppercase">{stat.label}</span>
                      <span className="text-base font-extrabold text-white tracking-tight">{stat.val}</span>
                      <span className="text-[8.5px] text-gray-600 font-bold leading-none mt-0.5">{stat.meta}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#12141A] p-4 border border-brand-primary/15 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-[#858da8]">
                <div className="text-slate-200 shrink-0 mt-0.5">
                  🛡️
                </div>
                <div>
                  <span className="font-extrabold text-white block mb-0.5">Automated Query Limits</span>
                  Clients are limited to maximum <strong className="text-[#00D4FF] font-mono">15 requests/sec</strong> per authorization token. Exceeding limits will invoke HTTP status 429 triggers.
                </div>
              </div>
            </div>

          </div>

          {/* TABLE: API ACTIONS DEFINITIONS REFERENCE */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md space-y-4">
            <div className="pb-2 border-b border-[#252836]">
              <h4 className="text-xs font-black uppercase text-white tracking-widest">
                API Endpoint Parameter Definitions Reference
              </h4>
              <p className="text-xs text-brand-text-secondary mt-0.5">Integrate these actions inside your JSON POST/GET pipelines.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-brand-border/40 bg-[#12141A] text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest select-none leading-none">
                    <th className="py-3 px-4">Action Method</th>
                    <th className="py-3 px-4">Request Type</th>
                    <th className="py-3 px-4">Required Params</th>
                    <th className="py-3 px-4 w-1/2">Response / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-xs font-medium text-gray-200">
                  {[
                    { action: 'services', method: 'GET', params: 'key', desc: 'Queries full lists of active platform SMM services, speeds, pricing thresholds, and category IDs.' },
                    { action: 'order', method: 'POST', params: 'key, service, link, quantity', desc: 'Submits a new campaign distribution request. Returns order ID immediately upon verified balance deduction.' },
                    { action: 'status', method: 'POST', params: 'key, order', desc: 'Queries campaign execution velocity. Returns progress counters, start counters, and target status labels.' },
                    { action: 'balance', method: 'GET', params: 'key', desc: 'Queries your current user balance instantly. Formats result in standard USD floats JSON.' },
                    { action: 'refill', method: 'POST', params: 'key, order', desc: 'Sends an automated refill trigger for orders with active drop protective contracts.' },
                    { action: 'cancel', method: 'POST', params: 'key, order', desc: 'Sends an immediate cancel petition. Returns 1 for success or error logs.' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3 px-4">
                        <span className="font-mono text-white bg-slate-800/40 border border-[#252836] px-2.5 py-1 rounded font-bold text-[11px]">
                          {row.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9.5px] font-mono uppercase font-black tracking-widest py-0.5 px-2.5 rounded border leading-none ${
                          row.method === 'GET'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                            : 'bg-[#6C63FF]/10 text-indigo-400 border-[#6C63FF]/25'
                        }`}>
                          {row.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[10.5px]">
                        {row.params}
                      </td>
                      <td className="py-3 px-4 text-brand-text-secondary leading-relaxed font-normal">
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CODE EXAMPLES WITH SELECTABLE TAB VIEW */}
          <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 pb-2 border-b border-[#252836]">
              <div>
                <h4 className="text-xs font-black uppercase text-white tracking-widest">
                  Ready-To-Run Code Examples
                </h4>
                <p className="text-xs text-brand-text-secondary mt-0.5">Copy these boilerplates directly into your application services controller.</p>
              </div>

              {/* Languages Tab Switches */}
              <div className="bg-[#12141A] p-1.2 rounded-xl border border-[#252836] flex items-center flex-wrap gap-0.5">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'php', label: 'PHP' },
                  { id: 'py', label: 'Python' },
                  { id: 'js', label: 'JavaScript' },
                  { id: 'node', label: 'Node.js' }
                ].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setActiveCodeExampleTab(tag.id as any)}
                    className={`px-3 py-1.8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeCodeExampleTab === tag.id
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Highlighted Code Block Wrapper */}
            <div className="relative group rounded-xl overflow-hidden border border-[#252836] bg-[#0E1015]">
              <pre className="p-4.5 overflow-x-auto text-[11px] font-mono text-sky-300 leading-normal select-all font-mono scrollbar-thin">
                <code>
                  {codeExamples[activeCodeExampleTab]}
                </code>
              </pre>

              {/* Float Copy key */}
              <button
                onClick={() => handleCopyText(codeExamples[activeCodeExampleTab], `${activeCodeExampleTab.toUpperCase()} boilerplates`)}
                className="absolute top-3.5 right-3.5 p-2 bg-[#1A1D26] hover:bg-[#252836] border border-[#252836] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow"
                title="Copy code block"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

        </div>
      )}


      {/* CONFIRMATION WARNING DIALOG: API KEY REGENERATION */}
      <AnimatePresence>
        {showRegenConfirm && (
          <div className="fixed inset-0 bg-[#0A0B0F]/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1D26] border-2 border-rose-500/40 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">
                    Confirm Key Change Warnings
                  </h4>
                  <span className="text-[10px] text-rose-400 font-bold uppercase mt-0.5">Critical warning details</span>
                </div>
              </div>

              <div className="bg-[#12141A] p-4.5 border border-[#252836] rounded-xl text-xs text-slate-400 leading-relaxed space-y-2">
                <p>
                  Regenerating your SMM panels programmatic key will immediately invalidate <strong className="text-white font-bold font-mono">{currentApiKey}</strong> completely.
                </p>
                <p>
                  All your active integrations, client endpoints, and automated background requests will fail immediately with server authorization code 401.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegenConfirm(false)}
                  className="flex-1 py-3 text-center rounded-xl bg-[#12141A] hover:bg-[#1A1D26] border border-brand-border text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateApiKey}
                  className="flex-1 py-3 text-center rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-xs text-white transition-all cursor-pointer uppercase tracking-wider"
                >
                  Regenerate Creds
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
