'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Users, Award, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { WorkshopPreviewDto, PricingModel } from '@/app/(authenticated)/studio/events/types';
import { EnrollmentButton } from '@/domains/enrollment/components/EnrollmentButton';
import { UIEnrollmentState } from '@/domains/enrollment/types/enrollment.types';
import { getMyRegistrationStatus } from '@/app/(public)/workshop/api/registration';
import { toast } from 'sonner';

interface Props {
  preview: WorkshopPreviewDto;
  onRegister?: () => Promise<void>;
}

export const RegistrationSidebar: React.FC<Props> = ({ preview, onRegister }) => {
  const { basicInfo, pricing, settings } = preview;
  const [registration, setRegistration] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!basicInfo.id) {
      setLoadingStatus(false);
      return;
    }
    
    getMyRegistrationStatus(basicInfo.id)
      .then((data: any) => {
        setRegistration(data);
      })
      .catch((err: any) => {
        console.error('Failed to fetch registration status:', err);
      })
      .finally(() => {
        setLoadingStatus(false);
      });
  }, [basicInfo.id]);
  const getUIState = (status?: string): UIEnrollmentState => {
    if (!status) return 'NOT_ENROLLED';
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'ENROLLED';
      case 'WAITLISTED':
        return 'WAITLISTED';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'NOT_ENROLLED';
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
          status === 'CANCELLED' ? 'bg-red-500' :
          'bg-blue-500' // PENDING
        }`}>
          {status === 'APPROVED' || status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          <span>{status === 'APPROVED' ? 'Registration Approved' : 
                 status === 'WAITLISTED' ? 'You are on the Waitlist' :
                 status === 'PENDING' ? 'Registration Pending' :
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
        </div>

        {status === 'APPROVED' && (
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-2">
            View Workshop
          </button>
        )}
        
        {status === 'COMPLETED' && (
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-2">
            View Certificate
          </button>
        )}

        <div className="mt-4">
          <EnrollmentButton
            resourceType="EVENT"
            resourceId={basicInfo.id!}
            initialState={getUIState(status)}
            onStateChange={(state) => {
              if (onRegister) {
                onRegister();
              } else {
                getMyRegistrationStatus(basicInfo.id!)
                  .then(setRegistration)
                  .catch(console.error);
              }
            }}
          />
        </div>
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

      <div className="mb-6">
        <EnrollmentButton
          resourceType="EVENT"
          resourceId={basicInfo.id!}
          initialState="NOT_ENROLLED"
          onStateChange={(state) => {
            if (onRegister) {
              onRegister();
            } else {
              getMyRegistrationStatus(basicInfo.id!)
                .then(setRegistration)
                .catch(console.error);
            }
          }}
        />
      </div>

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
