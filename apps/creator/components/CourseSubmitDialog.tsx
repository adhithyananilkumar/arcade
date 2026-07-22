'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/design-system/ui/dialog";
import { Button } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import { CourseResponse } from "@/shared/types/api.types";
import { X, Plus, Clock, CalendarDays, IndianRupee, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";

interface ExamScheduleSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface CourseSubmitDialogProps {
  course: CourseResponse;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { coverImageUrl?: string; pricingModel: 'FREE' | 'PAID'; priceAmount?: number }) => Promise<void>;
}

export function CourseSubmitDialog({ course, open, onClose, onSubmit }: CourseSubmitDialogProps) {
  const [coverImageUrl, setCoverImageUrl] = useState(course.coverImageUrl || "");
  const [pricingModel, setPricingModel] = useState<'FREE' | 'PAID'>(course.pricingModel || 'FREE');
  const [priceAmount, setPriceAmount] = useState<number | "">(course.priceAmount || "");
  
  const [schedule, setSchedule] = useState<ExamScheduleSlot[]>(() => {
    try {
      if (course.examSchedule) {
        return JSON.parse(course.examSchedule);
      }
    } catch (e) {}
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const { key, uploadUrl, publicUrl } = await api.post<any>('/api/media/presign', {
        fileName: file.name,
        contentType: file.type
      });

      // 2. Upload file to presigned URL via internal proxy (bypasses CORS)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadUrl', uploadUrl);

      const uploadRes = await fetch('/api/internal/media/upload', {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

      // 3. Register metadata
      await api.post('/api/media/metadata', {
        key,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size
      });

      setCoverImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (pricingModel === 'PAID' && (priceAmount === "" || priceAmount <= 0)) {
      toast.error("Please enter a valid price for a paid course.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        coverImageUrl: coverImageUrl || undefined,
        pricingModel,
        priceAmount: pricingModel === 'PAID' ? Number(priceAmount) : undefined
      });
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Course for Review</DialogTitle>
          <DialogDescription>
            Configure the final details before sending your course for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Thumbnail Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800"><ImageIcon size={16}/> Course Thumbnail</h3>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-slate-500">{isUploading ? "Uploading..." : "Upload a cover image for your course."}</p>
              </div>
              {coverImageUrl && (
                <div className="w-32 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800"><IndianRupee size={16}/> Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <select 
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-9"
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as 'FREE' | 'PAID')}
                >
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              {pricingModel === 'PAID' && (
                <div className="space-y-2 relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="pl-7"
                    placeholder="e.g. 49.99"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value ? parseFloat(e.target.value) : "")}
                  />
                </div>
              )}
            </div>
            {pricingModel === 'PAID' && (
              <p className="mt-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 p-2 rounded flex items-start gap-1.5 font-medium">
                <span className="text-[10px] mt-[1px]">💡</span> Note: A 20% platform fee will be applied to all paid courses.
              </p>
            )}
          </div>


        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm & Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
