import { notFound } from "next/navigation";
import ProductPageTemplate from "@/components/products/ProductPageTemplate";
import { getProductBySlug } from "@/data/products";

const product = getProductBySlug("instagram");

export const metadata = {
  title: "Instagram NFC Card — NFCISTA",
  description:
    "Let customers tap and open your Instagram profile instantly. No typing, no searching. NFCISTA Instagram NFC Card — coming soon.",
};

export default function InstagramPage() {
  if (!product) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}
