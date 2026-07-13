'use client';

import { useEffect, useState, useRef } from 'react';
import { Organization, OrganizationMembership, OrganizationService } from '@/services/organization.service';
import { Building2, ArrowLeft, Mail, Shield, User as UserIcon, Loader2, CheckCircle2, Trash2, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  
  const [isLeaving, setIsLeaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');

  // Org Settings fields
  const [orgName, setOrgName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [address, setAddress] = useState('');
  const [studentVolunteer, setStudentVolunteer] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (org) {
      setOrgName(org.name || '');
      setDescription(org.description || '');
      setEmail(org.email || '');
      setPhone(org.phone || '');
      setAdminName(org.adminName || '');
      setAdminTitle(org.adminTitle || '');
      setAddress(org.address || '');
      setStudentVolunteer(org.studentVolunteer || '');
      setLogoUrl(org.logoUrl || '');
    }
  }, [org]);

  const getLogoUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/courses/media/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError('');

    try {
      const updatedOrg = await OrganizationService.updateOrgProfile(id as string, {
        name: orgName,
        description,
        email,
        phone,
        adminName,
        adminTitle,
        address,
        studentVolunteer,
      });
      setOrg(updatedOrg);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setSettingsError(err.response?.data?.message || 'Failed to update organization profile');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setLogoError('Image must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    setLogoError('');

    try {
      const updatedOrg = await OrganizationService.uploadLogo(id as string, file);
      setOrg(updatedOrg);
      setLogoUrl(updatedOrg.logoUrl || '');
    } catch (err: any) {
      setLogoError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await OrganizationService.updateMemberRole(id as string, userId, newRole);
      const membersData = await OrganizationService.getMembers(id as string);
      setMembers(membersData);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the organization?')) return;
    try {
      await OrganizationService.removeMember(id as string, userId);
      const membersData = await OrganizationService.getMembers(id as string);
      setMembers(membersData);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [orgData, membersData] = await Promise.all([
        OrganizationService.getOrganization(id as string),
        OrganizationService.getMembers(id as string)
      ]);
      setOrg(orgData);
      setMembers(membersData);
    } catch (err) {
      console.error('Failed to load organization', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError('');
    setInviteSuccess(false);
    
    try {
      await OrganizationService.inviteUser(id as string, inviteEmail, inviteRole);
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 5000);
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this organization?')) return;
    
    setIsLeaving(true);
    try {
      await OrganizationService.leaveOrganization(id as string);
      router.push('/dashboard/organizations');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to leave organization');
      setIsLeaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!org) return <div>Organization not found</div>;

  const myMembership = members.find(m => m.user.id === user?.id);
  const isOwner = myMembership?.role === 'OWNER';
  const isAdmin = myMembership?.role === 'ADMIN';
  const isAdminOrOwner = isOwner || isAdmin;

  return (
    <div className="max-w-6xl space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/dashboard/organizations" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 mb-3 transition-colors">
            <ArrowLeft size={16} /> Back to Organizations
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 overflow-hidden border border-gray-100">
              {org.logoUrl ? (
                <img src={getLogoUrl(org.logoUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={32} />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{org.name}</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                Created {new Date(org.createdAt).toLocaleDateString()}
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-medium text-gray-700">{members.length} Members</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLeave}
            disabled={isLeaving}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isLeaving ? 'Leaving...' : 'Leave Organization'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {isAdminOrOwner && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('members')}
              className={`border-b-2 py-4 px-1 text-sm font-semibold transition-all ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Members & Roles
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 py-4 px-1 text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Profile Settings
            </button>
          </nav>
        </div>
      )}

      {activeTab === 'members' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-lg font-bold text-gray-900">Members</h3>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {members.map((member) => (
                <li key={member.user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                      {member.user.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {member.user.fullName}
                        {member.user.id === user?.id && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdminOrOwner && member.user.id !== user?.id && (member.role !== 'OWNER' || isOwner) ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                          className="text-xs rounded-xl border-gray-200 border bg-white px-2.5 py-1.5 font-semibold text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-all"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                          <option value="CONTENT_CREATOR">Content Creator</option>
                          <option value="STAFF">Staff</option>
                          <option value="STUDENT">Student</option>
                          {isOwner && <option value="OWNER">Owner</option>}
                        </select>
                        
                        <button
                          onClick={() => handleRemoveMember(member.user.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-xl transition-all"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        member.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                        member.role === 'CONTENT_CREATOR' ? 'bg-amber-100 text-amber-700' :
                        member.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                        member.role === 'STUDENT' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {member.role === 'OWNER' && <Shield size={12} />}
                        {member.role.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Invite Form */}
        <div className="lg:col-span-1">
          {isAdminOrOwner ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Mail size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Invite Team Member</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Send an email invitation to collaborate in {org.name}.</p>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border bg-white"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CONTENT_CREATOR">Content Creator</option>
                    <option value="STAFF">Staff</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                {inviteError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
                    {inviteError}
                  </div>
                )}
                
                {inviteSuccess && (
                  <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Invitation sent successfully! Check backend console for raw token.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  {isInviting ? <Loader2 className="animate-spin" size={18} /> : 'Send Invitation'}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center shadow-sm">
              <Shield className="mx-auto text-gray-400 mb-3" size={32} />
              <h3 className="text-sm font-bold text-gray-900">Permission Required</h3>
              <p className="text-xs text-gray-500 mt-1">Only Owners and Admins can invite new members to this organization.</p>
            </div>
          )}
        </div>
      </div>

      {/* Organization Activity Log */}
      <div className="mt-8">
        <OrgActivityLog orgId={id as string} />
      </div>
    </>
  )}

  {activeTab === 'settings' && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left side: Logo upload */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Logo</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group shadow-inner">
              {logoUrl ? (
                <img src={getLogoUrl(logoUrl)} alt="Org logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={48} className="text-gray-400" />
              )}
              {isUploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoSelect}
              className="hidden"
              accept="image/*"
            />
            
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
            >
              <Camera size={16} />
              {logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
            
            {logoError && (
              <p className="text-xs text-red-600 font-medium text-center">{logoError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Settings Form */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h3>
          
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Administrator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Principal name, Chairman name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Administrator Title</label>
                <input
                  type="text"
                  placeholder="e.g. Principal, Chairman, Director"
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Volunteer Info</label>
                <input
                  type="text"
                  value={studentVolunteer}
                  onChange={(e) => setStudentVolunteer(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                />
              </div>
            </div>

            {settingsError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
                {settingsError}
              </div>
            )}
            
            {settingsSuccess && (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Settings updated successfully!
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                {isSavingSettings ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )}
</div>
  );
}

function OrgActivityLog({ orgId }: { orgId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs(0);
  }, [orgId]);

  const loadLogs = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const { AuditService } = await import('@/services/audit.service');
      const data = await AuditService.getOrgAuditLogs(orgId, pageNumber);
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error('Failed to load org logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Activity Log</h3>
        <span className="text-sm text-gray-500">Page {page + 1} of {totalPages === 0 ? 1 : totalPages}</span>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">No recent activity.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {logs.map((log) => (
            <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900 text-sm">{log.action.replace(/_/g, ' ')}</p>
              <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(log.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      
      {totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
          <button
            onClick={() => loadLogs(page - 1)}
            disabled={page === 0}
            className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => loadLogs(page + 1)}
            disabled={page >= totalPages - 1}
            className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
