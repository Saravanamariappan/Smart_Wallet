import React, { useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const TYPE_CONFIG = {
    success: {
        icon: CheckCircle2,
        iconColor: "var(--success)",
        progressClass: "toast-progress-success",
        cls: "toast-success",
    },
    error: {
        icon: AlertCircle,
        iconColor: "var(--danger)",
        progressClass: "toast-progress-error",
        cls: "toast-error",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "var(--warning)",
        progressClass: "toast-progress-warning",
        cls: "toast-warning",
    },
    info: {
        icon: Info,
        iconColor: "var(--info)",
        progressClass: "toast-progress-info",
        cls: "toast-info",
    },
};

export function Toast({ toast, onClose }) {
    const duration = toast.duration || 5000;
    const progressRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), duration);

        // animate progress bar
        if (progressRef.current) {
            progressRef.current.style.animationDuration = `${duration}ms`;
        }

        return () => clearTimeout(timer);
    }, [toast, onClose, duration]);

    const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
    const Icon = cfg.icon;

    return (
        <div className={`toast ${cfg.cls}`} role="alert">
            {/* Coloured left-border is handled by .toast-success etc in CSS */}
            <div className="toast-icon">
                <Icon style={{ width: 18, height: 18, color: cfg.iconColor }} />
            </div>

            <div className="toast-body">
                <p className="toast-title">{toast.title}</p>
                {toast.message && (
                    <p className="toast-message">{toast.message}</p>
                )}
            </div>

            <button
                onClick={() => onClose(toast.id)}
                className="toast-close"
                aria-label="Dismiss notification"
            >
                <X style={{ width: 15, height: 15 }} />
            </button>

            {/* Auto-dismiss progress bar */}
            <div
                ref={progressRef}
                className={`toast-progress ${cfg.progressClass}`}
                style={{ animationDuration: `${duration}ms` }}
            />
        </div>
    );
}

export function ToastContainer({ toasts, onClose }) {
    if (toasts.length === 0) return null;
    return (
        <div className="toast-container" aria-live="assertive">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}
