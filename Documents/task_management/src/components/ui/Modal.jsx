// src/components/ui/Modal.jsx
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  // Close on Escape key
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-ink/55 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} p-8
                   shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-extrabold text-xl text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border flex items-center
                       justify-center text-muted hover:bg-surface transition-colors"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;