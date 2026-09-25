import { notFound } from "next/navigation";
import ProductPageTemplate from "@/components/products/ProductPageTemplate";
import { getProductBySlug } from "@/data/products";

const product = getProductBySlug("whatsapp");

export const metadata = {
  title: "WhatsApp NFC Card — NFCISTA",
  description:
    "Let customers tap and open a WhatsApp chat with your business instantly. No number-saving required. NFCISTA WhatsApp NFC Card — coming soon.",
};

export default function WhatsAppPage() {
  if (!product) {
    notFound();
  }

  return <ProductPageTemplate product={product} />;
}
