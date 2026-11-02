import { notFound } from "next/navigation";
import Link from "next/link";
import NfcistaLogo from "@/components/ui/NfcistaLogo";
import StandaloneReviewClient from "@/components/review/StandaloneReviewClient";
import { getReviewCardConfig, isValidReviewCardCode, normalizeCardCode } from "@/lib/reviewCards";

export const dynamic = "force-dynamic";

/**
 * Generate metadata for the standalone review card.
 */
export async function generateMetadata({ params }) {
  const { cardCode } = await params;
  if (!isValidReviewCardCode(cardCode)) {
    return { title: "Review Card — NFCISTA", robots: { index: false, follow: false } };
  }

  const cardConfig = await getReviewCardConfig(cardCode);
  if (!cardConfig) {
    return { title: "Card Not Active — NFCISTA", robots: { index: false, follow: false } };
  }

  return {
    title: `Review ${cardConfig.business_name} — NFCISTA`,
    description: `Leave your genuine Google review for ${cardConfig.business_name}.`,
    robots: { index: false, follow: false },
  };
}

/**
 * Inactive / Unconfigured Card Presentation.
 * Displays a clean branded card without leaking errors or IDs.
 */
function InactiveCardView({ cardCode }) {
  const safeCode = normalizeCardCode(cardCode);
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
            <NfcistaLogo size={18} priority />
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">
            NFCISTA
          </span>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xl">
          📡
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-slate-900">Card Not Active</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            This NFCISTA Google Review Card is currently unassigned or pending configuration.
          </p>
        </div>

        {safeCode && (
          <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono text-[11px] text-slate-500 tracking-wider">
            REF: {safeCode}
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all"
          >
            Visit NFCISTA
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
          Physical Contactless Identity · NFCISTA
        </div>
      </div>
    </main>
  );
}

/**
 * Server component for standalone Review Assistant route:
 * /review/c/[cardCode]
 */
export default async function StandaloneReviewPage({ params }) {
  const { cardCode } = await params;

  if (!isValidReviewCardCode(cardCode)) {
    return <InactiveCardView cardCode={cardCode} />;
  }

  const cardConfig = await getReviewCardConfig(cardCode);

  if (!cardConfig || !cardConfig.is_active) {
    return <InactiveCardView cardCode={cardCode} />;
  }

  return <StandaloneReviewClient cardConfig={cardConfig} />;
}
