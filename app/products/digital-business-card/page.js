import { notFound } from "next/navigation";
import ProductPageTemplate from "@/components/products/ProductPageTemplate";
import { getProductBySlug } from "@/data/products";

const product = getProductBySlug("digital-business-card");

export const metadata = {
  title: "Digital Business Card — NFCISTA",
  description:
    "Share your full business profile with a single tap. Name, contact details, social links — all on one page. NFCISTA Digital Business Card — coming soon.",
};

export default function DigitalBusinessCardPage() {
  if (!product) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}
