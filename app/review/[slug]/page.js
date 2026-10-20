import { notFound } from "next/navigation";
import { getCustomerBySlug } from "@/lib/customers";
import ReviewHubClient from "@/components/review/ReviewHubClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: "Leave a Review — NFCISTA" };

  const customer = await getCustomerBySlug(slug);
  if (!customer) return { title: "Review — NFCISTA" };

  const businessName = customer.company_name?.trim() || customer.full_name?.trim() || "Business";
  return {
    title: `Review ${businessName} — NFCISTA`,
    description: `Leave your genuine Google review for ${businessName}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CustomerReviewPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  const customer = await getCustomerBySlug(slug);
  if (!customer || !customer.is_active) {
    notFound();
  }

  const safeCustomer = {
    full_name: customer.full_name,
    company_name: customer.company_name,
    category: customer.category,
    photo_url: customer.photo_url || null,
    google_review_url: customer.google_review_url || null,
    review_assistant_enabled: Boolean(customer.review_assistant_enabled),
    profile_slug: customer.profile_slug,
  };

  return <ReviewHubClient customer={safeCustomer} />;
}
