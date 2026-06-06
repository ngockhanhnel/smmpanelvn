import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, doc, runTransaction, onSnapshot } from 'firebase/firestore';
import {
  Check,
  ChevronDown,
  Info,
  Link as LinkIcon,
  Plus,
  Minus,
  Sparkles,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  ThumbsUp,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Tag
} from 'lucide-react';

// Platform and category identifiers
interface Category {
  id: string;
  name: string;
  color: string;
  iconColor: string;
  dotColor: string;
}

const CATEGORIES: Category[] = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-600/10 text-pink-500 border-pink-500/20', iconColor: 'text-[#E1306C]', dotColor: 'bg-[#E1306C]' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-zinc-800/15 text-white border-zinc-700/30', iconColor: 'text-white', dotColor: 'bg-white' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600/10 text-red-500 border-red-500/20', iconColor: 'text-[#FF0000]', dotColor: 'bg-[#FF0000]' },
  { id: 'telegram', name: 'Telegram', color: 'bg-sky-600/10 text-sky-400 border-sky-400/20', iconColor: 'text-[#24A1DE]', dotColor: 'bg-[#24A1DE]' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600/10 text-blue-500 border-blue-500/20', iconColor: 'text-[#1877F2]', dotColor: 'bg-[#1877F2]' },
  { id: 'twitter', name: 'Twitter / X', color: 'bg-slate-800/20 text-slate-200 border-slate-700/20', iconColor: 'text-slate-200', dotColor: 'bg-slate-400' },
  { id: 'spotify', name: 'Spotify', color: 'bg-emerald-600/10 text-emerald-400 border-emerald-400/20', iconColor: 'text-[#1DB954]', dotColor: 'bg-[#1DB954]' },
  { id: 'soundcloud', name: 'SoundCloud', color: 'bg-orange-600/10 text-orange-500 border-orange-500/20', iconColor: 'text-[#FF5500]', dotColor: 'bg-[#FF5500]' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-rose-700/10 text-rose-500 border-rose-500/20', iconColor: 'text-[#BD081C]', dotColor: 'bg-[#BD081C]' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-800/10 text-blue-400 border-blue-400/20', iconColor: 'text-[#0A66C2]', dotColor: 'bg-[#0A66C2]' }
];

interface Service {
  id: string;
  categoryId: string;
  name: string;
  ratePer1000: number;
  min: number;
  max: number;
  speed: string;
  refill: string;
  type: 'default' | 'comments' | 'custom';
  description: string;
  quality: string;
  placeholder: string;
}

const SERVICES_DB: Service[] = [
  // Instagram
  {
    id: '1001',
    categoryId: 'instagram',
    name: 'Instagram Followers — Real & Active (Gradual Delivery)',
    ratePer1000: 1.20,
    min: 100,
    max: 100000,
    speed: '5,000 - 10,000/day',
    refill: '30 Days Automatic Refill',
    type: 'default',
    description: 'High quality real-looking accounts. Gradual and organic delivery. Perfectly safe for brand pages and personal creators.',
    quality: 'High Quality ✓',
    placeholder: 'https://instagram.com/username'
  },
  {
    id: '1002',
    categoryId: 'instagram',
    name: 'Instagram Likes — High Quality Instant [No Drop]',
    ratePer1000: 0.45,
    min: 50,
    max: 50000,
    speed: 'Instant Delivery',
    refill: 'Lifetime Guaranteed',
    type: 'default',
    description: 'Instant reaction delivery. Stable accounts with posts. Boosts immediate Instagram algorithm recommendations.',
    quality: 'Premium Quality ✓',
    placeholder: 'https://instagram.com/p/CvxXyZ_abcd'
  },
  {
    id: '1003',
    categoryId: 'instagram',
    name: 'Instagram Videoviews — Lightning Fast Speed',
    ratePer1000: 0.20,
    min: 100,
    max: 1000000,
    speed: '100,000/hour',
    refill: 'No Refill Needed (Permanent)',
    type: 'default',
    description: 'Lightning-fast delivery of premium reel and video impressions. Enhances explore page reach.',
    quality: 'Instant Speed ✓',
    placeholder: 'https://instagram.com/reel/CwYabc123'
  },
  {
    id: '1004',
    categoryId: 'instagram',
    name: 'Instagram Story Views — Fast Session Pack',
    ratePer1000: 0.30,
    min: 100,
    max: 50000,
    speed: '1,000 - 5,000/30 mins',
    refill: 'Non-drop active session',
    type: 'default',
    description: 'Story views on all active stories on your account. Highly realistic behavior with profile clicks.',
    quality: 'Active Profiles ✓',
    placeholder: 'https://instagram.com/stories/username'
  },
  {
    id: '1005',
    categoryId: 'instagram',
    name: 'Instagram Comments — Fully Customizable AI Custom Pack',
    ratePer1000: 5.00,
    min: 5,
    max: 500,
    speed: 'Natural Drip 50/day',
    refill: 'Permanent guaranteed',
    type: 'comments',
    description: 'Enter your custom comments, one per line. Real-looking profiles related to entrepreneurship/lifestyle write them.',
    quality: 'Custom Comments ✓',
    placeholder: 'https://instagram.com/p/CwYabc123'
  },
  {
    id: '1006',
    categoryId: 'instagram',
    name: 'Instagram Saves — Organic Post Saves Boost',
    ratePer1000: 0.80,
    min: 100,
    max: 10000,
    speed: 'Super Instant',
    refill: 'Stable permanent saves',
    type: 'default',
    description: 'Triggers the core Instagram algorithm save-metrics. Drastically improves organic feed standing.',
    quality: 'Platform Metric ✓',
    placeholder: 'https://instagram.com/p/CwYabc123'
  },

  // TikTok
  {
    id: '2001',
    categoryId: 'tiktok',
    name: 'TikTok Real Followers — Elite Fast Delivery',
    ratePer1000: 2.10,
    min: 100,
    max: 80000,
    speed: '8,000/day',
    refill: '30 Days Refill Guarantee',
    type: 'default',
    description: 'Real active TikTok community members. Essential for accessing live stream features and bios.',
    quality: 'High Retention ✓',
    placeholder: 'https://tiktok.com/@username'
  },
  {
    id: '2002',
    categoryId: 'tiktok',
    name: 'TikTok Viral Views [Instant Start / Max Speed]',
    ratePer1000: 0.05,
    min: 1000,
    max: 5000000,
    speed: '10M/day speed limit',
    refill: 'Stable static views',
    type: 'default',
    description: 'Insanely fast views. Triggers high watch times to unlock FYP potential.',
    quality: 'Lightning Fast ✓',
    placeholder: 'https://tiktok.com/@username/video/123456789'
  },

  // YouTube
  {
    id: '3001',
    categoryId: 'youtube',
    name: 'YouTube Watch Time Hours Pack (Active 10min+ Videos)',
    ratePer1000: 22.40,
    min: 100,
    max: 4000,
    speed: '200 - 500 hours/day',
    refill: 'Lifetime Guarantee',
    type: 'default',
    description: 'Genuine watch time generation optimized specifically to meet YouTube monetization milestones smoothly.',
    quality: 'AdSense Safe ✓',
    placeholder: 'https://youtube.com/watch?v=video_id'
  },
  {
    id: '3002',
    categoryId: 'youtube',
    name: 'YouTube Active Lifetime Subscribers',
    ratePer1000: 14.50,
    min: 50,
    max: 10000,
    speed: '200/day speed-guard',
    refill: 'Lifetime Guarantee',
    type: 'default',
    description: 'Permanent subscribers with high video-watching metrics. Zero drops recorded.',
    quality: 'Non-Drop Premium ✓',
    placeholder: 'https://youtube.com/c/channelname'
  },

  // Telegram
  {
    id: '6001',
    categoryId: 'telegram',
    name: 'Telegram Premium Group/Channel Members',
    ratePer1000: 2.50,
    min: 100,
    max: 50000,
    speed: '15,000/day speed',
    refill: '30 Days Auto Refill',
    type: 'default',
    description: 'High-quality global accounts joining your channel, complete with user pictures and usernames.',
    quality: 'Stable Accounts ✓',
    placeholder: 'https://t.me/channelname'
  }
];

interface NewOrderSectionProps {
  onOrderSuccess: (newOrder: {
    id: string;
    service: string;
    target: string;
    qty: string;
    price: string;
    status: string;
    date: string;
  }) => void;
  availableBalance: number;
  deductBalance: (amount: number) => void;
}

export default function NewOrderSection({
  onOrderSuccess,
  availableBalance,
  deductBalance
}: NewOrderSectionProps) {
  // Current step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [services, setServices] = useState<Service[]>(SERVICES_DB);

  // Sync services from firestore database
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snap) => {
      const dbServices: Service[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status === 'active' || d.status === 'Active') {
          dbServices.push({
            id: doc.id,
            categoryId: (d.category || '').toLowerCase(),
            name: d.name || '',
            ratePer1000: d.rate || 0,
            min: d.minOrder || d.min || 0,
            max: d.maxOrder || d.max || 0,
            speed: d.avgSpeed || d.speed || '',
            refill: d.refill ? `${d.refillDays || 0} Days Refill` : 'No Refill',
            type: (d.type === 'Custom Comments' || d.type === 'comments') ? 'comments' : 'default',
            description: d.description || '',
            quality: d.quality || 'Standard Quality',
            placeholder: d.placeholder || 'https://'
          });
        }
      });
      if (dbServices.length > 0) {
        setServices(dbServices);
      }
    });
    return () => unsub();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [filteredServices, setFilteredServices] = useState<Service[]>(
    SERVICES_DB.filter(s => s.categoryId === CATEGORIES[0].id)
  );
  const [selectedService, setSelectedService] = useState<Service>(filteredServices[0]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearchStr, setServiceSearchStr] = useState('');

  const [targetLink, setTargetLink] = useState('');
  const [linkError, setLinkError] = useState('');

  const [quantity, setQuantity] = useState<number>(1000);
  const [quantityError, setQuantityError] = useState('');

  // Custom comments
  const [customComments, setCustomComments] = useState('');

  // Drip Feed state
  const [isDripEnabled, setIsDripEnabled] = useState(false);
  const [dripRuns, setDripRuns] = useState<number>(5);
  const [dripInterval, setDripInterval] = useState<number>(12);

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountRate, setAppliedDiscountRate] = useState<number>(0);
  const [couponStatus, setCouponStatus] = useState<'none' | 'success' | 'invalid'>('none');

  // Order placing execution
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Mini Table recent orders inside New Order screen (local tracking)
  const [miniOrders, setMiniOrders] = useState([
    { id: '#10892', service: 'Instagram Followers', target: 'instagram.com/p/Cvx...', qty: '2,500', cost: '$3.75', status: 'Completed' },
    { id: '#10885', service: 'Instagram Reels Custom Comments', target: 'instagram.com/reel/...', qty: '250', cost: '$2.15', status: 'In Progress' },
  ]);

  // Sync real-time Firestore SMM Reseller services collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snap) => {
      if (!snap.empty) {
        const loaded: Service[] = [];
        snap.forEach((doc) => {
          const val = doc.data();
          loaded.push({
            id: doc.id,
            categoryId: (val.category || '').toLowerCase(),
            name: val.name,
            ratePer1000: val.rate || 0,
            min: val.minOrder || 0,
            max: val.maxOrder || 0,
            speed: val.avgSpeed || 'N/A',
            refill: val.refill ? `${val.refillDays || 30} Days Refill` : 'No Refill',
            type: val.type || 'default',
            description: val.description || '',
            quality: val.status === 'active' ? 'High Quality ✓' : 'Unavailable',
            placeholder: val.placeholder || 'https://link.com'
          });
        });
        setServices(loaded);
      }
    });
    return () => unsub();
  }, []);

  // Load preset service and category if redirecting from services list page
  useEffect(() => {
    const presetId = localStorage.getItem('prosmm_preset_service_id');
    if (presetId) {
      const found = services.find(s => s.id === presetId);
      if (found) {
        const category = CATEGORIES.find(c => c.id === found.categoryId);
        if (category) {
          setSelectedCategory(category);
          const list = services.filter(s => s.categoryId === category.id);
          setFilteredServices(list);
          setSelectedService(found);
          setQuantity(found.min);
        }
      }
      localStorage.removeItem('prosmm_preset_service_id');
      localStorage.removeItem('prosmm_preset_service_name');
    }
  }, [services]);

  // Adjust filtered services when category changes
  useEffect(() => {
    const list = services.filter(s => s.categoryId === selectedCategory.id);
    setFilteredServices(list);
    if (list.length > 0) {
      setSelectedService(list[0]);
      setQuantity(list[0].min);
    }
    setServiceSearchStr('');
  }, [selectedCategory, services]);

  // Dynamic placeholders and constraints adjustment
  useEffect(() => {
    if (selectedService) {
      // Validate bounds of selected service
      if (quantity < selectedService.min) {
        setQuantity(selectedService.min);
      } else if (quantity > selectedService.max) {
        setQuantity(selectedService.max);
      }
    }
  }, [selectedService]);

  // Handle direct changes of comments
  useEffect(() => {
    if (selectedService?.type === 'comments') {
      const lines = customComments.split('\n').filter(line => line.trim() !== '');
      const count = lines.length;
      setQuantity(count || 1);
    }
  }, [customComments, selectedService]);

  // Calculations
  const rawSubtotal = selectedService
    ? (quantity / 1000) * selectedService.ratePer1000
    : 0;

  const totalCampaignMultiplier = isDripEnabled ? dripRuns : 1;
  const campaignSubtotal = rawSubtotal * totalCampaignMultiplier;

  const savedAmount = campaignSubtotal * appliedDiscountRate;
  const finalTotalAmount = Number((campaignSubtotal - savedAmount).toFixed(4));
  const isBalanceSufficient = availableBalance >= finalTotalAmount;

  // URL Validation regex
  const validateUrl = (url: string) => {
    if (!url) {
      setLinkError('Target URL link address is required');
      return false;
    }
    if (selectedCategory.id === 'instagram' && !url.includes('instagram.com')) {
      setLinkError('Must be a valid Instagram URL link');
      return false;
    }
    if (selectedCategory.id === 'tiktok' && !url.includes('tiktok.com')) {
      setLinkError('Must be a valid TikTok account or video link');
      return false;
    }
    if (selectedCategory.id === 'youtube' && !url.includes('youtube.com') && !url.includes('youtu.be')) {
      setLinkError('Must be a valid YouTube channel or video URL');
      return false;
    }
    setLinkError('');
    return true;
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetLink(val);
    if (val) {
      validateUrl(val);
    } else {
      setLinkError('');
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'PRO50') {
      setAppliedDiscountRate(0.5);
      setCouponStatus('success');
    } else if (code === 'SMM20') {
      setAppliedDiscountRate(0.2);
      setCouponStatus('success');
    } else {
      setAppliedDiscountRate(0);
      setCouponStatus('invalid');
    }
  };

  const handleQuantityChange = (val: number) => {
    if (!selectedService) return;
    let actual = val;
    if (actual < selectedService.min) {
      setQuantityError(`Quantity is below service minimum of ${selectedService.min}`);
    } else if (actual > selectedService.max) {
      setQuantityError(`Quantity exceeds service maximum of ${selectedService.max}`);
    } else {
      setQuantityError('');
    }
    setQuantity(actual);
  };

  const executePlaceOrder = async () => {
    // Validate links first
    const isLinkOk = validateUrl(targetLink);
    if (!isLinkOk) return;

    if (quantity < selectedService.min || quantity > selectedService.max) {
      setQuantityError(`Quantity range error`);
      return;
    }

    if (!isBalanceSufficient) {
      return;
    }

    setIsPlacing(true);
    setCurrentStep(3); // confirming

    try {
      const u = auth.currentUser;
      if (!u) {
        setIsPlacing(false);
        setCurrentStep(1);
        alert("Verification error: You must be signed in.");
        return;
      }

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error("Client user profile record missing from Firestore.");
        }

        const userData = userSnap.data();
        const currentBalance = userData.balance || 0.0;
        const currentTotalSpent = userData.totalSpent || 0.0;
        const currentTotalOrders = userData.totalOrders || 0;

        if (currentBalance < finalTotalAmount) {
          throw new Error("Inadequate wallet registers. Please add funds.");
        }

        const finalBalance = Math.max(0, currentBalance - finalTotalAmount);
        const finalSpent = currentTotalSpent + finalTotalAmount;
        const finalOrdersCount = currentTotalOrders + 1;

        // 1. Atomically decrement balance and increment counters
        transaction.update(userRef, {
          balance: finalBalance,
          totalSpent: finalSpent,
          totalOrders: finalOrdersCount
        });

        // 2. Provision new Firestore SMM order
        const ordersColRef = collection(db, 'orders');
        const nextOrderRef = doc(ordersColRef);
        transaction.set(nextOrderRef, {
          userId: u.uid,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          link: targetLink,
          quantity: quantity,
          startCount: 0,
          remains: quantity,
          charge: finalTotalAmount,
          status: 'pending',
          providerOrderId: 'prov-ord-' + Math.random().toString(36).substring(2, 8),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // 3. Document billing transaction item
        const txColRef = collection(db, 'transactions');
        const nextTxRef = doc(txColRef);
        transaction.set(nextTxRef, {
          userId: u.uid,
          type: 'spent',
          amount: finalTotalAmount,
          method: 'wallet',
          status: 'completed',
          reference: nextOrderRef.id,
          note: `SMM Panel Purchase: ${selectedService.name}`,
          createdAt: new Date().toISOString()
        });

        setPlacedOrderId(nextOrderRef.id.substring(0, 10).toUpperCase());

        // Update local session sidebar indicators
        deductBalance(finalTotalAmount);

        // Fallback backward compat triggers
        onOrderSuccess({
          id: `#${nextOrderRef.id.substring(0, 7)}`,
          service: selectedService.name.split(' — ')[0],
          target: targetLink.substring(0, 30) + '...',
          qty: quantity.toLocaleString(),
          price: `$${finalTotalAmount.toFixed(2)}`,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        });

        // Insert locally
        setMiniOrders(prev => [
          {
            id: `#${nextOrderRef.id.substring(0, 7)}`,
            service: selectedService.name.split(' — ')[0],
            target: targetLink.substring(0, 30) + (targetLink.length > 30 ? '...' : ''),
            qty: quantity.toLocaleString(),
            cost: `$${finalTotalAmount.toFixed(2)}`,
            status: 'Pending'
          },
          ...prev
        ]);
      });

      setIsPlacing(false);
      setCurrentStep(4); // success screen!
    } catch (e: any) {
      setIsPlacing(false);
      setCurrentStep(1);
      alert('Transaction aborted: ' + e.message);
    }
  };

  const resetOrderForm = () => {
    setTargetLink('');
    setCustomComments('');
    setIsDripEnabled(false);
    setCouponCode('');
    setAppliedDiscountRate(0);
    setCouponStatus('none');
    setCurrentStep(1);
    setQuantity(selectedService ? selectedService.min : 100);
  };

  return (
    <div className="space-y-7 animate-fade-in text-left">
      {/* STEP INDICATOR CONTAINER */}
      <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-4.5 shadow-md flex items-center justify-between select-none">
        {[
          { step: 1, label: 'Select Service' },
          { step: 2, label: 'Enter Details' },
          { step: 3, label: 'Confirm System' },
          { step: 4, label: 'Done' }
        ].map((item) => {
          const isPassed = currentStep > item.step;
          const isActive = currentStep === item.step;
          return (
            <div key={item.step} className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                  isPassed
                    ? 'bg-brand-success text-[#0A0B0F]'
                    : isActive
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 shadow-md shadow-brand-primary/20'
                    : 'bg-[#12141A] text-brand-text-secondary border border-brand-border/40'
                }`}
              >
                {isPassed ? <Check size={14} strokeWidth={3} /> : item.step}
              </div>
              <span
                className={`text-xs font-bold leading-none hidden sm:inline ${
                  isActive ? 'text-white' : 'text-brand-text-secondary'
                }`}
              >
                {item.label}
              </span>
              {item.step < 4 && (
                <div className="w-8 md:w-16 h-px bg-[#252836] ml-3 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {currentStep < 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE FORM AREA */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* STEP 1: SERVICE SPECIFICATION CARD */}
            <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#252836]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00D4FF]">Category & service specifications</span>
              </div>

              {/* Styled Category Selector Dropdown */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-bold text-[#9BA3C7] uppercase tracking-widest">
                  Target Social Platform
                </label>
                <button
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsServiceDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between bg-[#12141A] hover:bg-[#12141A]/80 text-white text-xs border border-[#252836] hover:border-brand-primary/50 py-3.5 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedCategory.dotColor}`} />
                    <span className="font-bold text-white text-sm">{selectedCategory.name}</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute w-full top-[75px] bg-[#12141A] border border-[#252836] rounded-xl overflow-hidden shadow-2xl z-50 p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto"
                      >
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              selectedCategory.id === cat.id
                                ? 'bg-brand-primary/10 text-white'
                                : 'text-brand-text-secondary hover:text-white hover:bg-white/4'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                              <span>{cat.name}</span>
                            </div>
                            {selectedCategory.id === cat.id && <Check size={14} className="text-brand-cyan" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Searchable Service Selector */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-bold text-[#9BA3C7] uppercase tracking-widest">
                  Reseller Pipeline Service
                </label>
                <button
                  onClick={() => {
                    setIsServiceDropdownOpen(!isServiceDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between bg-[#12141A] hover:bg-[#12141A]/80 text-white text-xs border border-[#252836] hover:border-brand-primary/50 py-3.5 px-4 rounded-xl cursor-pointer transition-colors text-left"
                >
                  <span className="truncate pr-4 font-bold text-slate-100 text-sm">
                    [{selectedService?.id}] {selectedService?.name}
                  </span>
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {isServiceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsServiceDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute w-full top-[75px] bg-[#12141A] border border-[#252836] rounded-xl overflow-hidden shadow-2xl z-50 p-2 flex flex-col gap-2 max-h-72 overflow-y-auto"
                      >
                        {/* Internal Search field inside selector */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type to filter services..."
                            value={serviceSearchStr}
                            onChange={(e) => setServiceSearchStr(e.target.value)}
                            className="w-full bg-[#1A1D26] border border-[#252836] rounded-lg py-2 pl-3 pr-8 text-xs text-white outline-none focus:border-brand-primary placeholder:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
                          {filteredServices
                            .filter(s => s.name.toLowerCase().includes(serviceSearchStr.toLowerCase()) || s.id.includes(serviceSearchStr))
                            .map((service) => (
                              <button
                                key={service.id}
                                onClick={() => {
                                  setSelectedService(service);
                                  setIsServiceDropdownOpen(false);
                                }}
                                className={`w-full text-left p-3.5 rounded-lg text-xs leading-relaxed flex flex-col gap-1 cursor-pointer transition-colors ${
                                  selectedService?.id === service.id
                                    ? 'bg-brand-primary/15 border-l-2 border-brand-cyan text-white'
                                    : 'text-brand-text-secondary hover:text-white hover:bg-white/4'
                                }`}
                              >
                                <span className="font-bold text-white text-[13px]">[ID {service.id}] {service.name}</span>
                                <div className="flex justify-between text-[11px] font-mono text-brand-cyan mt-1">
                                  <span>Rate: ${service.ratePer1000.toFixed(2)}/1000</span>
                                  <span>Min: {service.min.toLocaleString()} | Max: {service.max.toLocaleString()}</span>
                                </div>
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* DYNAMIC SERVICE METRICS CARD */}
              {selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#12141A] border border-[#252836]/75 rounded-xl p-4.5 flex flex-col gap-3.5"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-brand-cyan uppercase bg-brand-cyan/8 px-2 py-0.5 rounded border border-brand-cyan/25">
                        SERVICE ID #{selectedService.id}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                        {selectedService.quality}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-white">
                      Rate: <span className="text-brand-warning">${selectedService.ratePer1000.toFixed(2)}</span> / 1,000 unit
                    </span>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    {selectedService.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-bold text-white/95">
                    <div className="bg-[#1A1D26]/60 p-2 border border-[#252836]/40 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-brand-text-secondary uppercase">API Speed</span>
                      <span className="text-brand-cyan flex items-center gap-1">
                        <Clock size={11} /> {selectedService.speed}
                      </span>
                    </div>
                    <div className="bg-[#1A1D26]/60 p-2 border border-[#252836]/40 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-brand-text-secondary uppercase">Refill policy</span>
                      <span className="text-brand-success flex items-center gap-1">
                        <Shield size={11} /> {selectedService.refill}
                      </span>
                    </div>
                    <div className="bg-[#1A1D26]/60 p-2 border border-[#252836]/40 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-brand-text-secondary uppercase">Order Limit</span>
                      <span className="text-[#9b5de5]">
                        {selectedService.min} - {selectedService.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-[#1A1D26]/60 p-2 border border-[#252836]/40 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-brand-text-secondary uppercase">Pipeline Type</span>
                      <span className="text-brand-warning capitalize">
                        {selectedService.type === 'comments' ? 'Custom Comments' : 'API Autoreflow'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* STEP 2: LINK & QUANTITY DETAIL SPECIFICATION */}
            <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#252836]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan">Campaign Details inputs</span>
              </div>

              {/* Link Input Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#9BA3C7] uppercase tracking-widest flex items-center gap-1.5">
                    <LinkIcon size={12} className="text-brand-primary" />
                    <span>Destination Link / Target handle URL</span>
                  </label>
                  {selectedCategory && (
                    <span className="text-[10px] text-[#858da8] font-bold">
                      Must match {selectedCategory.name} format
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={targetLink}
                    onChange={handleLinkChange}
                    placeholder={selectedService?.placeholder || 'https://link.com/target'}
                    className={`w-full bg-[#12141A] border py-3.5 px-4 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder:text-gray-600 transition-all ${
                      linkError ? 'border-brand-danger focus:ring-brand-danger/30' : 'border-brand-border/80 focus:border-transparent'
                    }`}
                  />
                  {linkError && (
                    <div className="flex items-center gap-1 text-[11px] text-brand-danger font-bold mt-1.5">
                      <AlertCircle size={12} />
                      <span>{linkError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* IF Custom comments pack */}
              {selectedService?.type === 'comments' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-[#9BA3C7] uppercase tracking-widest">
                      Custom Comment Textlines (One per line)
                    </label>
                    <span className="text-[10px] font-mono text-brand-cyan">
                      {customComments.split('\n').filter(l => l.trim() !== '').length} comments detected
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={customComments}
                    onChange={(e) => setCustomComments(e.target.value)}
                    placeholder="Perfect post! &#10;Keep grinding! &#10;Impressive stats here."
                    className="w-full bg-[#12141A] border border-brand-border/80 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary placeholder:text-gray-700 font-medium"
                  />
                  <span className="text-[10px] text-[#858da8] leading-relaxed">
                    *Quantity defaults to comment lines. Min {selectedService.min}, Max {selectedService.max}.
                  </span>
                </div>
              )}

              {/* Quantity Input Field */}
              {selectedService?.type !== 'comments' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-[#9BA3C7] uppercase tracking-widest">
                      Order Quantity
                    </label>
                    <span className="text-[10px] text-brand-text-secondary font-bold">
                      Min: {selectedService?.min.toLocaleString()} | Max: {selectedService?.max.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(Math.max(selectedService?.min || 100, quantity - (selectedService?.min || 100)))}
                      className="bg-[#12141A] hover:bg-[#12141A]/80 text-gray-300 w-12 h-11 rounded-lg flex items-center justify-center border border-[#252836] cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={quantity || ''}
                        onChange={(e) => handleQuantityChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className={`w-full text-center bg-[#12141A] border py-3.5 rounded-xl text-sm font-extrabold text-white outline-none ${
                          quantityError ? 'border-brand-danger' : 'border-brand-border/80 focus:border-brand-primary'
                        }`}
                      />
                      <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-brand-cyan tracking-wider font-mono">
                        Units
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(Math.min(selectedService?.max || 10000, quantity + (selectedService?.min || 100)))}
                      className="bg-[#12141A] hover:bg-[#12141A]/80 text-gray-300 w-12 h-11 rounded-lg flex items-center justify-center border border-[#252836] cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {quantityError && (
                    <div className="flex items-center gap-1 text-[11px] text-brand-danger font-bold mt-1.5">
                      <AlertCircle size={12} />
                      <span>{quantityError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Drip Feed Toggle */}
              <div className="border-t border-[#252836]/40 pt-4.5 flex flex-col gap-4">
                <div className="flex items-center justify-between select-none">
                  <div className="flex flex-col gap-0.5">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Enable Reseller Drip Feed</span>
                      <span className="text-[8px] tracking-widest font-bold uppercase bg-brand-primary/15 text-brand-cyan border border-brand-primary/30 py-0.5 px-1.5 rounded">
                        API Beta
                      </span>
                    </h5>
                    <p className="text-[11px] text-brand-text-secondary leading-normal max-w-sm">
                      Deliver the total order volume incrementally across multiple automated sessions over days.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDripEnabled(!isDripEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative duration-200 ${
                      isDripEnabled ? 'bg-brand-primary' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-all transform ${
                        isDripEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {isDripEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 bg-[#12141A] border border-[#252836]/50 p-4 rounded-xl"
                    >
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-[#9BA3C7] uppercase tracking-wider">
                          Interval Runs Count
                        </label>
                        <input
                          type="number"
                          value={dripRuns}
                          min={2}
                          max={50}
                          onChange={(e) => setDripRuns(Math.max(2, parseInt(e.target.value) || 2))}
                          className="w-full bg-[#1A1D26] border border-brand-border/40 py-2.5 px-3 rounded-lg text-xs font-bold text-white outline-none"
                        />
                        <span className="text-[9px] text-[#858da8]">Total runs sequence</span>
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-[#9BA3C7] uppercase tracking-wider">
                          Drip Delay (Hours)
                        </label>
                        <input
                          type="number"
                          value={dripInterval}
                          min={1}
                          max={168}
                          onChange={(e) => setDripInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-[#1A1D26] border border-brand-border/40 py-2.5 px-3 rounded-lg text-xs font-bold text-white outline-none"
                        />
                        <span className="text-[9px] text-[#858da8]">Interval between runs</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: REVENUE SUMMARY BLOCK (STICKY) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[90px] flex flex-col gap-6">
            
            {/* ORDER SUMMARY CARD */}
            <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#252836]">
                <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand-warning" />
                  <span>Pipeline Summary Ledger</span>
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${selectedCategory.color}`}>
                  {selectedCategory.name}
                </span>
              </div>

              {/* Breakdown metrics list */}
              <div className="flex flex-col gap-3 font-medium text-xs text-brand-text-secondary">
                <div className="flex justify-between items-start gap-2">
                  <span className="shrink-0 text-slate-400">Core Service:</span>
                  <span className="text-right text-white font-bold leading-relaxed truncate max-w-[180px]">
                    {selectedService ? selectedService.name.split(' — ')[0] : 'None selected'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-[#252836]/40">
                  <span className="text-slate-400">Target Dest:</span>
                  <span className="text-brand-cyan max-w-[180px] font-mono text-[11px] truncate">
                    {targetLink ? targetLink : 'No destination entered'}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span>Unit Quantity:</span>
                  <span className="text-white font-bold font-mono">{quantity.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Rate Base (unit):</span>
                  <span className="text-white font-mono">${selectedService?.ratePer1000.toFixed(2)}/1000</span>
                </div>

                {isDripEnabled && (
                  <div className="bg-brand-primary/5 py-2 px-3 border border-brand-primary/10 rounded-lg flex flex-col gap-1 mt-1 text-[11px]">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Drip Campaign Cycle:</span>
                      <span>Active</span>
                    </div>
                    <div className="flex justify-between text-[#858da8]">
                      <span>Runs Counter:</span>
                      <span>{dripRuns} x {quantity.toLocaleString()} quantity</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-t border-[#252836]/40 mt-1">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-white font-extrabold font-mono">${campaignSubtotal.toFixed(2)}</span>
                </div>

                {/* DISCOUNT */}
                {appliedDiscountRate > 0 && (
                  <div className="flex justify-between items-center text-brand-success font-semibold">
                    <span>Coupon Save ({(appliedDiscountRate * 100)}%):</span>
                    <span className="font-mono">-${savedAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-[#252836]/80 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-white uppercase tracking-wider">Total Charge</span>
                  <span className="text-2xl font-black text-white tracking-tight font-mono">
                    ${finalTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* WALLET BALANCE COMPARISON */}
              <div className="bg-[#12141A] border border-brand-border/40 p-4.5 rounded-xl flex flex-col gap-3.5 mt-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Available Wallet:</span>
                  <span className="text-white font-mono">${availableBalance.toFixed(2)}</span>
                </div>

                {isBalanceSufficient ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-emerald-400">
                      <span>Remaining Balance:</span>
                      <span className="font-mono">${(availableBalance - finalTotalAmount).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00C896] rounded-full" style={{ width: `${Math.max(1, ((availableBalance - finalTotalAmount) / availableBalance) * 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-1 text-[11px] text-[#FF4757]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle size={14} />
                      <span>Wallet Balance resides low!</span>
                    </div>
                    <p className="text-[10px] text-brand-text-secondary leading-relaxed">
                      Please credit your payment gateway. Top up at least ${(finalTotalAmount - availableBalance).toFixed(2)} to trigger pipeline.
                    </p>
                  </div>
                )}
              </div>

              {/* COUPON ENTER SECTION */}
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#252836]/40">
                <label className="text-[10px] font-bold text-[#9BA3C7] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={12} className="text-brand-cyan" />
                  <span>Promotional Coupon Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponStatus !== 'none') setCouponStatus('none');
                    }}
                    placeholder="e.g. PRO50 (50% Off)"
                    className="flex-1 bg-[#12141A] border border-brand-border/40 uppercase py-2 px-3.5 rounded-xl text-xs text-white outline-none placeholder:text-gray-600 focus:border-brand-primary"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#12141A]/90 hover:bg-[#12141A] text-white border border-[#252836] hover:border-brand-cyan hover:text-brand-cyan py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponStatus === 'success' && (
                  <span className="text-[10px] font-bold text-brand-success">
                    ✓ Valid coupon applied! Promo code saving enabled.
                  </span>
                )}
                {couponStatus === 'invalid' && (
                  <span className="text-[10px] font-semibold text-brand-danger">
                    ✕ Promo code is invalid or expired. Try "PRO50".
                  </span>
                )}
              </div>

              {/* MAIN ORDER SUBMISSION BUTTON */}
              <button
                onClick={executePlaceOrder}
                disabled={isPlacing || !isBalanceSufficient || !targetLink || !!linkError || !!quantityError}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold shadow-lg select-none cursor-pointer tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-4.5 ${
                  isPlacing
                    ? 'bg-brand-primary/50 text-white/50 cursor-not-allowed shadow-none'
                    : isBalanceSufficient && targetLink && !linkError && !quantityError
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:scale-[1.01] hover:brightness-105 hover:shadow-[#6C63FF]/20 text-white active:scale-[0.99]'
                    : 'bg-[#252836] text-gray-500 cursor-not-allowed border border-[#252836] shadow-none'
                }`}
              >
                {isPlacing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Configuring Pipeline Key...</span>
                  </>
                ) : (
                  <>
                    <span>Execute SMM Order</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      ) : (
        /* STEP 4: SUCCESS OVERLAY FEEDBACK FLOW */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1A1D26] border border-[#252836] rounded-2xl w-full max-w-xl mx-auto p-10 flex flex-col items-center gap-6 shadow-2xl relative"
        >
          {/* Animated Success SVG Accent Ring */}
          <div className="w-20 h-20 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-[#00C896] shadow-xl shadow-brand-success/5">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 text-center">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              SMM Order Placed Successfully!
            </h2>
            <p className="text-xs text-brand-text-secondary">
              The professional reseller server nodes have received your parameters.
            </p>
          </div>

          {/* SMM Receipt Ledger details block */}
          <div className="w-full bg-[#12141A] rounded-xl border border-brand-border/60 p-5 mt-2 flex flex-col gap-3 text-xs leading-relaxed max-w-md">
            <div className="flex justify-between py-1 border-b border-[#252836]/40 text-[#00D4FF] font-bold">
              <span>Order Reference ID:</span>
              <span className="font-mono text-white">#{placedOrderId}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Active Service:</span>
              <span className="text-white font-semibold pr-1 max-w-[200px] truncate">{selectedService?.name.split(' — ')[0]}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Target URL Link:</span>
              <span className="text-brand-cyan max-w-[220px] truncate font-mono h-fit">{targetLink}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Units Loaded:</span>
              <span className="text-white font-mono">{quantity.toLocaleString()} items</span>
            </div>

            {isDripEnabled && (
              <div className="flex justify-between py-1 text-purple-400">
                <span>Drip Runs Count:</span>
                <span>{dripRuns} batches</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#252836]/40 text-sm font-bold">
              <span className="text-slate-400">Prepaid Deducted cost:</span>
              <span className="text-white font-mono text-brand-warning">${finalTotalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md select-none mt-4">
            <button
              onClick={() => resetOrderForm()}
              className="flex-1 py-3 bg-[#12141A] hover:bg-black border border-brand-border text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Order Another Campaign
            </button>
            <button
              onClick={() => {
                resetOrderForm();
                // Navigate to order history logs
                const navBtn = document.querySelector('button[key="orders"]') as HTMLButtonElement;
                if (navBtn) navBtn.click();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:opacity-95 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer text-center"
            >
              View Campaign Registry
            </button>
          </div>
        </motion.div>
      )}

      {/* RECENT ORDERS LOGS MINI TABLE */}
      <div className="bg-[#1A1D26] border border-[#252836] rounded-2xl p-5 shadow-lg flex flex-col gap-4.5">
        <div className="flex justify-between items-center pb-2 border-b border-[#252836]">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-[#00D4FF]" />
            <span>Active campaign live monitor</span>
          </h4>
          <span className="text-[10px] text-brand-text-secondary font-bold select-none">
            Updated just now
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#252836] bg-[#12141A] text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest select-none">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Target Channel Service</th>
                <th className="py-3 px-4">URL Handle Destination</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Cost value</th>
                <th className="py-3 px-4">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252836]/40 text-xs font-medium text-gray-200">
              {miniOrders.map((ord, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01] transition-all leading-normal">
                  <td className="py-3 px-4 font-mono text-gray-400">{ord.id}</td>
                  <td className="py-3 px-4 text-white font-semibold">{ord.service}</td>
                  <td className="py-3 px-4 text-brand-cyan font-mono text-[11px] truncate max-w-[170px]">
                    {ord.target}
                  </td>
                  <td className="py-3 px-4 font-mono">{ord.qty}</td>
                  <td className="py-3 px-4 text-white font-bold">{ord.cost}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] uppercase font-bold py-0.5 px-2 rounded-md border ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-500/10 text-brand-success border-emerald-500/15'
                          : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/15'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
