'use client';

import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/icons/Icons';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';

export function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        tabIndex={-1}
        className="w-[568px] rounded-xl bg-white p-6 shadow-card"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share"
          className="mb-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 id="share-title" className="text-[22px] font-semibold">
          Share this place
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {['Copy link', 'Email', 'Messages', 'WhatsApp', 'Facebook', 'Twitter'].map((label) => (
            <li key={label}>
              <button
                type="button"
                onClick={label === 'Copy link' ? copy : onClose}
                className="w-full rounded-xl border border-line px-4 py-3 text-left font-semibold hover:bg-canvas"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
