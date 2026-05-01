import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { ProductForm } from "@/components/products/ProductForm";
import Link from "next/link";

export default async function NewProductPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to products
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8">Add Product</h1>
      <ProductForm />
    </div>
  );
}
