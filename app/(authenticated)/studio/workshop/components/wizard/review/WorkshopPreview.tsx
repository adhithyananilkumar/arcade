import React from 'react';
import { WorkshopPreviewDto, PricingModel } from '@/app/(authenticated)/studio/workshop/types';
import { Calendar, Clock, MapPin, Users, Award, PlayCircle } from 'lucide-react';
import Image from 'next/image';

interface Props {
  preview: WorkshopPreviewDto;
}

export const WorkshopPreview: React.FC<Props> = ({ preview }) => {
  const { basicInfo, schedule, resources, pricing, settings } = preview;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const getStartDate = () => {
    if (!schedule || schedule.length === 0) return 'No sessions scheduled';
    const sorted = [...schedule].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return new Date(sorted[0].startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full min-h-full">
      {/* Hero Section */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200 dark:bg-gray-800">
        {basicInfo.coverImageUrl ? (
          <Image 
            src={basicInfo.coverImageUrl} 
            alt={basicInfo.title || 'Cover'} 
            layout="fill" 
            objectFit="cover" 
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No Cover Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full mb-3">
              {basicInfo.category || 'Uncategorized'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
              {basicInfo.title || 'Untitled Workshop'}
            </h1>
            {basicInfo.subtitle && (
              <p className="text-lg text-gray-200 line-clamp-2 max-w-2xl">
                {basicInfo.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 flex flex-col md:flex-row gap-10">
        
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this workshop</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {basicInfo.description ? (
                <p className="whitespace-pre-wrap">{basicInfo.description}</p>
              ) : (
                <p className="italic text-gray-400">No description provided.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Schedule</h2>
            {schedule && schedule.length > 0 ? (
              <div className="space-y-4">
                {schedule.map((session, idx) => (
                  <div key={session.id || idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{session.title}</h4>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(session.startDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(session.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {session.deliveryMode === 'ONLINE' && <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4" /> Online Meeting</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No sessions scheduled.</p>
            )}
          </section>

        </div>

        {/* Sidebar (Right) */}
        <div className="w-full md:w-80 flex-shrink-0">
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

            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors mb-6">
              Register Now
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
        </div>
      </div>
    </div>
  );
};
