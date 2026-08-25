"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { setProductFlag, deleteProduct } from "@/lib/actions";

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

export function ProductFlagToggle({
  productId,
  field,
  initialValue,
  label,
}: {
  productId: string;
  field: "is_active" | "is_featured";
  initialValue: boolean;
  label: string;
}) {
  const router = useRouter();
  return (
    <Switch
      checked={initialValue}
      label={label}
      onChange={async (next) => {
        await setProductFlag(productId, field, next);
        router.refresh();
      }}
    />
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

export function ProductDeleteAction({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  return (
    <ConfirmDelete
      onConfirm={async () => {
        await deleteProduct(productId);
        router.refresh();
      }}
      label="ডিলিট"
      message={`“${productName}” মুছে ফেলা হবে। আপনি কি নিশ্চিত? এটা আর ফেরানো যাবে না।`}
    />
  );
}
