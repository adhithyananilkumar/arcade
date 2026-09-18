'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/design-system/ui/dialog";
import { Button, buttonVariants } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import { CourseResponse } from "@/shared/types/api.types";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import { toMinorUnits, fromMinorUnits } from "@/shared/utils/money";

export interface ContentSubmitDialogProps {
  course?: CourseResponse;
  contentType?: 'course' | 'event' | 'workshop' | 'question-bank';
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { coverImageUrl?: string; pricingModel?: 'FREE' | 'PAID'; priceAmount?: number; message?: string }) => Promise<void>;
}

export function ContentSubmitDialog({ course, contentType = 'course', open, onClose, onSubmit }: ContentSubmitDialogProps) {
  const isEvent = contentType === 'event' || contentType === 'workshop';
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please provide a submission message.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        message
      });
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(`Failed to submit ${isEvent ? 'event' : 'course'}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit {isEvent ? 'Event' : 'Course'} for Review</DialogTitle>
          <DialogDescription>
            Configure the final details before sending your {isEvent ? 'event' : 'course'} for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {contentType === 'course' && (
            <>
              {/* Checklist Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Make sure you have completed all this:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Pricing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Overview
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Assessment & Exam
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Submission Note */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Submission Note (Optional)</h3>
            <p className="text-xs text-slate-500 mb-2">Leave a comment for the reviewer summarizing your changes.</p>
            <textarea
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 min-h-[80px]"
              placeholder="e.g., Added new module on React Hooks and fixed typo in Lesson 1."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-between">
          {course?.id ? (
            <Link 
              href={`/studio/content/${contentType}/${course.id}`}
              className={buttonVariants({ variant: 'outline' })}
              onClick={onClose}
            >
              Go to Workspace
            </Link>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
