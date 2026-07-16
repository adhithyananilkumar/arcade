'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, PlaySquare } from 'lucide-react';
import { channelService } from '@/services/channel.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateChannelModal({ isOpen, onClose, onSuccess }: CreateChannelModalProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    try {
      setIsLoading(true);
      const finalName = isPersonal ? (user?.fullName || 'User') : name;
      await channelService.createChannelRequest(finalName, description, isPersonal, iconFile || undefined);
      toast.success('Channel creation requested successfully');
      setName('');
      setDescription('');
      setIconFile(null);
      setIconPreview(null);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create channel request');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PlaySquare className="text-indigo-600" size={20} />
                  Create Channel
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Channel Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isPersonal}
                        onChange={() => setIsPersonal(true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Personal Channel</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isPersonal}
                        onChange={() => {
                          setIsPersonal(false);
                          setName('');
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Organization Channel</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative group cursor-pointer mt-2">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center transition-colors group-hover:border-indigo-400 group-hover:bg-indigo-50">
                      {iconPreview ? (
                        <img src={iconPreview} alt="Icon preview" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-400 group-hover:text-indigo-500 mb-1" />
                          <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600">Upload Icon</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={isPersonal ? (user?.fullName || '') : name}
                    onChange={(e) => !isPersonal && setName(e.target.value)}
                    readOnly={isPersonal}
                    className={`w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isPersonal ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="E.g., Tech Tutorials"
                    required
                  />
                </div>

                {!isPersonal && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Organization Admin
                    </label>
                    <input
                      type="text"
                      value={user?.fullName || ''}
                      readOnly
                      className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                    About / Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    placeholder="What is your channel about?"
                  />
                </div>



                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      'Create Channel Request'
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Your request will be reviewed by an administrator.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
