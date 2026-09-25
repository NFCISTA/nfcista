import { notFound } from "next/navigation";
import ProductPageTemplate from "@/components/products/ProductPageTemplate";
import { getProductBySlug } from "@/data/products";

const product = getProductBySlug("google-review");

export const metadata = {
  title: "Google Review NFC Card — NFCISTA",
  description:
    "Let customers tap and leave a Google review instantly. No app required. NFCISTA Google Review NFC Card — coming soon.",
};

export default function GoogleReviewPage() {
  if (!product) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}
