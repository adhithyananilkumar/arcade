'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { WorkshopHeader } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopHeader';
import { WorkshopStepper } from '@/app/(authenticated)/studio/workshop/components/wizard/WorkshopStepper';
import { WorkshopFooter } from '@/app/(authenticated)/studio/workshop/components/layout/WorkshopFooter';
import { BasicInformationStep } from '@/app/(authenticated)/studio/workshop/components/wizard/BasicInformationStep';
import { ScheduleStep } from '@/app/(authenticated)/studio/workshop/components/wizard/schedule/ScheduleStep';
import { PricingStep } from '@/app/(authenticated)/studio/workshop/components/wizard/pricing/PricingStep';
import { SettingsStep } from '@/app/(authenticated)/studio/workshop/components/wizard/settings/SettingsStep';
import { ReviewStep } from '@/app/(authenticated)/studio/workshop/components/wizard/review/ReviewStep';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { createWorkshop, updateWorkshop, getWorkshop } from '@/app/(authenticated)/studio/workshop/api/workshop';

interface WorkshopWizardProps {
  workshopId?: string;
  initialStep?: number;
}

export const WorkshopWizard: React.FC<WorkshopWizardProps> = ({ workshopId: propWorkshopId, initialStep = 0 }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Support both prop-based and URL-param-based workshop id
  const urlId = searchParams?.get('id') || undefined;
  const workshopId = propWorkshopId || urlId;
  
  // Support both prop-based and URL-param-based initial step (1-indexed from URL, 0-indexed internally)
  const urlStep = searchParams?.get('step');
  const startStep = urlStep ? Math.max(0, parseInt(urlStep, 10) - 1) : initialStep;
  
  const [currentStep, setCurrentStep] = useState(startStep);
  const form = useWorkshopForm();

  // Load existing workshop data when editing
  useEffect(() => {
    if (workshopId && !( form.formData as any).id) {
      getWorkshop(workshopId).then((data: any) => {
        // Populate form with existing workshop data
        form.handleChange('id' as any, data.id);
        form.handleChange('title', data.title || '');
        form.handleChange('description', data.description || '');
        form.handleChange('category', data.category || '');
        form.handleChange('workshopType', data.workshopType || 'WORKSHOP');
        form.handleChange('deliveryMode', data.deliveryMode || 'ONLINE');
        form.handleChange('difficulty', data.difficulty || 'BEGINNER');
        form.handleChange('language', data.language || 'en');
        form.handleChange('visibility', data.visibility || 'PRIVATE');
        if (data.price !== undefined) form.handleChange('price', data.price);
        if (data.coverImageUrl) form.handleChange('coverImageUrl', data.coverImageUrl);
        if (data.tags) form.handleChange('tags', data.tags);
      }).catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const handleSaveDraft = async (navigateAfterSave = true) => {
    try {
      form.setIsSubmitting(true);

      if (!form.formData.title || !form.formData.category) {
        toast.error('Title and Category are required to save a draft.');
        return null;
      }

      if (Object.keys(form.errors).length > 0) {
        toast.error(Object.values(form.errors)[0] as string);
        return null;
      }

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

      const existingId = (form.formData as any).id || workshopId;
      let savedId = existingId;

      if (existingId) {
        await updateWorkshop(existingId, createPayload);
      } else {
        const response = await createWorkshop(createPayload);
        savedId = response.id;
        form.handleChange('id' as any, response.id);
      }

      toast.success('Workshop saved successfully!');
      if (navigateAfterSave) {
        router.push(`/studio/workshop/${savedId}/edit`);
      }
      return savedId;
    } catch (error: any) {
      console.error('Save Draft Error:', error);
      toast.error(error?.message || 'Failed to save. Please try again.');
      return null;
    } finally {
      form.setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      const id = (form.formData as any).id || workshopId;
      if (id) {
        router.push(`/studio/workshop/${id}`);
      } else {
        router.push('/studio');
      }
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
          {currentStep === 2 && <PricingStep form={form} />}
          {currentStep === 3 && <SettingsStep form={form} />}
          {currentStep === 4 && <ReviewStep form={form} onNavigateToStep={setCurrentStep} onSaveDraft={handleSaveDraft} isSaving={form.isSubmitting} />}

          {(currentStep < 4 || !((form.formData as any).id || workshopId)) && (
            <WorkshopFooter
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              onContinue={currentStep < 4 ? handleContinue : undefined}
              canContinue={currentStep === 0 ? form.isValid : true}
              isSaving={form.isSubmitting}
            />
          )}

        </div>
      </div>
    </div>
  );
};
