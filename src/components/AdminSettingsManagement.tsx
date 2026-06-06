import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Mail,
  Shield,
  Percent,
  AlertTriangle,
  Globe2,
  Lock,
  Upload,
  RefreshCw,
  MailQuestion,
  Eye,
  CheckCircle,
  HelpCircle,
  XCircle,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';

interface AdminSettingsProps {
  onShowToast: (msg: string) => void;
}

export default function AdminSettingsManagement({ onShowToast }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security' | 'referral' | 'maintenance' | 'seo'>('general');

  // ==========================================
  // TAB 1: GENERAL SYSTEM SETTINGS
  // ==========================================
  const [siteName, setSiteName] = useState('ProSMM Reseller Hub');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('GMT+00:00 (London)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD HH:mm');
  const [minDeposit, setMinDeposit] = useState('10.00');
  const [minWithdrawal, setMinWithdrawal] = useState('50.00');
  const [registrationMode, setRegistrationMode] = useState<'Open' | 'Invite Only' | 'Closed'>('Open');
  const [recaptchaSite, setRecaptchaSite] = useState('6Ld_a8aZAAAAAMm3X...');
  const [recaptchaSecret, setRecaptchaSecret] = useState('6Ld_a8aZAAAAAH88_...');
  const [termsUrl, setTermsUrl] = useState('https://prosmm.panel/terms');
  const [privacyUrl, setPrivacyUrl] = useState('https://prosmm.panel/privacy');

  // ==========================================
  // TAB 2: EMAIL SMTP SETTINGS
  // ==========================================
  const [smtpHost, setSmtpHost] = useState('mail.smtp.gservice.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('notification@prosmm.panel');
  const [smtpPass, setSmtpPass] = useState('•••••••••••••••••••••');
  const [smtpEncryption, setSmtpEncryption] = useState<'TLS' | 'SSL' | 'None'>('TLS');
  const [fromName, setFromName] = useState('ProSMM Core Node');
  const [fromEmail, setFromEmail] = useState('noreply@prosmm.panel');

  const [emailTemplates, setEmailTemplates] = useState([
    { id: 'welcome', subject: 'Welcome to ProSMM Reseller Node', name: 'Welcome Email', isEnabled: true, body: 'Hi {{username}},\nWelcome to the supreme reselling hub. Secure your API key inside profile panel.' },
    { id: 'password_reset', subject: 'Reset Your Security Credentials', name: 'Password Reset', isEnabled: true, body: 'Hi {{username}},\nA password reset token is requested. Copy this secure token: {{token}}.' },
    { id: 'order_confirm', subject: 'Campaign Order #{{orderId}} Initiated', name: 'Order Confirm', isEnabled: true, body: 'Order confirmed successfully. Starting SMM delivery.' },
    { id: 'low_balance', subject: 'ALERT: Replenish Reseller Balance', name: 'Low Balance', isEnabled: false, body: 'Your current balance is critically low under $5. Please charge your wallet.' },
    { id: 'ticket_reply', subject: 'New Reply: Ticket #{{ticketId}}', name: 'Ticket Reply', isEnabled: true, body: 'Hi Custom Reseller,\nOur engineering agent responded to your query. Review live logs.' },
    { id: 'payment_confirm', subject: 'Deposit of ${{amount}} Core Success', name: 'Payment Confirm', isEnabled: true, body: 'Your credit deposit of ${{amount}} was verified successfully.' }
  ]);
  const [editingTemplate, setEditingTemplate] = useState<typeof emailTemplates[0] | null>(null);

  // ==========================================
  // TAB 3: SECURITY POLICIES
  // ==========================================
  const [forceHttps, setForceHttps] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('15');
  const [ipWhitelist, setIpWhitelist] = useState('127.0.0.1\n88.244.110.12\n14.226.45.88');
  const [ipBlacklist, setIpBlacklist] = useState('192.168.1.100\n103.24.52.12');
  const [requireVerification, setRequireVerification] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [require2faAdmin, setRequire2faAdmin] = useState(true);

  // ==========================================
  // TAB 4: REFERRAL PROGRAM
  // ==========================================
  const [enableAffiliate, setEnableAffiliate] = useState(true);
  const [commissionRate, setCommissionRate] = useState('5.0');
  const [commissionOn, setCommissionOn] = useState<'Deposits' | 'Orders' | 'Both'>('Deposits');
  const [refMinWithdrawal, setRefMinWithdrawal] = useState('10.00');
  const [cookieDuration, setCookieDuration] = useState('30');
  const [autoApproveCommission, setAutoApproveCommission] = useState(false);

  // ==========================================
  // TAB 5: MAINTENANCE PROTOCOLS
  // ==========================================
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System upgrades are underway on database cache cluster. SMM API pipeline operations will resume in roughly 15 minutes.');
  const [allowedMaintenanceIps, setAllowedMaintenanceIps] = useState('127.0.0.1\n14.226.45.88');

  // ==========================================
  // TAB 6: SEO METADATA
  // ==========================================
  const [metaTitle, setMetaTitle] = useState('ProSMM - Reseller Panels Main Hub');
  const [metaDescription, setMetaDescription] = useState('The most premium, automated social-media agency supplier panel. Enjoy instant high retention views, followers and comment bots under wholesale pricing schemas.');
  const [metaKeywords, setMetaKeywords] = useState('smm panel, reseller hub, buy comments, buying views, social algorithm booster');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('G-99Z11A4R');


  // ==========================================
  // GENERAL ACTION TRIGGERS
  // ==========================================
  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Global settings synchronized & locked onto cluster metadata storage.');
  };

  const handleTestSmtpConnection = () => {
    onShowToast(`Pinging SMTP host ${smtpHost}:${smtpPort}...`);
    setTimeout(() => {
      onShowToast(`SMTP verified. Welcome email template diagnostic sent to root@prosmm.panel.`);
    }, 1500);
  };

  const handleEditTemplateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setEmailTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    onShowToast(`Email template "${editingTemplate.name}" revised.`);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* TABS SIDEBAR / NAVIGATION WRAPPER */}
      <div className="bg-[#10121a] p-1.5 rounded-2xl flex flex-wrap gap-1 border border-[#222533] select-none">
        {[
          { id: 'general', label: 'General Vars', icon: Settings },
          { id: 'email', label: 'SMTP Config', icon: Mail },
          { id: 'security', label: 'Security Shields', icon: Shield },
          { id: 'referral', label: 'Partner Affiliates', icon: Percent },
          { id: 'maintenance', label: 'Maintenance modes', icon: AlertTriangle },
          { id: 'seo', label: 'SEO Metadata', icon: Globe2 }
        ].map(t => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE CONFIG FORM */}
      <form onSubmit={handleSaveAllSettings} className="bg-[#1A1D26] border border-[#252836] p-6 lg:p-7 rounded-3xl shadow-xl space-y-6">
        
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              TAB 1: GENERAL SETTINGS VIEW
             ========================================== */}
          {activeTab === 'general' && (
            <motion.div
              key="general-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">System General Variables</h3>
                <p className="text-[11px] text-gray-500 mt-1">Provide public-facing names, local timezone offsets, minimum checkout limits and brand logos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Site Name</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Base Master Currency System</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-medium"
                  >
                    <option value="USD ($)">USD ($) - default</option>
                    <option value="VND (₫)">VND (₫) - Vietnam localized</option>
                    <option value="EUR (€)">EUR (€) - European reseller</option>
                    <option value="USDT">USDT - cryptocurrency pegged</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Local Timezone Offset</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-medium"
                  >
                    <option value="GMT+00:00 (London)">GMT+00:00 UTC (London)</option>
                    <option value="GMT+07:00 (Hanoi)">GMT+07:00 ICT (Hanoi / Bangkok)</option>
                    <option value="GMT-05:00 (New York)">GMT-05:00 EST (New York)</option>
                    <option value="GMT+01:00 (Berlin)">GMT+01:00 CET (Berlin / Paris)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date Formatting</label>
                  <input
                    type="text"
                    required
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min Single Deposit ($)</label>
                  <input
                    type="number"
                    required
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min Single Withdrawal ($)</label>
                  <input
                    type="number"
                    required
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Registration Mode</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#12141A] p-1 border border-[#292c3d] rounded-xl text-[10px] font-bold text-center">
                    {(['Open', 'Invite Only', 'Closed'] as const).map(reg => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setRegistrationMode(reg)}
                        className={`py-1.5 rounded-lg transition-all ${
                          registrationMode === reg ? 'bg-[#FF4757]/15 text-white border border-[#FF4757]/20 font-black' : 'text-gray-550'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload area mock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SaaS Logo Upload</label>
                  <div className="bg-[#12141A] border-2 border-dashed border-[#2b2e3e] hover:border-red-500/40 p-4 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer group transition-all">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Upload size={16} className="group-hover:text-white transition-colors" />
                      <span>Upload active .PNG vector branding logo</span>
                    </div>
                    <span className="text-[9px] text-[#00D4FF] bg-[#00D4FF]/5 px-2 py-0.5 rounded border border-[#00D4FF]/10 font-mono">MAX 2MB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Favicon .ICO Upload</label>
                  <div className="bg-[#12141A] border-2 border-dashed border-[#2b2e3e] hover:border-red-500/40 p-4 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer group transition-all">
                    <div className="flex items-center gap-3 text-slate-400 font-medium">
                      <Upload size={16} className="group-hover:text-white transition-colors animate-pulse" />
                      <span>Upload 16x16 / 32x32 pixel shortcut icon</span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">ICO/PNG</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">reCAPTCHA v2 / v3 Enterprise Site Key</label>
                  <input
                    type="text"
                    required
                    value={recaptchaSite}
                    onChange={(e) => setRecaptchaSite(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">reCAPTCHA Private Secret Key</label>
                  <input
                    type="password"
                    required
                    value={recaptchaSecret}
                    onChange={(e) => setRecaptchaSecret(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Terms of Service Public URL</label>
                  <input
                    type="text"
                    required
                    value={termsUrl}
                    onChange={(e) => setTermsUrl(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Privacy Policy Public URL</label>
                  <input
                    type="text"
                    required
                    value={privacyUrl}
                    onChange={(e) => setPrivacyUrl(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              TAB 2: EMAIL SMTP SETTINGS (SMTP & Templates)
             ========================================== */}
          {activeTab === 'email' && (
            <motion.div
              key="email-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Mail Server Gateway (SMTP)</h3>
                  <p className="text-[11px] text-gray-500 mt-1">Configure secure transaction emails for password recoveries, balance warnings and bulk orders.</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestSmtpConnection}
                  className="px-3.5 py-2.5 bg-red-500/10 hover:bg-[#FF4757] text-[#FF4757] hover:text-white border border-[#FF4757]/20 hover:border-transparent text-[11px] font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer"
                >
                  Ping test mail server
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5 pt-2">
                <div className="space-y-1.5 font-mono md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Host / Server Link</label>
                  <input
                    type="text"
                    required
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Port Number</label>
                  <input
                    type="text"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Encryption Handshake</label>
                  <select
                    value={smtpEncryption}
                    onChange={(e) => setSmtpEncryption(e.target.value as any)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-medium"
                  >
                    <option value="TLS">TLS handshake/Auto</option>
                    <option value="SSL">SSL Handshake legacy</option>
                    <option value="None">None (Unencrypted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Username</label>
                  <input
                    type="text"
                    required
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Server Password</label>
                  <input
                    type="password"
                    required
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 border-b border-[#252836] pb-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mail Sender Label (From name)</label>
                  <input
                    type="text"
                    required
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">From Email Address</label>
                  <input
                    type="email"
                    required
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* EMAIL TEMPLATES SECS */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Automated Notification Templates</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="bg-[#12141A] border border-[#252836] p-4 rounded-2xl flex flex-col justify-between hover:border-red-500/20 transition-all gap-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-black text-white px-2 py-0.5 rounded bg-white/4 border border-[#2a2d3c]">{template.name}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 uppercase rounded ${
                            template.isEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 bg-white/2'
                          }`}>
                            {template.isEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-300 truncate mt-3 font-mono">Subj: {template.subject}</h5>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-normal font-sans">{template.body}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingTemplate(template)}
                        className="w-full py-2 bg-[#1A1D26] hover:bg-[#FF4757]/15 border border-[#2d3042] hover:border-transparent text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        <span>Configure email body</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* ==========================================
              TAB 3: SECURITY POLICIES
             ========================================== */}
          {activeTab === 'security' && (
            <motion.div
              key="security-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">System Security Handshake</h3>
                <p className="text-[11px] text-gray-500 mt-1">Implement strict brute force protection locks, session cookies validity bounds and restrict network IP classes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-2">
                <div className="bg-[#12141A] p-4 rounded-2xl border border-[#252836] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-tight">Enforce SSL Protocols (HTTPS)</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 leading-normal">Forces rewrite of protocol headers on incoming requests safely.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForceHttps(!forceHttps)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                      forceHttps ? 'bg-[#FF4757]/15 border-red-500/40 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full transition-all ${
                      forceHttps ? 'bg-[#FF4757]' : 'bg-gray-400'
                    }`} />
                  </button>
                </div>

                <div className="bg-[#12141A] p-4 rounded-2xl border border-[#252836] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-tight">Mandate Email Verification</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 leading-normal">Requires clients to click token authorization links before ordering.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireVerification(!requireVerification)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                      requireVerification ? 'bg-[#FF4757]/15 border-red-500/40 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full transition-all ${
                      requireVerification ? 'bg-[#FF4757]' : 'bg-gray-400'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Allowed Fail Counts before Block</label>
                  <input
                    type="number"
                    required
                    value={loginAttempts}
                    onChange={(e) => setLoginAttempts(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Audit Lockout Expiry (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={lockoutDuration}
                    onChange={(e) => setLockoutDuration(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inactivity Cookie Expiry (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Strict IP Whitelist for Administrators (One per line)</label>
                  <textarea
                    rows={3}
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="Enter valid IP subnets..."
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Blacklisted Bot IP Ranges</label>
                  <textarea
                    rows={3}
                    value={ipBlacklist}
                    onChange={(e) => setIpBlacklist(e.target.value)}
                    placeholder="Enter banned IP subnets..."
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="bg-[#12141A]/60 p-4.5 rounded-2xl border border-red-500/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#FF4757] uppercase tracking-wider">Mandate 2FA Security validation for Admins</span>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Forces secure time-based Google Authenticator dynamic challenges on every logging attempt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequire2faAdmin(!require2faAdmin)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                      require2faAdmin ? 'bg-red-500/15 border-red-500/40 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full transition-all ${
                      require2faAdmin ? 'bg-[#FF4757]' : 'bg-gray-400'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              TAB 4: REFERRAL PROGRAM (Affiliate Net)
             ========================================== */}
          {activeTab === 'referral' && (
            <motion.div
              key="referral-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Affiliate & referral Programs</h3>
                  <p className="text-[11px] text-gray-500 mt-1">Configure automated cashbacks for partner nodes driving customer registrations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableAffiliate(!enableAffiliate)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                    enableAffiliate
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-gray-400 border-slate-700'
                  }`}
                >
                  <span>Affiliate System: {enableAffiliate ? 'ACTIVE' : 'MUTED'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2 font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commission Ratio Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Apply Commission Reward On</label>
                  <select
                    value={commissionOn}
                    onChange={(e) => setCommissionOn(e.target.value as any)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-sans font-medium"
                  >
                    <option value="Deposits">Deposits Only (Gross additions)</option>
                    <option value="Orders">Placed SMM Orders Only</option>
                    <option value="Both">Both (Gross Deposits & Placed campaigns)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min Referral Payout ($)</label>
                  <input
                    type="number"
                    required
                    value={refMinWithdrawal}
                    onChange={(e) => setRefMinWithdrawal(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-2">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Link Cookie Validity Window (Days)</label>
                  <input
                    type="number"
                    required
                    value={cookieDuration}
                    onChange={(e) => setCookieDuration(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-[#12141A]/80 p-4 rounded-xl border border-[#252836] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">Automate Commission Clearances</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Skips manual inspection of affiliate orders logs.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoApproveCommission(!autoApproveCommission)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                      autoApproveCommission ? 'bg-[#FF4757]/15 border-red-500/40 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full transition-all ${
                      autoApproveCommission ? 'bg-[#FF4757]' : 'bg-gray-400'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              TAB 5: MAINTENANCE PROTOCOLS
             ========================================== */}
          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-[#252836]">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Maintenance Modes</h3>
                  <p className="text-[11px] text-gray-500 mt-1">Halt public registration systems and service boards dynamically when doing data sync or system upgrades.</p>
                </div>

                {/* BIG RED SWITCH TOGGLE */}
                <button
                  type="button"
                  onClick={() => {
                    const nextSt = !maintenanceMode;
                    setMaintenanceMode(nextSt);
                    onShowToast(`Maintenance Protocol switched: ${nextSt ? 'ONLINE - CUSTOMERS LOCKED' : 'OFFLINE - PUBLIC USERS CLEARED'}`);
                  }}
                  className={`flex items-center gap-2.5 px-4.5 py-3 rounded-2xl text-xs font-black transition-all border cursor-pointer uppercase tracking-tight ${
                    maintenanceMode
                      ? 'bg-red-500 hover:bg-red-650 text-white border-transparent shadow-lg shadow-red-500/20'
                      : 'bg-[#12141A] hover:bg-slate-800 text-slate-350 border-[#2b2e3e]'
                  }`}
                >
                  <AlertTriangle size={15} className={maintenanceMode ? 'animate-bounce' : ''} />
                  <span>Maintenance: {maintenanceMode ? 'ACTIVE (LOCKED)' : 'DEACTIVATED'}</span>
                </button>
              </div>

              {/* WARNING BOX */}
              {maintenanceMode && (
                <div className="bg-red-500/10 border-2 border-dashed border-red-500/35 p-5 rounded-2.5xl flex items-start gap-4 animate-pulse">
                  <div className="p-2.5 bg-red-500/20 text-[#FF4757] rounded-xl shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">WARNING: MAINTENANCE LOCK PROTOCOL ENGAGED</h4>
                    <p className="text-xs text-brand-text-secondary leading-relaxed">
                      Every normal reseller client session will be forcefully terminated. Customers landing on the panel homepage will be shown your dynamic custom message below. Only whitelisted IP classes specified inside allowed terminals config bypass these constraints.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dynamic Halt Notification Message</label>
                  <textarea
                    required
                    rows={4}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Specify real-time reasons..."
                    className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-3 rounded-xl text-white outline-none focus:border-red-500 font-bold leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Allowed Bypass Bypassing Whitelists IP <span className="text-gray-600">(One per line)</span></label>
                  <textarea
                    required
                    rows={4}
                    value={allowedMaintenanceIps}
                    onChange={(e) => setAllowedMaintenanceIps(e.target.value)}
                    placeholder="127.0.0.1"
                    className="w-full bg-[#12141A] border border-[#2b2e3e] text-xs p-3 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              TAB 6: SEO METADATA
             ========================================== */}
          {activeTab === 'seo' && (
            <motion.div
              key="seo-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">SEO Metadata & Crawlers</h3>
                <p className="text-[11px] text-gray-500 mt-1">Bootstrap landing page ranking scores inside Google, Bing and DuckDuckGo indexes.</p>
              </div>

              <div className="space-y-1.5 font-sans pt-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">HTML Title Element</label>
                <input
                  type="text"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meta Description</label>
                <textarea
                  required
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target SEO Keywords <span className="text-gray-500">(comma-separated)</span></label>
                  <input
                    type="text"
                    required
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Google Analytics Tracking ID (UA/G-)</label>
                  <input
                    type="text"
                    required
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* SUBMIT ROW BUTTON */}
        <div className="flex justify-end gap-3 pt-5 border-t border-[#252836]">
          <button
            type="button"
            onClick={() => onShowToast('Setting resets aborted.')}
            className="px-4.5 py-3 bg-[#12141A] hover:bg-slate-800 border border-[#2b2e3e] text-slate-350 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-5.5 py-3 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/5 flex items-center gap-1.5"
          >
            <Activity size={13} className="animate-spin" />
            <span>Commit & Update Ledger State</span>
          </button>
        </div>

      </form>

      {/* MODAL WINDOW FOR EMAIL TEMPLATE EDITING */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] text-left select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D26] border border-[#252836] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  <MailQuestion size={16} className="text-[#00D4FF]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Configure Automated Email</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleEditTemplateSave} className="space-y-4">
                <div className="p-3 bg-[#12141A] rounded-xl border border-[#252836] text-[11px] text-slate-400 leading-normal">
                  Editing: <strong className="text-white">{editingTemplate.name} Notification Trigger</strong>.<br />
                  Inject variables dynamically inside curly brackets: <code className="text-brand-cyan font-mono">{"{{username}}"}</code>, <code className="text-brand-cyan font-mono">{"{{token}}"}</code>, <code className="text-brand-cyan font-mono">{"{{amount}}"}</code>, <code className="text-brand-cyan font-mono">{"{{orderId}}"}</code>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Message Body (HMTL/String)</label>
                  <textarea
                    required
                    rows={5}
                    value={editingTemplate.body}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    className="w-full bg-[#12141A] border border-[#292c3d] text-xs p-3 rounded-xl text-white outline-none focus:border-red-500 font-semibold leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#252836]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate({ ...editingTemplate, isEnabled: !editingTemplate.isEnabled })}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-all outline-none border cursor-pointer flex items-center ${
                        editingTemplate.isEnabled ? 'bg-emerald-500/15 border-emerald-500/30 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full transition-all ${
                        editingTemplate.isEnabled ? 'bg-[#00C896]' : 'bg-gray-400'
                      }`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase">Enable this notification</span>
                      <span className="text-[8.5px] text-gray-550">SMTP trigger authority</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#252836]">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 bg-[#12141A] border border-[#1b1d28] text-slate-350 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-805 transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-[#FF4757] hover:bg-red-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Save Template
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
