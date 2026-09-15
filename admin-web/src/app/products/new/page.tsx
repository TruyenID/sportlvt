import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Thêm sản phẩm</h1>
      <ProductForm />
    </div>
  );
}
