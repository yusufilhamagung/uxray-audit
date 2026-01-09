"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { logClientEvent } from "@/infrastructure/analytics/client";
import { setAuditUnlockId, setEarlyAccessAccess } from "@/infrastructure/storage/unlockStorage";

type EarlyAccessModalProps = {
  auditId: string | null;
  onClose: () => void;
  onUnlockSuccess?: (unlockId: string) => void;
};

type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
};

type WaitlistResponse = {
  status: "created" | "exists";
  audit_unlock_id: string;
};

const emailSchema = z.string().email();

export default function EarlyAccessModal({ auditId, onClose, onUnlockSuccess }: EarlyAccessModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    logClientEvent("early_access_modal_viewed", { audit_id: auditId });
  }, [auditId]);

  const resetFormState = useCallback(() => {
    setEmail("");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    resetFormState();
    logClientEvent("early_access_modal_closed", { audit_id: auditId });
    onClose();
  }, [auditId, onClose, resetFormState]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    handleClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!auditId) {
      setStatus("error");
      setErrorMessage("Audit ID is missing. Please return to the audit page.");
      logClientEvent("email_submitted_error", { audit_id: auditId });
      return;
    }

    const parsedEmail = emailSchema.safeParse(email.trim());
    if (!parsedEmail.success) {
      setStatus("error");
      setErrorMessage("Please enter a valid email.");
      logClientEvent("email_submitted_error", { audit_id: auditId });
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsedEmail.data, auditId }),
      });

      const payload = (await response.json()) as ApiResponse<WaitlistResponse>;
      if (!response.ok || payload.status !== "success" || !payload.data?.audit_unlock_id) {
        throw new Error(payload?.message || "Could not save email.");
      }

      const unlockId = payload.data.audit_unlock_id;
      setAuditUnlockId(auditId, unlockId);
      setEarlyAccessAccess(parsedEmail.data, unlockId);
      setStatus("success");
      setEmail("");
      logClientEvent("email_submitted_success", { audit_id: auditId });

      // Notify parent of successful unlock and close modal
      if (onUnlockSuccess) {
        onUnlockSuccess(unlockId);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      logClientEvent("email_submitted_error", { audit_id: auditId });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={handleClose} aria-label="Close modal" className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground">
          ✕
        </button>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">🚧 UXRay is in Early Access</h2>
          <p className="text-sm text-muted-foreground">Full UX reports are launching soon.</p>
          <div className="text-sm text-muted-foreground">
            Enter your email to:
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Get early access</li>
              <li>Receive full reports first</li>
              <li>Lock special launch pricing</li>
            </ul>
          </div>
        </div>

        {status !== "success" ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
                disabled={status === "loading"}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "👉 Get Early Access"}
            </button>
            {status === "error" && errorMessage && <div className="rounded-2xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">{errorMessage}</div>}
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-foreground">
              <p className="font-semibold">Unlocked!</p>
              <p className="mt-1 text-muted-foreground">Your full report is now available below.</p>
            </div>

            <button type="button" className="btn-primary w-full" onClick={handleClose}>
              View Full Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
