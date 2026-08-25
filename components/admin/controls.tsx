"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useState(checked);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        const next = !optimistic;
        setOptimistic(next);
        startTransition(() => onChange(next));
      }}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        optimistic ? "bg-primary" : "bg-blush"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          optimistic ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export function ConfirmDelete({
  onConfirm,
  label = "ডিলিট",
  message = "আপনি কি নিশ্চিত? এটা আর ফেরানো যাবে না।",
}: {
  onConfirm: () => void;
  label?: string;
  message?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(message)) onConfirm();
      }}
      className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-danger hover:bg-danger/10"
    >
      <Trash2 size={16} /> {label}
    </button>
  );
}
