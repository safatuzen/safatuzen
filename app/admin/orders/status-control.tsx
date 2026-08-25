"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { updateOrderStatus } from "@/lib/actions";

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(current);
  const [saving, setSaving] = useState(false);

  return (
    <select
      value={value}
      disabled={saving}
      aria-label="স্টেটাস পরিবর্তন করুন"
      onChange={async (e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        setSaving(true);
        await updateOrderStatus(orderId, next);
        setSaving(false);
        router.refresh();
      }}
      className={`h-9 rounded-full px-3 text-sm font-medium outline-none ${
        value === "delivered" ? "bg-success/15 text-success"
        : value === "cancelled" ? "bg-danger/10 text-danger"
        : value === "new" ? "bg-accent/15 text-accent"
        : "bg-blush text-primary-deep"
      }`}
    >
      {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
