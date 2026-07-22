'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WorkshopHeader } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopHeader';
import { WorkshopStepper } from '@/app/(authenticated)/studio/workshop/components/wizard/WorkshopStepper';
import { WorkshopFooter } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopFooter';
import { BasicInformationStep } from '@/app/(authenticated)/studio/workshop/components/wizard/BasicInformationStep';
import { ScheduleStep } from '@/app/(authenticated)/studio/workshop/components/wizard/schedule/ScheduleStep';
import { ResourcesStep } from '@/app/(authenticated)/studio/workshop/components/wizard/resources/ResourcesStep';
import { PricingStep } from '@/app/(authenticated)/studio/workshop/components/wizard/pricing/PricingStep';
import { SettingsStep } from '@/app/(authenticated)/studio/workshop/components/wizard/settings/SettingsStep';
import { ReviewStep } from '@/app/(authenticated)/studio/workshop/components/wizard/review/ReviewStep';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { createWorkshop, updateWorkshop } from '@/app/(authenticated)/studio/workshop/api/workshop';

export const WorkshopWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const form = useWorkshopForm();

  const handleSaveDraft = async (navigateAfterSave = true) => {
    try {
      form.setIsSubmitting(true);

      // We only save if basic fields are roughly valid to avoid sending complete trash
      if (!form.formData.title || !form.formData.category) {
        toast.error('Title and Category are required to save a draft.');
        return null;
      }

      if (Object.keys(form.errors).length > 0) {
        toast.error(Object.values(form.errors)[0] as string);
        return null;
      }

      // Ensure language is set for backend validation
      const createPayload: any = {
        title: form.formData.title,
        subtitle: form.formData.subtitle,
        description: form.formData.description,
        category: form.formData.category,
        tags: form.formData.tags,
        thumbnailUrl: form.formData.thumbnailUrl,
        coverImageUrl: form.formData.coverImageUrl,
        promoVideoUrl: form.formData.promoVideoUrl,
        workshopType: form.formData.workshopType,
        deliveryMode: form.formData.deliveryMode,
        difficulty: form.formData.difficulty,
        language: form.formData.language || 'en',
        price: form.formData.price || 0,
        currency: form.formData.currency || 'USD',
        capacity: form.formData.capacity === '' ? null : form.formData.capacity,
        visibility: form.formData.visibility
      };

      const workshopId = (form.formData as any).id;
      let savedId = workshopId;

      if (workshopId) {
        await updateWorkshop(workshopId, createPayload);
      } else {
        const response = await createWorkshop(createPayload);
        savedId = response.id;
        form.handleChange('id' as any, response.id); // Save ID back to form to avoid duplicates
      }

      toast.success('Workshop draft saved successfully!');
      if (navigateAfterSave) {
        router.push('/studio');
      }
      return savedId;
    } catch (error: any) {
      console.error('Save Draft Error:', error);
      const errorMessage = error?.message || 'Failed to save draft. Please try again.';
      toast.error(errorMessage);
      return null;
    } finally {
      form.setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/studio');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WorkshopHeader />

      <div className="flex flex-col md:flex-row gap-8">
        <WorkshopStepper currentStep={currentStep} onSelectStep={setCurrentStep} />

        <div className="flex-1 min-w-0">
          {currentStep === 0 && <BasicInformationStep form={form} />}
          {currentStep === 1 && <ScheduleStep form={form} />}
          {currentStep === 2 && <ResourcesStep form={form} />}
          {currentStep === 3 && <PricingStep form={form} />}
          {currentStep === 4 && <SettingsStep form={form} />}
          {currentStep === 5 && <ReviewStep form={form} onNavigateToStep={setCurrentStep} onSaveDraft={handleSaveDraft} isSaving={form.isSubmitting} />}

          {(currentStep < 5 || !(form.formData as any).id) && (
            <WorkshopFooter
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              onContinue={currentStep < 5 ? handleContinue : undefined}
              canContinue={currentStep === 0 ? form.isValid : true}
              isSaving={form.isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};
