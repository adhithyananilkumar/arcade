'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Users, Award, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { WorkshopPreviewDto, PricingModel } from '@/app/(authenticated)/studio/workshop/types';
import { getMyRegistrationStatus, registerForWorkshop } from '@/app/workshop/api/registration';
import { toast } from 'sonner';

interface Props {
  preview: WorkshopPreviewDto;
  onRegister?: () => Promise<void>;
}

export const RegistrationSidebar: React.FC<Props> = ({ preview, onRegister }) => {
  const { basicInfo, pricing, settings } = preview;
  
  const [registration, setRegistration] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // If we're inside the studio wizard (no real ID yet), skip fetching
    if (!basicInfo.id) {
      setLoadingStatus(false);
      return;
    }
    
    // Fetch current user's registration status
    getMyRegistrationStatus(basicInfo.id)
      .then(data => {
        setRegistration(data);
      })
      .catch(err => {
        console.error('Failed to fetch registration status:', err);
      })
      .finally(() => {
        setLoadingStatus(false);
      });
  }, [basicInfo.id]);

  const handleRegister = async () => {
    if (!onRegister && !basicInfo.id) {
      toast.success('This is a preview. Registration would happen here!');
      return;
    }

    setIsRegistering(true);
    try {
      if (onRegister) {
        await onRegister();
      } else {
        await registerForWorkshop(basicInfo.id!);
        toast.success('Successfully registered for workshop!');
      }
      
      // Refresh status after successful registration
      const newStatus = await getMyRegistrationStatus(basicInfo.id!);
      setRegistration(newStatus);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message?.includes('401')) {
        toast.error('Please log in to register.');
      } else if (err.message?.includes('409') || err.message?.includes('already registered')) {
        toast.error('You are already registered for this workshop.');
      } else {
        toast.error(err.message || 'Failed to register. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  // 1. Loading State
  if (loadingStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Already Registered State
  if (registration) {
    const status = registration.registrationStatus;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-6 overflow-hidden">
        {/* Status Header */}
        <div className={`-mx-6 -mt-6 p-4 mb-6 text-white text-center font-medium shadow-sm flex items-center justify-center gap-2 ${
          status === 'APPROVED' || status === 'COMPLETED' ? 'bg-emerald-500' : 
          status === 'WAITLISTED' ? 'bg-amber-500' :
          status === 'REJECTED' || status === 'CANCELLED' ? 'bg-red-500' :
          'bg-blue-500' // PENDING
        }`}>
          {status === 'APPROVED' || status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          <span>{status === 'APPROVED' ? 'Registration Approved' : 
                 status === 'WAITLISTED' ? 'You are on the Waitlist' :
                 status === 'PENDING' ? 'Registration Pending' :
                 status === 'REJECTED' ? 'Registration Rejected' :
                 status === 'CANCELLED' ? 'Registration Cancelled' :
                 status === 'COMPLETED' ? 'Workshop Completed' : status}</span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="text-gray-500 dark:text-gray-400">Date Registered</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(registration.registrationDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="text-gray-500 dark:text-gray-400">Payment Status</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">
              {registration.paymentStatus.toLowerCase()}
            </span>
          </div>
        </div>

        {status === 'APPROVED' && (
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-2">
            View Workshop
          </button>
        )}
        
        {status === 'WAITLISTED' && (
          <button disabled className="w-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold py-3 px-4 rounded-lg shadow-sm mb-2 opacity-80 cursor-not-allowed border border-amber-200 dark:border-amber-800">
            On Waitlist
          </button>
        )}
        
        {status === 'PENDING' && (
          <button disabled className="w-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold py-3 px-4 rounded-lg shadow-sm mb-2 opacity-80 cursor-not-allowed border border-blue-100 dark:border-blue-800">
            Pending Approval
          </button>
        )}

        {status === 'COMPLETED' && (
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-2">
            View Certificate
          </button>
        )}
      </div>
    );
  }

  // 3. Not Registered State (Default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-6">
      <div className="mb-6">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {pricing?.pricingModel === PricingModel.FREE ? 'Free' : formatCurrency(pricing?.price || 0, pricing?.currency || 'USD')}
        </span>
        {pricing?.pricingModel !== PricingModel.FREE && pricing?.earlyBirdEnabled && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
            Early bird pricing available
          </p>
        )}
      </div>

      <button 
        onClick={handleRegister}
        disabled={isRegistering}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
        {isRegistering && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {isRegistering ? 'Registering...' : 'Register Now'}
      </button>

      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span>{basicInfo.deliveryMode === 'ONLINE' ? 'Online Workshop' : 'In-Person'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <span>{basicInfo.difficulty?.charAt(0) + basicInfo.difficulty?.slice(1).toLowerCase()} Level</span>
        </div>
        {settings?.certificateEnabled && (
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-gray-400" />
            <span>Certificate of Completion</span>
          </div>
        )}
        {settings?.recordingAvailable && (
          <div className="flex items-center gap-3">
            <PlayCircle className="w-5 h-5 text-gray-400" />
            <span>Recordings Included</span>
          </div>
        )}
      </div>
    </div>
  );
};
