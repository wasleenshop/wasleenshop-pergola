"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Focus trap arrays
  const [focusableElements, setFocusableElements] = React.useState<HTMLElement[]>([]);

  React.useEffect(() => {
    if (!isOpen) return;

    // Handle ESC key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      
      // Focus Trap for Tab key
      if (e.key === "Tab" && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { /* shift + tab */
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { /* tab */
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Body scroll lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    // Find focusable elements
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      setFocusableElements(Array.from(elements) as HTMLElement[]);
      // Automatically focus the first element (e.g. the close button)
      if (elements.length) (elements[0] as HTMLElement).focus();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, focusableElements]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Do not render anything on server, wait for client mount for Portal
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={contentRef}
        className={cn(
          "bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in relative flex flex-col max-h-[90vh]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-sm text-neutral-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 mr-[-8px] text-neutral-400 hover:text-primary transition-colors hover:bg-neutral-100 rounded-full"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
