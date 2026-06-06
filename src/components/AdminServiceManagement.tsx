import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  ArrowDownToLine,
  Percent,
  Download,
  Search,
  SlidersHorizontal,
  ChevronDown,
  GripVertical,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  Edit2,
  Copy,
  BarChart3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  Check,
  X,
  Sparkles,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers3,
  RefreshCw,
  Clock,
  Zap,
  Globe,
  Tag
} from 'lucide-react';

interface SMMService {
  id: string;
  name: string;
  category: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'Twitter' | 'Telegram' | 'Spotify' | 'Others';
  type: 'Default' | 'Drip Feed' | 'Custom Comments';
  rate: number; // your selling price per 1000
  min: number;
  max: number;
  provider: string;
  providerServiceId: string;
  providerRate: number; // cost from provider per 1000
  totalOrders: number;
  status: 'Active' | 'Paused' | 'Disabled';
  refill: boolean;
  refillDays: number;
  allowCancel: boolean;
  allowDrip: boolean;
  avgSpeed: string;
  avgTime: string;
  quality: 'Real & Active' | 'High Quality' | 'Mixed' | 'Bot';
  position: number;
  featured: boolean;
  isNew: boolean;
  customNote: string;
  description: string;
}

interface AdminServiceManagementProps {
  onShowToast: (msg: string) => void;
}

// Highly detailed initial mock services dataset

export default function AdminServiceManagement({ onShowToast }: AdminServiceManagementProps) {
  const [services, setServices] = useState<SMMService[]>([]);
  
  useEffect(() => {
    import('../firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const unsub = onSnapshot(collection(db, 'services'), (snap) => {
          const dbServices: SMMService[] = [];
          snap.forEach(doc => {
            const d = doc.data();
            dbServices.push({
              id: doc.id,
              name: d.name || '',
              category: d.category || 'Instagram',
              type: d.type || 'Default',
              rate: d.rate || 0,
              min: d.minOrder || d.min || 0,
              max: d.maxOrder || d.max || 0,
              provider: d.providerId || d.provider || '',
              providerServiceId: d.providerServiceId || '',
              providerRate: d.providerRate || 0,
              totalOrders: d.totalOrders || 0,
              status: d.status || 'Active',
              refill: d.refill || false,
              refillDays: d.refillDays || 0,
              allowCancel: d.allowCancel || false,
              allowDrip: d.allowDrip || false,
              avgSpeed: d.avgSpeed || 'Normal',
              avgTime: d.avgTime || '',
              quality: d.quality || 'Standard',
              position: d.position || 0,
              featured: d.featured || false,
              isNew: d.isNew || false,
              customNote: d.customNote || '',
              description: d.description || ''
            });
          });
          setServices(dbServices);
        });
        return () => unsub();
      });
    });
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Tabs and search filters
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'rate' | 'totalOrders'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Inline editing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [inlineRate, setInlineRate] = useState<number>(0);

  // Bulk operation variables
  const [bulkPriceChangePercent, setBulkPriceChangePercent] = useState('10');
  const [bulkPriceAction, setBulkPriceAction] = useState<'increase' | 'decrease'>('increase');
  const [showBulkPricePanel, setShowBulkPricePanel] = useState(false);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditService, setCurrentEditService] = useState<SMMService | null>(null);
  const [modalTab, setModalTab] = useState<'basic' | 'price' | 'features' | 'display'>('basic');

  // Import from Provider Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSelectedProvider, setImportSelectedProvider] = useState('SMMKing Panel');
  const [importLoading, setImportLoading] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [importMarkup, setImportMarkup] = useState('50'); // 50% default markup
  const [importCheckedIds, setImportCheckedIds] = useState<string[]>([]);
  
  // Stats view Modal
  const [statsViewService, setStatsViewService] = useState<SMMService | null>(null);

  // Simulated provider services to import
  const MOCK_PROVIDER_SERVICES = [
    { id: "p1", name: "Instagram Reels Views [Organic Post Loop] [Instant]", category: "Instagram" as const, cost: 0.18, speed: "50K/hr" },
    { id: "p2", name: "YouTube Premium High Retention Subscribers [Safe]", category: "YouTube" as const, cost: 18.50, speed: "500/day" },
    { id: "p3", name: "TikTok Share Campaign Node [5M Direct Feed]", category: "TikTok" as const, cost: 0.45, speed: "1M/day" },
    { id: "p4", name: "Twitter Custom Sentiment Replies [GPT-4 Powered]", category: "Twitter" as const, cost: 12.00, speed: "200/day" },
    { id: "p5", name: "Spotify Songs Plays - Album Boost [Organic Search]", category: "Spotify" as const, cost: 2.10, speed: "10K/day" },
    { id: "p6", name: "Telegram Group Active Real Members [Targeted Eng]", category: "Telegram" as const, cost: 3.40, speed: "2K/day" }
  ];

  // Forms states for Add/Edit
  const [formData, setFormData] = useState<Partial<SMMService>>({
    name: '',
    category: 'Instagram',
    type: 'Default',
    rate: 2.50,
    min: 50,
    max: 10000,
    provider: 'SMMKing Panel',
    providerServiceId: '',
    providerRate: 1.20,
    status: 'Active',
    refill: true,
    refillDays: 30,
    allowCancel: true,
    allowDrip: false,
    avgSpeed: '5,000/day',
    avgTime: '30 min',
    quality: 'High Quality',
    position: 9,
    featured: false,
    isNew: true,
    customNote: '',
    description: ''
  });

  // Calculate statistics counts by category tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: services.length };
    const categories = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Telegram', 'Spotify', 'Others'];
    categories.forEach(cat => {
      counts[cat] = services.filter(s => s.category === cat).length;
    });
    return counts;
  }, [services]);

  // Handle individual toggle switches
  const handleToggleStatus = (id: string, currentStatus: SMMService['status']) => {
    const nextStatus: SMMService['status'] = currentStatus === 'Active' ? 'Paused' : 'Active';
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    onShowToast(`Service [${id}] status changed to ${nextStatus}.`);
  };

  // Inline editing save handles
  const handleSaveInlineName = (id: string) => {
    if (inlineName.trim()) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, name: inlineName } : s));
      onShowToast(`Successfully updated service title.`);
    }
    setEditingServiceId(null);
  };

  const handleSaveInlineRate = (id: string) => {
    if (inlineRate > 0) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, rate: Number(inlineRate.toFixed(4)) } : s));
      onShowToast(`Pricing modified successfully for service [${id}].`);
    }
    setEditingRateId(null);
  };

  // Move position helper sort order
  const handleMovePosition = (id: string, direction: 'up' | 'down') => {
    const idx = services.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === services.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const nextServices = [...services];
    // swap positions
    const tempPos = nextServices[idx].position;
    nextServices[idx].position = nextServices[targetIdx].position;
    nextServices[targetIdx].position = tempPos;

    // swap items
    const tempVal = nextServices[idx];
    nextServices[idx] = nextServices[targetIdx];
    nextServices[targetIdx] = tempVal;

    setServices(nextServices);
    onShowToast(`Service sorted position adjusted.`);
  };

  // Clone service trigger
  const handleCloneService = (service: SMMService) => {
    const newId = `SVC-${Math.floor(100 + Math.random() * 899)}`;
    const cloned: SMMService = {
      ...service,
      id: newId,
      name: `${service.name} - Duplicate Client Feed`,
      position: services.length + 1,
      totalOrders: 0,
      isNew: true
    };
    setServices(prev => [...prev, cloned]);
    onShowToast(`Cloned [${service.id}] into new service [${newId}] successfully.`);
  };

  // Delete service trigger
  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setSelectedIds(prev => prev.filter(selId => selId !== id));
    onShowToast(`Service [${id}] purged from SMM listings.`);
  };

  // Checkbox multi selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAndSortedServices.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Actions
  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'Active' } : s));
    onShowToast(`Multi-update: Activated ${selectedIds.length} services.`);
    setSelectedIds([]);
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'Disabled' } : s));
    onShowToast(`Multi-update: Disabled ${selectedIds.length} services.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.filter(s => !selectedIds.includes(s.id)));
    onShowToast(`Multi-delete: Removed ${selectedIds.length} services.`);
    setSelectedIds([]);
  };

  const handleBulkPriceAdjustment = () => {
    const percent = parseFloat(bulkPriceChangePercent);
    if (isNaN(percent) || percent <= 0) {
      onShowToast("Invalid multiplier percentage entered.");
      return;
    }
    setServices(prev => prev.map(s => {
      // Modify either selected or all matching active filters
      const targetList = selectedIds.length > 0 ? selectedIds : filteredAndSortedServices.map(item => item.id);
      if (targetList.includes(s.id)) {
        const factor = bulkPriceAction === 'increase' ? (1 + percent / 100) : (1 - percent / 100);
        return {
          ...s,
          rate: Number(Math.max(0.01, s.rate * factor).toFixed(3))
        };
      }
      return s;
    }));
    onShowToast(`Adjusted price grids by ${bulkPriceAction === 'increase' ? '+' : '-'}${percent}% scale.`);
    setShowBulkPricePanel(false);
    setSelectedIds([]);
  };

  // Filter & Search computation
  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Category Tabs filter
    if (activeTab !== 'All') {
      result = result.filter(s => s.category === activeTab);
    }

    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.providerServiceId.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Service type filter
    if (typeFilter !== 'All') {
      result = result.filter(s => s.type === typeFilter);
    }

    // Provider filter
    if (providerFilter !== 'All') {
      result = result.filter(s => s.provider === providerFilter);
    }

    // Sorting parameters
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rate') {
        comparison = a.rate - b.rate;
      } else if (sortBy === 'totalOrders') {
        comparison = a.totalOrders - b.totalOrders;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [services, activeTab, searchTerm, statusFilter, typeFilter, providerFilter, sortBy, sortDirection]);

  // Form Submission
  const handleOpenAddModal = () => {
    setCurrentEditService(null);
    setModalTab('basic');
    setFormData({
      name: '',
      category: 'Instagram',
      type: 'Default',
      rate: 2.00,
      min: 50,
      max: 50000,
      provider: 'SMMKing Panel',
      providerServiceId: '',
      providerRate: 0.95,
      status: 'Active',
      refill: true,
      refillDays: 30,
      allowCancel: true,
      allowDrip: false,
      avgSpeed: '10,000/day',
      avgTime: '20 min',
      quality: 'High Quality',
      position: services.length + 1,
      featured: false,
      isNew: true,
      customNote: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: SMMService) => {
    setCurrentEditService(service);
    setModalTab('basic');
    setFormData({ ...service });
    setIsModalOpen(true);
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      onShowToast("Service Name is mandatory.");
      return;
    }

    if (currentEditService) {
      // Editing
      setServices(prev => prev.map(s => s.id === currentEditService.id ? (formData as SMMService) : s));
      onShowToast(`Service [${currentEditService.id}] overwritten securely.`);
    } else {
      // Creating
      const newId = `SVC-${Math.floor(100 + Math.random() * 899)}`;
      const newService: SMMService = {
        ...(formData as SMMService),
        id: newId,
        totalOrders: 0,
        position: services.length + 1
      };
      setServices(prev => [...prev, newService]);
      onShowToast(`Successfully added brand new SMM service: ${newId}`);
    }
    setIsModalOpen(false);
  };

  // Provider service import simulation fetch trigger
  const handleFetchProviderServices = () => {
    setImportLoading(true);
    setImportCheckedIds([]);
    onShowToast(`Resolving gateway APIs, obtaining listed feeds for ${importSelectedProvider}...`);
    setTimeout(() => {
      setImportLoading(false);
      onShowToast("Importable services fetched successfully.");
    }, 1200);
  };

  const handleImportCheckedServicesAction = () => {
    if (importCheckedIds.length === 0) {
      onShowToast("Choose at least one checkmark before importing.");
      return;
    }
    const markupMultiplier = 1 + parseFloat(importMarkup) / 100;
    
    const newImported: SMMService[] = MOCK_PROVIDER_SERVICES
      .filter(item => importCheckedIds.includes(item.id))
      .map((item, index) => {
        const genId = `SVC-${Math.floor(250 + Math.random() * 700)}`;
        const sellRate = Number((item.cost * markupMultiplier).toFixed(3));
        return {
          id: genId,
          name: `${item.name} (${importSelectedProvider})`,
          category: item.category,
          type: 'Default',
          rate: sellRate,
          min: 100,
          max: 50000,
          provider: importSelectedProvider,
          providerServiceId: `PRV-${Math.floor(125000 + Math.random() * 92000)}`,
          providerRate: item.cost,
          totalOrders: 0,
          status: 'Active',
          refill: true,
          refillDays: 30,
          allowCancel: true,
          allowDrip: true,
          avgSpeed: item.speed,
          avgTime: '15 min',
          quality: 'High Quality',
          position: services.length + index + 1,
          featured: false,
          isNew: true,
          customNote: 'Directly imported from provider channel.',
          description: `Self-synchronized API connection node feeds directly via ${importSelectedProvider}.`
        };
      });

    setServices(prev => [...prev, ...newImported]);
    onShowToast(`Successfully integrated ${newImported.length} API-synced campaigns.`);
    setIsImportModalOpen(false);
  };

  // Modal Markup and dynamic profit calculator helpers
  const calculatedMarkup = useMemo(() => {
    const buy = formData.providerRate || 0;
    const sell = formData.rate || 0;
    if (buy <= 0) return 0;
    return Math.round(((sell - buy) / buy) * 100);
  }, [formData.rate, formData.providerRate]);

  const calculatedProfit = useMemo(() => {
    const buy = formData.providerRate || 0;
    const sell = formData.rate || 0;
    return Math.max(0, sell - buy);
  }, [formData.rate, formData.providerRate]);

  return (
    <div className="space-y-6">

      {/* PAGE HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1A1D26] p-5 rounded-2xl border border-[#1E2230] shadow-sm">
        <div>
          <h2 className="text-base font-black tracking-widest uppercase text-white leading-normal flex items-center gap-2">
            <Layers size={18} className="text-[#6C63FF]" />
            Service Management Terminal
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-gray-500">
            <span>Core Database Matrix:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px]">
              {services.length} Total Services Active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 transition-all cursor-pointer uppercase tracking-tight"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
          
          <button
            onClick={() => {
              setImportCheckedIds([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black text-brand-cyan bg-[#00D4FF]/10 hover:bg-[#00D4FF]/25 border border-[#00D4FF]/20 transition-all cursor-pointer uppercase tracking-tight"
          >
            <ArrowDownToLine size={14} />
            <span>Import from Provider</span>
          </button>

          <button
            onClick={() => setShowBulkPricePanel(!showBulkPricePanel)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer uppercase tracking-tight"
          >
            <Percent size={14} />
            <span>Bulk Update Prices</span>
          </button>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(services, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "prosmm_services_manifest.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              onShowToast("JSON Config backup file generated successfully.");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black text-gray-400 bg-gray-500/10 hover:bg-gray-500/15 border border-gray-500/10 transition-all cursor-pointer uppercase tracking-tight"
          >
            <Download size={14} />
            <span>Export Config</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC CATEGORY TABS ROW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none">
        {['All', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Telegram', 'Spotify', 'Others'].map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab] || 0;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-black transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#6C63FF] text-white border-transparent shadow shadow-[#6C63FF]/15'
                  : 'bg-[#1A1D26] text-gray-400 border-[#1E2230] hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white text-[#6C63FF]' : 'bg-[#12141A] text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ADVANCED BULK MULTIPLIER AND VALUE ADJUSTMENT SLIDE */}
      <AnimatePresence>
        {showBulkPricePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#1A1D26] border border-[#252836] p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Info size={16} className="text-amber-500 shrink-0" />
                <p className="text-[11px] font-bold text-gray-300">
                  Adjust selling rates grid for <strong className="text-brand-cyan">{selectedIds.length > 0 ? `${selectedIds.length} checked` : `all ${filteredAndSortedServices.length} filtered`} SMM listings:</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={bulkPriceAction}
                  onChange={(e) => setBulkPriceAction(e.target.value as any)}
                  className="bg-[#12141A] border border-[#252836] text-[10.5px] font-black uppercase text-gray-400 rounded-lg h-9 px-2.5 focus:outline-none"
                >
                  <option value="increase">Markup Increase (+)</option>
                  <option value="decrease">Discount Decrease (-)</option>
                </select>

                <div className="flex items-center bg-[#12141A] border border-[#252836] rounded-lg h-9 overflow-hidden px-2 w-28">
                  <input
                    type="number"
                    value={bulkPriceChangePercent}
                    onChange={(e) => setBulkPriceChangePercent(e.target.value)}
                    placeholder="10"
                    className="w-full text-center bg-transparent border-none text-[11px] font-bold text-white focus:outline-none"
                  />
                  <span className="text-gray-500 text-[10px] font-bold select-none">%</span>
                </div>

                <button
                  onClick={handleBulkPriceAdjustment}
                  className="h-9 px-4.5 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white text-[10.5px] font-black uppercase tracking-tight transition-all cursor-pointer"
                >
                  Execute Price Update
                </button>
                
                <button
                  onClick={() => setShowBulkPricePanel(false)}
                  className="text-xs text-gray-500 hover:text-white font-bold ml-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND ADVANCED FILTERS GRID */}
      <div className="bg-[#1A1D26] border border-[#1E2230] p-4 rounded-2xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Query match inputs */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name keywords, provider IDs..."
              className="w-full bg-[#12141A] border border-[#252836] hover:border-[#6C63FF]/30 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-all"
            />
          </div>

          {/* Status selector */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9.5 bg-[#12141A] border border-[#252836] rounded-xl px-3 text-[10.5px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active only</option>
              <option value="Paused">Paused only</option>
              <option value="Disabled">Disabled only</option>
            </select>
          </div>

          {/* Type selector */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9.5 bg-[#12141A] border border-[#252836] rounded-xl px-3 text-[10.5px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Feed Types</option>
              <option value="Default">Default</option>
              <option value="Drip Feed">Drip Feed</option>
              <option value="Custom Comments">Custom Comments</option>
            </select>
          </div>

          {/* SMM Provider filter */}
          <div className="md:col-span-2">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full h-9.5 bg-[#12141A] border border-[#252836] rounded-xl px-3 text-[10.5px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Providers</option>
              <option value="SMMKing Panel">SMMKing Panel</option>
              <option value="JustAnotherPanel">JustAnotherPanel</option>
              <option value="BestSMM">BestSMM</option>
              <option value="TopSMM Provider">TopSMM Provider</option>
            </select>
          </div>

          {/* Sorters items */}
          <div className="md:col-span-2 flex items-center bg-[#12141A] border border-[#252836] rounded-xl overflow-hidden">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-full bg-transparent px-3 text-[10px] font-black uppercase text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="id">Sort: ID</option>
              <option value="name">Sort: Name</option>
              <option value="rate">Sort: Price</option>
              <option value="totalOrders">Sort: Orders</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 h-full border-l border-[#252836] text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Reverse Sorting Direction"
            >
              {sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            </button>
          </div>

        </div>
      </div>

      {/* MULTI SELECTED FLOATING PANEL */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 p-3.5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#6C63FF]" />
              <span className="text-xs font-bold text-white">
                Selected <strong className="text-[#00D4FF]">{selectedIds.length} SMM services</strong>. Dispatched operations will apply dynamically.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEnable}
                className="px-3 py-1.5 rounded-lg bg-[#6C63FF]/25 hover:bg-[#6C63FF]/40 text-white text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
              >
                Enable Selected
              </button>
              
              <button
                onClick={handleBulkDisable}
                className="px-3 py-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/25 border border-transparent text-gray-400 text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
              >
                Disable Selected
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-500/90 text-white text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-gray-500 hover:text-white font-extrabold ml-2"
              >
                Clear Selector
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERVICES TABLE GRID SHEET */}
      <div className="bg-[#1A1D26] border border-[#1E2230] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#252836] bg-[#12141A]/50 text-gray-500 uppercase text-[9px] font-black tracking-widest leading-none">
                <th className="py-4 px-3 w-8 text-center">Reorder</th>
                <th className="py-4 px-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredAndSortedServices.length > 0 && selectedIds.length === filteredAndSortedServices.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#6C63FF] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3 w-16">ID</th>
                <th className="py-4 px-3 min-w-[240px]">Service Name (click to edit)</th>
                <th className="py-4 px-3">Type</th>
                <th className="py-4 px-3 text-right">Price per 1000</th>
                <th className="py-4 px-3 text-center">Min/Max limits</th>
                <th className="py-4 px-3">API Source</th>
                <th className="py-4 px-3 text-center">Total Orders</th>
                <th className="py-4 px-3 text-center">Toggle Status</th>
                <th className="py-4 px-4 text-right">Actions hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252836]/40 text-gray-300 font-bold text-xs select-none">
              
              {filteredAndSortedServices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-500 uppercase font-black tracking-widest text-[10.5px]">
                    No corresponding services verified in database parameters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedServices.map((s, idx) => {
                  const isChecked = selectedIds.includes(s.id);
                  const isNameEditing = editingServiceId === s.id;
                  const isRateEditing = editingRateId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#12141A]/40 transition-colors ${
                        isChecked ? 'bg-[#6C63FF]/5' : ''
                      }`}
                    >
                      {/* Sort drag handles */}
                      <td className="py-3 px-3 text-center text-gray-600">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMovePosition(s.id, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            onClick={() => handleMovePosition(s.id, 'down')}
                            disabled={idx === filteredAndSortedServices.length - 1}
                            className="p-0.5 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Selector checkbox */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(s.id, e.target.checked)}
                          className="w-4 h-4 rounded bg-[#12141A] border-[#252836] text-[#6C63FF] cursor-pointer"
                        />
                      </td>

                      {/* Display ID */}
                      <td className="py-3 px-3 text-white font-mono font-black text-xs">
                        {s.id}
                      </td>

                      {/* Editable Service Name */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col text-left group">
                          {isNameEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={inlineName}
                                onChange={(e) => setInlineName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineName(s.id)}
                                onBlur={() => handleSaveInlineName(s.id)}
                                autoFocus
                                className="bg-[#12141A] border border-[#6C63FF] text-[11.5px] font-bold text-white px-2 py-1 rounded w-64 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveInlineName(s.id)}
                                className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 transition-colors cursor-pointer"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setEditingServiceId(null)}
                                className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  setEditingServiceId(s.id);
                                  setInlineName(s.name);
                                }}
                                className="text-white hover:text-[#6C63FF] cursor-pointer"
                                title="Click to rename service"
                              >
                                {s.name}
                              </span>
                              {s.featured && (
                                <span className="bg-amber-500/10 text-amber-500 text-[7px] px-1 py-0.5 rounded uppercase font-black tracking-wider flex items-center gap-0.5">
                                  ★ Featured
                                </span>
                              )}
                              {s.isNew && (
                                <span className="bg-[#00D4FF]/10 text-brand-cyan text-[7px] px-1 py-0.5 rounded uppercase font-black tracking-wider">
                                  NEW
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Categorization indicators */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-[#12141A] border border-[#252836] text-gray-500 text-[8.5px] px-1.5 py-0.5 rounded font-bold">
                              {s.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-3 px-3">
                        <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                          s.type === 'Drip Feed'
                            ? 'bg-[#00D4FF]/10 text-brand-cyan'
                            : s.type === 'Custom Comments'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {s.type}
                        </span>
                      </td>

                      {/* Rate $/1000 */}
                      <td className="py-3 px-3 text-right">
                        {isRateEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={inlineRate}
                              onChange={(e) => setInlineRate(parseFloat(e.target.value) || 0)}
                              onBlur={() => handleSaveInlineRate(s.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineRate(s.id)}
                              autoFocus
                              className="bg-[#12141A] border border-[#6C63FF] text-[11px] font-mono text-white px-1 py-0.5 rounded w-16 text-right focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingRateId(s.id);
                              setInlineRate(s.rate);
                            }}
                            className="hover:bg-white/5 px-2 py-1 rounded w-max ml-auto cursor-pointer font-mono text-emerald-400 text-xs"
                            title="Click to override sales pricing"
                          >
                            ${s.rate.toFixed(3)}
                          </div>
                        )}
                      </td>

                      {/* Limits Min / Max */}
                      <td className="py-3 px-3 text-center text-gray-400 font-mono text-[10.5px]">
                        {s.min.toLocaleString('en-US')} / {s.max.toLocaleString('en-US')}
                      </td>

                      {/* Provider system details */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col text-left">
                          <span className="text-gray-400 text-[10.5px] font-bold">
                            {s.provider}
                          </span>
                          <span className="text-gray-600 font-mono text-[9px] mt-0.5">
                            ID: #{s.providerServiceId} (${s.providerRate.toFixed(2)})
                          </span>
                        </div>
                      </td>

                      {/* Total linked orders */}
                      <td className="py-3 px-3 text-center text-white font-mono">
                        {s.totalOrders.toLocaleString('en-US')}
                      </td>

                      {/* Status toggle toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`w-14 h-6 px-1 rounded-full transition-all flex items-center relative cursor-pointer border ${
                            s.status === 'Active'
                              ? 'bg-[#6C63FF]/15 border-[#6C63FF]/30 justify-end'
                              : 'bg-red-500/10 border-red-500/20 justify-start'
                          }`}
                        >
                          <span className="absolute left-2 text-[7.5px] font-black text-gray-500 leading-none">OFF</span>
                          <span className="absolute right-2.5 text-[7.5px] font-black text-emerald-400 leading-none">ON</span>
                          <motion.div
                            layout
                            className={`w-4 h-4 rounded-full z-10 ${
                              s.status === 'Active' ? 'bg-[#6C63FF]' : 'bg-red-500'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <button
                            onClick={() => setStatsViewService(s)}
                            title="View Metrics & Profit Analysis"
                            className="p-1 px-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#00D4FF]/10 text-gray-400 hover:text-brand-cyan border border-transparent transition-all cursor-pointer"
                          >
                            <BarChart3 size={13} />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(s)}
                            title="Edit Parameters"
                            className="p-1 px-1.5 rounded-lg bg-[#252836]/40 hover:bg-[#6C63FF]/10 text-gray-400 hover:text-white border border-transparent transition-all cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => handleCloneService(s)}
                            title="Duplicate Service Model"
                            className="p-1 px-1.5 rounded-lg bg-[#252836]/40 hover:bg-amber-500/10 text-gray-400 hover:text-amber-500 border border-transparent transition-all cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteService(s.id)}
                            title="Purge Service"
                            className="p-1 px-1.5 rounded-lg bg-[#252836]/40 hover:bg-red-500/15 text-gray-400 hover:text-red-400 border border-transparent transition-all cursor-pointer"
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
      </div>

      {/* =================================═══════════════════════════════════
          ADD / EDIT SERVICE MASTER LARGE MODAL (Tabbed Control Panel)
         ================================═══════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0A0B0F]/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4 text-left overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-3xl shadow-2xl space-y-5 my-8 text-xs font-bold text-gray-300 relative"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#6C63FF]" />
                  <h3 className="text-sm font-black uppercase text-white tracking-wider leading-none">
                    {currentEditService ? `Modify Campaign Node: ${currentEditService.id}` : "Configure Brand New SMM Service"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1.5 rounded-xl border border-[#252836] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* TAB SELECTION TRIGGERS */}
              <div className="flex items-center border-b border-[#252836] pb-1 gap-1">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'price', label: 'Pricing & Limits' },
                  { id: 'features', label: 'Advanced Features' },
                  { id: 'display', label: 'Display Settings' }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => setModalTab(tb.id as any)}
                    className={`px-4 py-2 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      modalTab === tb.id
                        ? 'bg-[#6C63FF]/15 text-[#6C63FF] border-b-2 border-[#6C63FF]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* MAIN FORMS CONTENT */}
              <form onSubmit={handleSaveServiceForm} className="space-y-4">
                
                {/* TAB 1: BASIC INFORMATION */}
                {modalTab === 'basic' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Service Name (Public Facing):</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Instagram Post Likes [Instant Speed] [Real Profiles]"
                        className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] font-bold text-white focus:outline-none focus:border-[#6C63FF]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Vertical Category:</label>
                        <select
                          value={formData.category || 'Instagram'}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                          className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3.5 focus:outline-none cursor-pointer text-white"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter</option>
                          <option value="Telegram">Telegram</option>
                          <option value="Spotify">Spotify</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Service Operation Type:</label>
                        <select
                          value={formData.type || 'Default'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3.5 focus:outline-none cursor-pointer text-white"
                        >
                          <option value="Default">Default Standard delivery</option>
                          <option value="Drip Feed">Drip Feed Spaced delivery</option>
                          <option value="Custom Comments">Custom Comments Node</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Initial Launch Status:</label>
                        <select
                          value={formData.status || 'Active'}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3.5 focus:outline-none cursor-pointer text-white"
                        >
                          <option value="Active">Active status</option>
                          <option value="Paused">Paused (Temporary hold)</option>
                          <option value="Disabled">Disabled status</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Service Description (Markdown Compatible):</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detail terms, guarantee information, rate warnings, drop-levels..."
                        rows={4}
                        className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl p-3.5 text-[11px] font-mono text-gray-300 focus:outline-none focus:border-[#6C63FF]"
                      />
                    </div>

                  </div>
                )}

                {/* TAB 2: PRICING & LIMIT VALUES */}
                {modalTab === 'price' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Provider API Supplier:</label>
                        <select
                          value={formData.provider || 'SMMKing Panel'}
                          onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                          className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3.5 focus:outline-none cursor-pointer text-white"
                        >
                          <option value="SMMKing Panel">SMMKing Panel</option>
                          <option value="JustAnotherPanel">JustAnotherPanel</option>
                          <option value="BestSMM">BestSMM</option>
                          <option value="TopSMM Provider">TopSMM Provider</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider font-mono">Provider Service ID:</label>
                        <input
                          type="text"
                          value={formData.providerServiceId || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, providerServiceId: e.target.value }))}
                          placeholder="e.g., 5489"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#6C63FF]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono">
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Provider Cost (per 1k):</label>
                          <span className="text-[8px] bg-[#12141A] text-gray-400 px-1 py-0.5 rounded uppercase leading-none">ReadOnly</span>
                        </div>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.providerRate || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, providerRate: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.95"
                          className="w-full bg-[#12141A] border border-transparent rounded-xl px-4 py-2.5 text-[11px] text-gray-400 focus:outline-none cursor-not-allowed select-none bg-white/[0.02]"
                          readOnly
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="flex flex-col gap-1.5 font-mono">
                        <label className="text-[10px] uppercase text-[#6C63FF] font-extrabold tracking-wider">Your Selling Price (per 1k):</label>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.rate || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                          placeholder="1.85"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-[#00D4FF] focus:outline-none focus:border-[#6C63FF]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Minimum Order Order Limit:</label>
                        <input
                          type="number"
                          value={formData.min || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                          placeholder="50"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#6C63FF]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Maximum Order Order Limit:</label>
                        <input
                          type="number"
                          value={formData.max || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                          placeholder="10000"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#6C63FF]"
                        />
                      </div>

                    </div>

                    {/* RETAIL PROFIT METRICS SIMULATOR CARD */}
                    <div className="bg-[#12141A] border border-[#252836] p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <DollarSign size={18} />
                        </div>
                        <div>
                          <span className="text-white text-[11px] block uppercase tracking-wide">Automatic Markup Calculator Matrix</span>
                          <span className="text-gray-500 text-[9.5px] block mt-0.5 mt-0.5 font-medium">Auto evaluated from cost settings and sales rates values.</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 font-mono text-right">
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest block">markup percent</span>
                          <span className="text-base font-black text-amber-500 flex items-center justify-end gap-0.5">
                            +{calculatedMarkup}%
                          </span>
                        </div>
                        <div className="border-l border-[#2C3147] pl-6">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Estimated Profit / 1K</span>
                          <span className="text-base font-black text-emerald-400">
                            ${calculatedProfit.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: FEATURES TABS */}
                {modalTab === 'features' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#12141A] border border-[#252836] p-4.5 rounded-xl">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Allow Guarantee Refills</span>
                          <span className="text-gray-500 text-[9.5px] block mt-0.5">Permits manually dispatching automated refill.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.refill || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, refill: e.target.checked }))}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Period Refill Days duration:</span>
                          <span className="text-gray-500 text-[9.5px] block mt-0.5">Number of guarantee days.</span>
                        </div>
                        <input
                          type="number"
                          value={formData.refillDays || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, refillDays: parseInt(e.target.value) || 0 }))}
                          disabled={!formData.refill}
                          className="w-20 bg-[#1A1D26] border border-[#2C3147] rounded-lg px-2.5 py-1 text-center font-mono text-[11px] disabled:opacity-20"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#12141A] border border-[#252836] p-4.5 rounded-xl">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Allow Cancel orders</span>
                          <span className="text-gray-500 text-[9.5px] block mt-0.5">Allows client cancellation within the waiting queue.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.allowCancel || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowCancel: e.target.checked }))}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Allow Drip Feeds</span>
                          <span className="text-gray-500 text-[9.5px] block mt-0.5">Client can split single order into segments.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.allowDrip || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowDrip: e.target.checked }))}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Average Speed Metric:</label>
                        <input
                          type="text"
                          value={formData.avgSpeed || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, avgSpeed: e.target.value }))}
                          placeholder="e.g., 10k/day"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Average Dispatch Time:</label>
                        <input
                          type="text"
                          value={formData.avgTime || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, avgTime: e.target.value }))}
                          placeholder="e.g., 15 min"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Profile Quality Matrix:</label>
                        <select
                          value={formData.quality || 'High Quality'}
                          onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value as any }))}
                          className="bg-[#12141A] border border-[#2C3147] rounded-xl h-10 px-3.5 focus:outline-none cursor-pointer text-white"
                        >
                          <option value="Real & Active">Real & Active Users</option>
                          <option value="High Quality">High Quality Profiles</option>
                          <option value="Mixed">Mixed (Real & Bot Node)</option>
                          <option value="Bot">Bot Delivery Node</option>
                        </select>
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 4: DISPLAY CONFIG */}
                {modalTab === 'display' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Manual Position Index:</label>
                        <input
                          type="number"
                          value={formData.position || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                          placeholder="1"
                          className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="bg-[#12141A] border border-[#252836] p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Star Highlight Featured</span>
                          <span className="text-gray-500 text-[9px] block">Banner star header.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.featured || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                        />
                      </div>

                      <div className="bg-[#12141A] border border-[#252836] p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-white text-[11px] block">Show 'NEW' badge icon</span>
                          <span className="text-gray-500 text-[9px] block">Highlights recently added.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.isNew || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                          className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                        />
                      </div>

                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-gray-500 font-extrabold tracking-wider">Custom Alert Warning Box (Client User Panel View Warning):</label>
                      <input
                        type="text"
                        value={formData.customNote || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, customNote: e.target.value }))}
                        placeholder="e.g. Warning: TikTok algorithm update in progress, delivery speeds may fluctuate."
                        className="w-full bg-[#12141A] border border-[#2C3147] rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#6C63FF]"
                      />
                    </div>

                  </div>
                )}

                {/* Submit operations */}
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
                    Commit Configuration
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================═══════════════════════════════════
          IMPORT FROM PROVIDER MODAL FRAME
         ================================═══════════════════════════════════ */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-[#0A0B0F]/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4 text-left overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-2xl shadow-2xl space-y-4 text-xs font-bold text-gray-300"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine size={16} className="text-brand-cyan" />
                  <h3 className="text-sm font-black uppercase text-white tracking-wider leading-none">
                    Sync Supplier API Channels
                  </h3>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1.5 rounded-xl border border-[#252836] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Top Controls config */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end bg-[#12141A] p-4 rounded-xl border border-[#252836]">
                
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[9.5px] uppercase text-gray-500 tracking-wider font-medium">Select source Gateway:</label>
                  <select
                    value={importSelectedProvider}
                    onChange={(e) => setImportSelectedProvider(e.target.value)}
                    className="w-full h-9.5 bg-[#1A1D26] border border-[#2C3147] rounded-lg px-2.5 focus:outline-none cursor-pointer text-white"
                  >
                    <option value="SMMKing Panel">SMMKing Panel (Active)</option>
                    <option value="JustAnotherPanel">JustAnotherPanel (Active)</option>
                    <option value="TopSMM Provider">TopSMM Provider (Active)</option>
                  </select>
                </div>

                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[9.5px] uppercase text-gray-500 tracking-wider font-medium">Quick text matching:</label>
                  <input
                    type="text"
                    value={importSearch}
                    onChange={(e) => setImportSearch(e.target.value)}
                    placeholder="Search supplier feeds..."
                    className="w-full bg-[#1A1D26] border border-[#2C3147] rounded-lg px-3 py-2 text-[10.5px] font-bold text-white focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>

                <div className="md:col-span-4 h-9.5">
                  <button
                    onClick={handleFetchProviderServices}
                    disabled={importLoading}
                    className="w-full h-full rounded-lg bg-[#6C63FF] hover:bg-[#6C63FF]/90 transition-all text-white font-black uppercase tracking-wider text-[10.5px] cursor-pointer"
                  >
                    {importLoading ? "Fetching Database..." : "Fetch Services"}
                  </button>
                </div>

              </div>

              {/* Services checked selection list */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Available API Items list</span>
                  <button
                    onClick={() => {
                      if (importCheckedIds.length === MOCK_PROVIDER_SERVICES.length) {
                        setImportCheckedIds([]);
                      } else {
                        setImportCheckedIds(MOCK_PROVIDER_SERVICES.map(item => item.id));
                      }
                    }}
                    className="text-[10px] text-brand-cyan hover:underline hover:text-white"
                  >
                    Toggle Select All
                  </button>
                </div>

                {importLoading ? (
                  <div className="h-44 bg-[#12141A] rounded-xl flex flex-col items-center justify-center border border-dashed border-[#252836]">
                    <RefreshCw className="animate-spin text-[#6C63FF] mb-2" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Requesting provider endpoint definitions...</span>
                  </div>
                ) : (
                  <div className="h-44 bg-[#12141A] overflow-y-auto rounded-xl p-2.5 space-y-1.5 border border-[#252836] scrollbar-thin">
                    {MOCK_PROVIDER_SERVICES
                      .filter(item => importSearch === '' || item.name.toLowerCase().includes(importSearch.toLowerCase()))
                      .map((item) => {
                        const isChecked = importCheckedIds.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border select-none ${
                              isChecked
                                ? 'bg-[#6C63FF]/10 border-[#6C63FF]/30'
                                : 'bg-[#1A1D26] border-[#252836] hover:bg-white/[0.01]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setImportCheckedIds(prev => [...prev, item.id]);
                                  } else {
                                    setImportCheckedIds(prev => prev.filter(v => v !== item.id));
                                  }
                                }}
                                className="w-4 h-4 rounded bg-[#12141A] text-[#6C63FF] border-[#252836] cursor-pointer"
                              />
                              <div className="text-left min-w-0">
                                <span className="text-white block truncate" title={item.name}>{item.name}</span>
                                <span className="text-gray-500 text-[8.5px] font-mono mt-0.5 mt-0.5 leading-none block">
                                  Category: {item.category} | Speed: {item.speed}
                                </span>
                              </div>
                            </div>

                            <span className="text-[#00D4FF] font-mono shrink-0 font-black text-xs pl-4 pr-1">
                              cost: ${item.cost.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Dynamic Markup input markup setting before import */}
              <div className="bg-[#12141A] border border-[#252836] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white text-[11px] block">Markup Margin Rate:</span>
                  <span className="text-gray-500 text-[9px] block">Markup % added automatically on import sells rates.</span>
                </div>
                
                <div className="flex items-center bg-[#1A1D26] border border-[#2C3147] rounded-lg h-9 overflow-hidden px-2 w-28">
                  <input
                    type="number"
                    value={importMarkup}
                    onChange={(e) => setImportMarkup(e.target.value)}
                    placeholder="50"
                    className="w-full text-center bg-transparent border-none text-[11.5px] font-mono font-black text-white focus:outline-none"
                  />
                  <span className="text-gray-500 text-[9px] font-black select-none">%</span>
                </div>
              </div>

              {/* Actions bottom */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-xs uppercase"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleImportCheckedServicesAction}
                  disabled={importCheckedIds.length === 0}
                  className="px-4.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white text-xs font-black uppercase transition-all disabled:opacity-20 cursor-pointer text-center"
                >
                  Import {importCheckedIds.length} SMM Services
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================═══════════════════════════════════
          SMM SERVICE DETAILED METRICS PROFILE modal
         ================================═══════════════════════════════════ */}
      <AnimatePresence>
        {statsViewService && (
          <div className="fixed inset-0 bg-[#0A0B0F]/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4 text-left overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1D202D] border-2 border-[#2C3147] p-6 rounded-2xl w-full max-w-xl shadow-2xl space-y-4 text-xs font-bold text-gray-300"
            >
              
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2C3147]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-[#00D4FF]" size={16} />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest leading-none">
                    Campaign Profitability Analysis ({statsViewService.id})
                  </h3>
                </div>
                <button
                  onClick={() => setStatsViewService(null)}
                  className="text-gray-400 hover:text-white bg-[#12141A] p-1.5 rounded-xl border border-[#252836] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Title representation card */}
              <div className="p-3.5 bg-[#12141A] rounded-xl border border-[#252836] space-y-1">
                <span className="text-[8px] bg-[#6C63FF]/15 text-[#6C63FF] px-1.5 py-0.5 rounded uppercase font-black tracking-wider w-max block">
                  {statsViewService.category}
                </span>
                <span className="text-white text-[12px] block font-black pt-1">{statsViewService.name}</span>
              </div>

              {/* Pricing ledger metric grids */}
              <div className="grid grid-cols-2 gap-3">
                
                <div className="bg-[#12141A] p-3 rounded-xl border border-[#252836] text-left">
                  <span className="text-[9px] uppercase text-gray-500 tracking-wider">Dispatched sales price:</span>
                  <span className="text-base font-black font-mono text-emerald-400 block mt-1.5">${statsViewService.rate.toFixed(3)} / 1K</span>
                </div>

                <div className="bg-[#12141A] p-3 rounded-xl border border-[#252836] text-left">
                  <span className="text-[9px] uppercase text-gray-500 tracking-wider">External API cost price:</span>
                  <span className="text-base font-black font-mono text-gray-400 block mt-1.5">${statsViewService.providerRate.toFixed(3)} / 1K</span>
                </div>

                <div className="bg-[#12141A] p-3 rounded-xl border border-[#252836] text-left">
                  <span className="text-[9px] uppercase text-gray-500 tracking-wider">Margin Profit yield:</span>
                  <span className="text-base font-black font-mono text-brand-cyan block mt-1.5">
                    ${(statsViewService.rate - statsViewService.providerRate).toFixed(3)}
                  </span>
                </div>

                <div className="bg-[#12141A] p-3 rounded-xl border border-[#252836] text-left">
                  <span className="text-[9px] uppercase text-gray-500 tracking-wider">Relative Markup scale:</span>
                  <span className="text-base font-black font-mono text-amber-500 block mt-1.5">
                    +{(Math.round(((statsViewService.rate - statsViewService.providerRate) / statsViewService.providerRate) * 100))}%
                  </span>
                </div>

              </div>

              {/* Historic cumulative volumes logs card */}
              <div className="bg-[#12141A] rounded-xl p-4.5 border border-[#252836] space-y-3.5">
                <span className="text-[9.5px] uppercase font-black text-gray-500 block tracking-wider">● Cumulative historical volumes</span>
                
                <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                  
                  <div className="border-r border-[#2C3147]">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold leading-none">Net orders</span>
                    <span className="font-black text-white text-sm block mt-1.5 leading-none">{statsViewService.totalOrders.toLocaleString()}</span>
                  </div>

                  <div className="border-r border-[#2C3147]">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold leading-none">volume boost</span>
                    <span className="font-black text-emerald-400 text-sm block mt-1.5 leading-none">{(statsViewService.totalOrders * statsViewService.min).toLocaleString()}+</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase font-bold leading-none">gross proceeds</span>
                    <span className="font-black text-brand-cyan text-sm block mt-1.5 leading-none">
                      ${(statsViewService.totalOrders * statsViewService.rate * 0.15).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                </div>

                <div className="flex gap-2 p-2.5 rounded bg-emerald-500/5 text-emerald-400 text-[10.5px] text-left font-sans items-center leading-relaxed">
                  <Sparkles size={14} className="shrink-0" />
                  <span>SMM service index is optimized at +{Math.round(((statsViewService.rate - statsViewService.providerRate) / statsViewService.providerRate) * 100)}% margins, returning consistent monthly gross yields.</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setStatsViewService(null)}
                  className="px-4.5 py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/15 text-white font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  Close parameters view
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
