'use client';

import { useEffect, useState } from 'react';
import { Organization, OrganizationService } from '@/services/platform/tenancy/organization.service';
import { Building2, Plus, Users, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [error, setError] = useState('');

  const { user } = useAuthStore();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await OrganizationService.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    setError('');
    
    try {
      const newOrg = await OrganizationService.createOrganization(newOrgName);
      setOrganizations([...organizations, newOrg]);
      setNewOrgName('');
    } catch (err: any) {
      const data = err.response?.data;
      // Spring Boot can return validation errors as { message }, { error }, or { errors: [...] }
      const message =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.defaultMessage || e.message).join(', ') : null) ||
        (typeof data === 'string' ? data : null) ||
        `Error ${err.response?.status ?? ''}: An unexpected error occurred`;
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Organizations</h1>
          <p className="text-gray-500 mt-1">Manage your workspaces and team members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Organization List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center p-6">
              <Building2 className="text-gray-400 mb-2" size={32} />
              <h3 className="text-sm font-semibold text-gray-900">No organizations found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">Create an organization to start collaborating with your team.</p>
            </div>
          ) : (
            organizations.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/dashboard/organizations/${org.id}`}>
                  <div className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{org.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          Created {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Organization Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Create Organization</h3>
            <p className="text-sm text-gray-500 mb-6">Create a new workspace to invite members and assign roles.</p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating || !newOrgName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Create Organization
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
