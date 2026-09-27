'use client';

// Identity verification before a proctored sitting: the candidate takes (or uploads) a photo of
// themselves, it is uploaded through the media endpoint, and the resulting URL is submitted as
// evidence. The server records it and lets the candidate start; an administrator approves or rejects
// it afterwards, and a certificate waits for that approval. Nothing here decides whether the
// candidate is verified — the browser only collects the photo.

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToStorage } from '@/infrastructure/media/upload';
import { submitIdentityEvidence } from '@/domains/assessments';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function IdentityCapture({
  examId,
  planId,
  rejected,
  onSubmitted,
}: {
  examId: string;
  planId: string;
  /** A previous submission was rejected — explain, and let them try again. */
  rejected?: boolean;
  onSubmitted: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => stopCamera(), []);
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraOn(true);
      setPhoto(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      toast.error('Camera unavailable. Upload a photo instead.');
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) setPhoto(blob);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }

  async function submit() {
    if (!photo) return;
    setSubmitting(true);
    try {
      const file = new File([photo], 'identity.jpg', { type: photo.type || 'image/jpeg' });
      const url = await uploadFileToStorage(file, IMAGE_TYPES);
      await submitIdentityEvidence(examId, planId, url);
      toast.success('Photo submitted. You can start the exam.');
      onSubmitted();
    } catch (err) {
      toast.error((err as Error)?.message ?? 'Could not submit your photo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-[14px] font-semibold text-[#14142b]">Verify your identity</p>
      <p className="mt-1 text-[12px] font-medium text-slate-500">
        {rejected
          ? 'Your previous photo was not accepted. Take a clear, well-lit photo of your face.'
          : 'Take a clear photo of your face. It is kept with this sitting and reviewed by the exam administrator.'}
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {cameraOn ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" playsInline muted />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your photo" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center text-slate-300">
            <Camera size={36} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {cameraOn ? (
          <button
            type="button"
            onClick={capture}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
          >
            <Camera size={15} /> Take photo
          </button>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            {photo ? <RefreshCw size={15} /> : <Camera size={15} />}
            {photo ? 'Retake' : 'Use camera'}
          </button>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
          <Upload size={15} /> Upload
          <input
            type="file"
            accept={IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                stopCamera();
                setPhoto(f);
              }
            }}
          />
        </label>
        {photo && !cameraOn && (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735] disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Submit photo
          </button>
        )}
      </div>
    </div>
  );
}
