import React, { useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { PetalIcon } from "./DecorativePetal.jsx";

const TYPE_CONFIG = {
    success: {
        icon: CheckCircle2,
        iconColor: "#143A28",
        bgBadge: "var(--accent-sage)",
        badgeBorder: "#143A28",
        progressColor: "var(--accent-sage)",
        cls: "toast-verdara-success",
    },
    error: {
        icon: AlertCircle,
        iconColor: "#FFFFFF",
        bgBadge: "var(--primary-dark)",
        badgeBorder: "var(--accent-sage)",
        progressColor: "var(--accent-sage)",
        cls: "toast-verdara-error",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "#143A28",
        bgBadge: "var(--accent-sage)",
        badgeBorder: "#143A28",
        progressColor: "var(--accent-sage)",
        cls: "toast-verdara-warning",
    },
    info: {
        icon: Info,
        iconColor: "#143A28",
        bgBadge: "var(--accent-sage)",
        badgeBorder: "#143A28",
        progressColor: "var(--accent-sage)",
        cls: "toast-verdara-info",
    },
};

export function Toast({ toast, onClose }) {
    const duration = toast.duration || 5000;
    const progressRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), duration);

        if (progressRef.current) {
            progressRef.current.style.animationDuration = `${duration}ms`;
        }

        return () => clearTimeout(timer);
    }, [toast, onClose, duration]);

    const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
    const Icon = cfg.icon;

    return (
        <div className={`toast-verdara ${cfg.cls}`} role="alert">
            <div className="toast-verdara-icon" style={{ backgroundColor: cfg.bgBadge }}>
                <Icon style={{ width: 17, height: 17, color: cfg.iconColor }} />
            </div>

            <div className="toast-verdara-body">
                <p className="toast-verdara-title">{toast.title}</p>
                {toast.message && (
                    <p className="toast-verdara-message">{toast.message}</p>
                )}
            </div>

            <button
                onClick={() => onClose(toast.id)}
                className="toast-verdara-close"
                aria-label="Dismiss notification"
            >
                <X style={{ width: 14, height: 14 }} />
            </button>

            <div
                ref={progressRef}
                className="toast-verdara-progress"
                style={{ backgroundColor: cfg.progressColor, animationDuration: `${duration}ms` }}
            />
        </div>
    );
}

export function ToastContainer({ toasts, onClose }) {
    if (toasts.length === 0) return null;
    return (
        <div className="toast-verdara-container" aria-live="assertive">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}
