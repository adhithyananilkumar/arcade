'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WorkshopHeader } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopHeader';
import { WorkshopStepper } from '@/app/(authenticated)/studio/workshop/components/wizard/WorkshopStepper';
import { WorkshopFooter } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopFooter';
import { BasicInformationStep } from '@/app/(authenticated)/studio/workshop/components/wizard/BasicInformationStep';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { createWorkshop } from '@/app/(authenticated)/studio/workshop/api/workshop';

export const WorkshopWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const form = useWorkshopForm();

  const handleSaveDraft = async () => {
    try {
      form.setIsSubmitting(true);
      
      // We only save if basic fields are roughly valid to avoid sending complete trash
      if (!form.formData.title || !form.formData.category) {
        toast.error('Title and Category are required to save a draft.');
        return;
      }

      await createWorkshop(form.formData as any);
      toast.success('Workshop draft saved successfully!');
      router.push('/studio'); // Go back to studio dashboard or to the newly created edit page
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save draft. Please try again.');
    } finally {
      form.setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // In Phase 1, only step 1 is implemented.
    toast.info('Phase 1 limits: Only Basic Information can be completed currently.');
  };

  const handleBack = () => {
    router.push('/studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WorkshopHeader />
      
      <div className="flex flex-col md:flex-row gap-8">
        <WorkshopStepper currentStep={currentStep} />
        
        <div className="flex-1 min-w-0">
          {currentStep === 0 && <BasicInformationStep form={form} />}
          
          <WorkshopFooter 
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            onContinue={handleContinue}
            canContinue={form.isValid}
            isSaving={form.isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
