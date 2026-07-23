'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { channelService } from "@/domains/channels";
import { Tv, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewChannelPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    try {
      setLoading(true);
      await channelService.createChannelRequest(name, description, isPersonal, iconFile || undefined);
      toast.success('Channel request submitted successfully!');
      router.push('/');
    } catch (error) {
      toast.error('Failed to submit channel request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a Channel</h1>
        <p className="mt-2 text-gray-500">Submit a request to start your own channel and publish content.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            
            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Channel Icon</label>
              <div className="mt-2 flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 overflow-hidden">
                  {iconFile ? (
                    <img src={URL.createObjectURL(iconFile)} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Tv size={32} />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm inline-block">
                    <span>Upload icon</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Channel Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adhithyan's Tech Hub"
                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this channel about?"
                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Personal Channel</h4>
                <p className="text-sm text-gray-500 mt-1">Is this channel for an individual or an organization?</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPersonal(!isPersonal)}
                className={`${isPersonal ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
              >
                <span className={`${isPersonal ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
            
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
