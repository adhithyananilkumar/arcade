'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mail, 
  Phone, 
  Home, 
  Briefcase, 
  MapPin, 
  User, 
  FileText, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Edit2,
  X,
  Upload,
  RefreshCw,
  Video
} from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalInfoPage() {
  const { user } = useAuthStore();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Photo Upload & Capture States
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  );
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable States
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const [name, setName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'ATHIRA BIJU'
  );
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [homeAddress, setHomeAddress] = useState('Not set');
  const [workAddress, setWorkAddress] = useState('Not set');
  const [otherAddresses, setOtherAddresses] = useState('None');

  const userEmail = user?.email || 'athirabiju2027@mca.ajce.in';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSaveField = (field: string) => {
    setEditingField(null);
    toast.success(`${field} updated successfully`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        toast.success('Photo uploaded and updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakeSnapshot = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      setIsCaptureModalOpen(false);
      setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop');
      toast.success('Proctored KYC photo captured and verified!');
    }, 1200);
  };

  return (
    <motion.div 
      className="space-y-1 pb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* ─── Clean Flat List Grid (No Card Background Box Styling) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        
        {/* Item 1: Proctored Exam KYC Photo */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Camera size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                Proctored Exam KYC Photo
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Upload size={10} /> Upload
                </button>
                <span className="text-slate-300 dark:text-neutral-700">•</span>
                <button
                  onClick={() => setIsCaptureModalOpen(true)}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Camera size={10} /> Capture
                </button>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs">
              <img 
                src={photoUrl} 
                alt="Exam KYC Photo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-white dark:border-[#28292c]">
              <Check size={8} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Item 2: Name (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Name</h3>
              {editingField === 'name' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={() => handleSaveField('Name')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {name} <span className="opacity-60">• ID: 2022-MCA-042</span>
                </p>
              )}
            </div>
          </div>
          {editingField !== 'name' && (
            <button onClick={() => setEditingField('name')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Item 3: Aadhaar Verification */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                Aadhaar Verification
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                  DigiLocker
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 mt-0.5">
                {showAadhaar ? '5482 9102 8921' : 'XXXX XXXX 8921'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAadhaar(!showAadhaar)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title={showAadhaar ? 'Hide' : 'Show'}
          >
            {showAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Item 4: Institutional Email */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">Email</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyEmail}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title="Copy Email"
          >
            {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Item 5: Phone Number (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Phone</h3>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={() => handleSaveField('Phone number')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {phone}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'phone' && (
            <button onClick={() => setEditingField('phone')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Item 6: Gender (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Gender</h3>
              {editingField === 'gender' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <button onClick={() => handleSaveField('Gender')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {gender}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'gender' && (
            <button onClick={() => setEditingField('gender')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Item 7: Home Address (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Home size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Home address</h3>
              {editingField === 'home' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={homeAddress === 'Not set' ? '' : homeAddress}
                    placeholder="Enter home address"
                    onChange={(e) => setHomeAddress(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={() => handleSaveField('Home address')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {homeAddress}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'home' && (
            <button onClick={() => setEditingField('home')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Item 8: Work Address (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <Briefcase size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Work address</h3>
              {editingField === 'work' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={workAddress === 'Not set' ? '' : workAddress}
                    placeholder="Enter work address"
                    onChange={(e) => setWorkAddress(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={() => handleSaveField('Work address')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {workAddress}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'work' && (
            <button onClick={() => setEditingField('work')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Item 9: Other Addresses (Editable) */}
        <div className="py-2.5 px-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-neutral-800/50 transition-colors border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between gap-3 md:col-span-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-slate-400 dark:text-neutral-400 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Other addresses</h3>
              {editingField === 'other' ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={otherAddresses === 'None' ? '' : otherAddresses}
                    placeholder="Enter secondary address"
                    onChange={(e) => setOtherAddresses(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={() => handleSaveField('Other address')} className="p-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingField(null)} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {otherAddresses}
                </p>
              )}
            </div>
          </div>
          {editingField !== 'other' && (
            <button onClick={() => setEditingField('other')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>

      </div>

      {/* ─── Live Camera Capture Modal ─── */}
      <AnimatePresence>
        {isCaptureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#202124] border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Live Proctored KYC Camera</h3>
                </div>
                <button onClick={() => setIsCaptureModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Camera Stream Simulator Container */}
              <div className="relative rounded-2xl bg-slate-950 aspect-video overflow-hidden border-2 border-indigo-500/40 flex flex-col items-center justify-center text-white">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop" 
                  alt="Live Camera Feed"
                  className="w-full h-full object-cover opacity-90"
                />
                
                {/* Facial Mesh Frame Overlay */}
                <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-3xl pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="text-[10px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded-full">
                    FACIAL MESH MATCHED
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  REC • 1080P PROCTORED
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button 
                  onClick={() => setIsCaptureModalOpen(false)} 
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTakeSnapshot}
                  disabled={isCapturing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isCapturing ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                  {isCapturing ? 'Processing...' : 'Take Snapshot'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
