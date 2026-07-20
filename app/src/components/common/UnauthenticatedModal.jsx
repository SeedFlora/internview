import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * UnauthenticatedModal
 * Reusable auth-required modal.
 * - If onClose is provided, Cancel closes modal in-place.
 * - If onClose is not provided, Cancel falls back to history back.
 */
export function UnauthenticatedModal({
  redirectPath = "/",
  onClose,
  title = "Restricted Access",
  message = "You need to log in first to continue this action.",
  cancelLabel = "Cancel",
  loginLabel = "Log In",
}) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const handleLogin = useCallback(() => {
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }, [navigate, redirectPath]);

  const handleClose = useCallback(() => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    navigate(-1);
  }, [navigate, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    const getFocusable = () => Array.from(dialog.querySelectorAll(focusableSelector));
    const focusableEls = getFocusable();
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const candidates = getFocusable();
      if (candidates.length === 0) {
        event.preventDefault();
        return;
      }

      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[390px] rounded-[24px] bg-white p-5 shadow-2xl md:p-6"
      >
        <div className="mb-3 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100/60">
            <svg
              className="h-5 w-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center font-plus-jakarta text-[28px] font-bold leading-tight tracking-[-0.02em] text-slate-900 md:text-[32px]">
          {title}
        </h2>

        <p className="mx-auto mb-5 max-w-[320px] text-center font-inter text-base leading-relaxed text-slate-600 md:text-[16px] md:leading-7">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 font-plus-jakarta text-[15px] font-bold text-slate-900 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="h-11 flex-1 rounded-xl bg-orange-500 px-4 font-plus-jakarta text-[15px] font-bold text-white transition-colors hover:bg-orange-600"
          >
            {loginLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
