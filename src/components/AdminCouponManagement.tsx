import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  XCircle,
  HelpCircle,
  Clock,
  Shuffle,
  Percent,
  CheckCircle,
  ToggleLeft,
  X,
  UserCheck,
  ToggleRight,
  Filter,
  Users
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  uses: number;
  maxUses: number | null; // null means unlimited
  validUntil: string;
  status: 'Active' | 'Inactive';
  appliesTo: 'All' | string; // username
  minDeposit: number;
  oneUsePerUser: boolean;
}

interface AdminCouponManagementProps {
  onShowToast: (msg: string) => void;
}

export default function AdminCouponManagement({ onShowToast }: AdminCouponManagementProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  useEffect(() => {
    const importFirebase = async () => {
      const { db } = await import('../firebase');
      const { collection, onSnapshot } = await import('firebase/firestore');
      
      const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
        const list: Coupon[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            code: d.code || '',
            type: d.type || 'Percentage',
            value: d.value || 0,
            uses: d.uses || 0,
            maxUses: d.maxUses !== undefined ? d.maxUses : null,
            validUntil: d.validUntil || '2026-12-31',
            status: d.status || 'Active',
            appliesTo: d.appliesTo || 'All',
            minDeposit: d.minDeposit || 0,
            oneUsePerUser: !!d.oneUsePerUser
          });
        });
        setCoupons(list);
      });
      return unsub;
    };
    
    let unsubscribe: any = null;
    importFirebase().then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);


  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Percentage' | 'Fixed Amount'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [value, setValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [validUntil, setValidUntil] = useState('2026-06-30');
  const [appliesToType, setAppliesToType] = useState<'All' | 'Specific'>('All');
  const [appliesToUser, setAppliesToUser] = useState('');
  const [minDeposit, setMinDeposit] = useState('0');
  const [oneUsePerUser, setOneUsePerUser] = useState(true);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchCode = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.appliesTo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'All' || c.type === filterType;
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      return matchCode && matchType && matchStatus;
    });
  }, [coupons, searchQuery, filterType, filterStatus]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PRO_';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    onShowToast(`Random coupon code generated: ${result}`);
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setType('Percentage');
    setValue('10');
    setMaxUses('100');
    setIsUnlimited(false);
    setValidUntil('2026-07-31');
    setAppliesToType('All');
    setAppliesToUser('');
    setMinDeposit('20');
    setOneUsePerUser(true);
    setStatus('Active');
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : '');
    setIsUnlimited(coupon.maxUses === null);
    setValidUntil(coupon.validUntil);
    setAppliesToType(coupon.appliesTo === 'All' ? 'All' : 'Specific');
    setAppliesToUser(coupon.appliesTo === 'All' ? '' : coupon.appliesTo);
    setMinDeposit(coupon.minDeposit.toString());
    setOneUsePerUser(coupon.oneUsePerUser);
    setStatus(coupon.status);
    setShowModal(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      onShowToast('Coupon code is required.');
      return;
    }
    const valAmt = parseFloat(value);
    if (isNaN(valAmt) || valAmt <= 0) {
      onShowToast('Please type a valid coupon discount value.');
      return;
    }

    const compiledCoupon: Coupon = {
      id: editingCoupon ? editingCoupon.id : `COP-${Math.floor(10 + Math.random() * 90)}`,
      code: code.toUpperCase().trim().replace(/\s+/g, '_'),
      type,
      value: valAmt,
      uses: editingCoupon ? editingCoupon.uses : 0,
      maxUses: isUnlimited ? null : parseInt(maxUses) || 50,
      validUntil,
      status,
      appliesTo: appliesToType === 'All' ? 'All' : appliesToUser.trim() || 'All',
      minDeposit: parseFloat(minDeposit) || 0,
      oneUsePerUser
    };

    if (editingCoupon) {
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? compiledCoupon : c));
      onShowToast(`Promo coupon ${compiledCoupon.code} successfully modified.`);
    } else {
      setCoupons(prev => [compiledCoupon, ...prev]);
      onShowToast(`New marketing promo coupon "${compiledCoupon.code}" created.`);
    }

    setShowModal(false);
  };

  const handleDeleteCoupon = (id: string, codeStr: string) => {
    if (confirm(`Are you sure you want to permanently revoke coupon "${codeStr}"?`)) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      onShowToast(`Coupon code ${codeStr} revoked from database.`);
    }
  };

  const handleToggleStatus = (id: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        onShowToast(`Coupon code ${c.code} marked ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER SECTION CONTROLS */}
      <div className="bg-[#1A1D26] border border-[#252836] p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3.5 w-full md:w-auto items-center">
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter promo codes..."
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs py-2.5 pl-10 pr-3 rounded-xl text-white outline-none focus:border-[#6C63FF] placeholder:text-gray-600 font-mono"
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
            >
              <option value="All">All Coupon Formats</option>
              <option value="Percentage">Percentage % Format</option>
              <option value="Fixed Amount">Fixed Dollar $ Amount</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
            >
              <option value="All">All Status Levels</option>
              <option value="Active">Active Promo Pools</option>
              <option value="Inactive">Exhausted/Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:opacity-95 shadow-md transition-all cursor-pointer uppercase tracking-tight"
        >
          <Plus size={14} />
          <span>Launch New Coupon</span>
        </button>
      </div>

      {/* DATA COUPONS TABLE CORES */}
      <div className="bg-[#1A1D26] border border-[#252836] rounded-3xl overflow-hidden shadow">
        <div className="px-5 py-4 border-b border-[#252836] flex justify-between items-center bg-[#13151f]">
          <h3 className="text-xs font-black uppercase text-white tracking-wider">Promo Coupon Registries</h3>
          <span className="text-[10.5px] font-black text-[#00D4FF]">{filteredCoupons.length} coupon codes cached</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#12141A] border-b border-brand-border/40 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3.5 px-5">Sys ID</th>
                <th className="py-3.5 px-5">Coupon Code</th>
                <th className="py-3.5 px-5">Type Discount</th>
                <th className="py-3.5 px-5 text-right">Value Amount</th>
                <th className="py-3.5 px-5 text-center">Uses Ratio</th>
                <th className="py-3.5 px-5">Minimum Deposit required</th>
                <th className="py-3.5 px-5">Applies For</th>
                <th className="py-3.5 px-5">Valid Until Date</th>
                <th className="py-3.5 px-5">Status Badge</th>
                <th className="py-3.5 px-5 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252836] text-xs font-medium text-gray-200">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-550 text-xs font-medium">
                    No matching coupons found in master registry database catalog.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const hasExpiryHappened = new Date(c.validUntil) < new Date('2026-06-06');
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.012] transition-colors leading-relaxed">
                      <td className="py-3.5 px-5 font-mono text-gray-500">{c.id}</td>
                      <td className="py-3.5 px-5">
                        <span className="flex items-center gap-1.5 font-mono font-black text-[#00D4FF] bg-[#00D4FF]/4 border border-[#00D4FF]/10 px-2 py-1 rounded">
                          <Tag size={12} className="shrink-0 text-brand-cyan" />
                          <span>{c.code}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                          {c.type === 'Percentage' ? 'Percentage %' : 'Fixed USD ($)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-white">
                        {c.type === 'Percentage' ? `${c.value}%` : `$${c.value}`}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-white font-bold">{c.uses} / {c.maxUses === null ? '∞' : c.maxUses} Uses</span>
                          <div className="w-16 bg-[#12141A] h-1.5 rounded-full overflow-hidden mt-1 pb-px">
                            <div
                              className="bg-[#6C63FF] h-full"
                              style={{ width: `${c.maxUses ? Math.min(100, (c.uses / c.maxUses) * 100) : 40}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-gray-300">
                        {c.minDeposit > 0 ? `$${c.minDeposit.toFixed(2)} min` : 'No Minimum'}
                      </td>
                      <td className="py-3.5 px-5 font-bold">
                        {c.appliesTo === 'All' ? (
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded text-[10px] uppercase font-black">All users</span>
                        ) : (
                          <span className="text-[#FFB800] bg-brand-warning/10 border border-brand-warning/15 px-1.5 py-0.5 rounded text-[10px] font-mono font-black">@{c.appliesTo}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-400">
                        <span className={hasExpiryHappened ? 'text-[#FF4757] line-through' : ''}>
                          {c.validUntil}
                        </span>
                        {hasExpiryHappened && <span className="block text-[9px] text-[#FF4757] uppercase font-black">EXPIRED</span>}
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          className={`inline-block text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md border text-center transition-all cursor-pointer ${
                            c.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-[#FF4757] border-red-500/20'
                          }`}
                        >
                          {c.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1 px-2.5 bg-[#12141A] hover:bg-brand-primary border border-[#2b2e3e] hover:border-transparent text-gray-300 hover:text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer uppercase tracking-tight"
                        >
                          <Edit2 size={11} className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-1 px-2.5 bg-red-500/8 hover:bg-[#FF4757] border border-[#FF4757]/20 hover:border-transparent text-[#FF4757] hover:text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer uppercase tracking-tight"
                        >
                          <Trash2 size={11} className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CORE MODAL FOR COUPONS VIEW */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] select-none text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D26] border border-[#252836] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-[#00D4FF]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">
                    {editingCoupon ? 'Configure Coupon Code' : 'Bootstrap New Promo Code'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                
                {/* Coupon Code Input */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex justify-between items-center">
                    <span>Campaign Code</span>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[9px] text-[#00D4FF] hover:underline flex items-center gap-1 uppercase"
                    >
                      <Shuffle size={10} /> Generate Random
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. DISCOUNT_99"
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF] uppercase font-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Discount type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    >
                      <option value="Percentage">Percentage % Format</option>
                      <option value="Fixed Amount">Fixed Amount (Flat USD $)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Value Amount (X% or X$)</label>
                    <input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={type === 'Percentage' ? 'e.g. 15' : 'e.g. 5.00'}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Maximum Allowed Uses</label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled={isUnlimited}
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 justify-end flex flex-col">
                    <div className="flex items-center gap-2 pb-1.5">
                      <button
                        type="button"
                        onClick={() => setIsUnlimited(!isUnlimited)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                          isUnlimited
                            ? 'bg-emerald-500/15 border-emerald-500/30 justify-end'
                            : 'bg-slate-800 border-slate-700 justify-start'
                        }`}
                      >
                        <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                          isUnlimited ? 'bg-[#00C896]' : 'bg-gray-400'
                        }`} />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-[10.5px] font-black text-white uppercase tracking-tight">Unlimited Uses</span>
                        <span className="text-[9px] text-gray-505">Max uses override</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Expiry Date Valid Until</label>
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min deposit to trigger USD</label>
                    <input
                      type="number"
                      required
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scope Permission</label>
                    <select
                      value={appliesToType}
                      onChange={(e) => setAppliesToType(e.target.value as any)}
                      className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                    >
                      <option value="All">All Registered Partners</option>
                      <option value="Specific">Specific Single Reseller Account</option>
                    </select>
                  </div>

                  {appliesToType === 'Specific' && (
                    <div className="space-y-1.5 font-mono">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Username</label>
                      <input
                        type="text"
                        required
                        value={appliesToUser}
                        onChange={(e) => setAppliesToUser(e.target.value)}
                        placeholder="e.g. global_resell"
                        className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-[#6C63FF]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-[#252836]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOneUsePerUser(!oneUsePerUser)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                        oneUsePerUser
                          ? 'bg-emerald-500/15 border-emerald-500/30 justify-end'
                          : 'bg-slate-800 border-slate-700 justify-start'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                        oneUsePerUser ? 'bg-[#00C896]' : 'bg-gray-400'
                      }`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase">One use per client</span>
                      <span className="text-[8.5px] text-gray-550">Strict prevention of spam</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                        status === 'Active'
                          ? 'bg-emerald-500/15 border-emerald-500/30 justify-end'
                          : 'bg-slate-800 border-slate-700 justify-start'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                        status === 'Active' ? 'bg-[#00C896]' : 'bg-gray-400'
                      }`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase">Status: {status}</span>
                      <span className="text-[8.5px] text-gray-550">Gateway permission</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4.5 border-t border-[#252836]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#12141A] border border-[#1b1d28] text-slate-350 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-[#6C63FF] hover:bg-[#5952cf] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Save Coupon Node
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
