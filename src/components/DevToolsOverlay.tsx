import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, RefreshCw, X, Sliders, Layers, User, Eye, Database, Info } from 'lucide-react';

interface DevToolsOverlayProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  activeMenu: string;
  setActiveMenu: (val: string) => void;
  onResetState: () => void;
}

export default function DevToolsOverlay({
  isAdmin,
  setIsAdmin,
  activeMenu,
  setActiveMenu,
  onResetState
}: DevToolsOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const userPages = [
    { id: 'dashboard', label: 'Reseller Overview' },
    { id: 'new-order', label: 'New Order Form' },
    { id: 'orders', label: 'Orders Tracker' },
    { id: 'services', label: 'SMM Services Catalog' },
    { id: 'add-funds', label: 'Charge Wallet' },
    { id: 'support', label: 'Open Ticket' },
  ];

  const adminPages = [
    { id: 'dashboard', label: 'Overview Terminal' },
    { id: 'users', label: 'User Registries' },
    { id: 'orders', label: 'Bulk Orders' },
    { id: 'services', label: 'SMM Services' },
    { id: 'payments', label: 'Payments System' },
    { id: 'coupons', label: 'Promo Coupons' },
    { id: 'settings', label: 'Panel Settings' },
    { id: 'tickets', label: 'Support Tickets (Admin)' },
  ];

  return (
    <div className="fixed top-[18px] right-14 md:top-auto md:bottom-4.5 md:right-4.5 z-[9999] select-none text-left">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            layoutId="devtools-trigger"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 p-2 sm:p-2.5 md:px-3.5 md:py-2.5 bg-[#FF4757] hover:bg-red-650 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/10 hover:shadow-red-500/25 transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer uppercase tracking-wider"
            title="Open Developer Utilities Panel"
          >
            <Sliders size={13} className="animate-pulse" />
            <span className="hidden md:inline">Dev Tools Panel</span>
          </motion.button>
        ) : (
          <motion.div
            layoutId="devtools-trigger"
            className="bg-[#0F1015] border-2 border-red-500/30 w-72 rounded-2.5xl p-5 shadow-2xl relative flex flex-col gap-4 text-xs font-sans text-gray-200"
          >
            <div className="flex items-center justify-between border-b border-[#252836] pb-3 shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Terminal size={14} className="text-[#FF4757]" />
                <span className="font-black text-xs uppercase tracking-wider">Campaign Dev Tools</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white bg-slate-900 border border-slate-800 p-1 rounded-lg cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* TOGGLE WORKSPACE MODE */}
            <div className="bg-[#151722] p-3 rounded-xl border border-[#232635] space-y-2">
              <span className="text-[9px] font-black uppercase text-gray-550 block tracking-wider">Active Workspace View</span>
              <div className="flex bg-[#0A0B0F] p-1 rounded-lg border border-[#1b1c26] text-center text-[10px] font-black uppercase">
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className={`flex-1 py-1.5 rounded transition-all ${
                    !isAdmin ? 'bg-[#FF4757]/15 text-[#FF4757] font-black border border-[#FF4757]/20' : 'text-gray-500'
                  }`}
                >
                  Client View
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className={`flex-1 py-1.5 rounded transition-all ${
                    isAdmin ? 'bg-[#FF4757]/15 text-[#FF4757] font-black border border-[#FF4757]/20' : 'text-gray-500'
                  }`}
                >
                  Admin view
                </button>
              </div>
            </div>

            {/* QUICK PAGE SHORTCUT NAVIGATION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-550 tracking-wider">
                <span>Quick Navigation shortcuts</span>
                <span className="text-brand-cyan">{isAdmin ? 'ADMIN MODE' : 'PLAYER MODE'}</span>
              </div>

              <div className="bg-[#12141C] p-2.5 rounded-xl border border-white/[0.03] max-h-40 overflow-y-auto divide-y divide-[#242738]/40">
                {(isAdmin ? adminPages : userPages).map((p) => {
                  const isCurrent = activeMenu === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveMenu(p.id);
                        setIsOpen(false);
                      }}
                      className={`w-full py-2 px-1.5 text-left text-[11px] font-semibold transition-all hover:text-[#00D4FF] flex justify-between items-center rounded ${
                        isCurrent ? 'text-[#00D4FF] bg-[#00D4FF]/4 font-bold border-l-2 border-[#00D4FF] pl-2' : 'text-slate-450 hover:bg-white/[0.01]'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isCurrent && <Eye size={10} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MASTER SYSTEM RESET */}
            <div className="pt-1.5 border-t border-[#232635] flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetState();
                  setIsOpen(false);
                }}
                className="w-full py-2.5 bg-red-500/10 hover:bg-[#FF4757] text-[#FF4757] hover:text-white border border-[#FF4757]/20 hover:border-transparent rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={12} className="animate-spin" />
                <span>Reset state parameters</span>
              </button>
            </div>

            {/* TECHNICAL SYSTEM META */}
            <div className="p-2.5 bg-[#0A0B0F] border border-white/[0.015] rounded-xl text-[9.5px] font-mono text-gray-600 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>API CHANNEL:</span>
                <span className="text-slate-400 font-bold">DOWNSTREAM CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span>LOCAL DB STATUS:</span>
                <span className="text-emerald-500 font-bold">ONLINE (SQL CACHED)</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
