import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-bserif text-2xl font-bold text-ink">নতুন প্রোডাক্ট</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">সব ঘর পূরণ করুন — “সেভ করুন” চাপলেই প্রোডাক্ট শোকেসে যুক্ত হবে।</p>
      <ProductForm />
    </div>
  );
}
