import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function Hero() {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border-hairline bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Direct Hardware Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold">
              Contactless Physical Identity
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary leading-[1.15]">
              Contactless NFC Hardware for In-Person Business.
            </h1>

            <p className="text-base sm:text-lg text-text-secondary font-normal leading-relaxed max-w-xl">
              Smart physical cards that instantly connect customers to your digital business profile,
              Google review page, or direct WhatsApp chat with a single tap. Works natively on modern smartphones with zero app installation.
            </p>

            {/* Direct CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:bg-accent-hover shadow-2xs transition-colors active:scale-[0.98] select-none"
              >
                <span>Explore NFC Cards</span>
                <Icon name="ArrowRight" size={16} className="w-4 h-4 shrink-0" />
              </a>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated text-text-primary border border-border-hairline font-semibold text-sm hover:bg-surface-subtle transition-colors active:scale-[0.98] select-none"
              >
                <Icon name="ExternalLink" size={16} className="w-4 h-4 text-text-secondary shrink-0" />
                <span>View Live Profile Demo</span>
              </Link>
            </div>

            {/* Factual Technical Benefits Bar */}
            <div className="pt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-secondary border-t border-border-hairline w-full">
              <div className="flex items-center gap-2 shrink-0">
                <Icon name="CheckCircle2" size={16} className="w-4 h-4 text-accent-primary shrink-0" />
                <span>No App Required</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Icon name="CheckCircle2" size={16} className="w-4 h-4 text-accent-primary shrink-0" />
                <span>Native Phone Detection</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Icon name="CheckCircle2" size={16} className="w-4 h-4 text-accent-primary shrink-0" />
                <span>Physical NFC + QR Backup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Hardware Presentation */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-[420px] rounded-2xl bg-surface-elevated border border-border-hairline p-4 sm:p-5 shadow-sm">
              {/* Product Frame */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-subtle border border-border-hairline flex items-center justify-center">
                <Image
                  src="/images/products/digital-business-card-black.png"
                  alt="NFCISTA Matte Black Physical NFC Business Card"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  className="object-contain p-2"
                  priority
                />
              </div>

              {/* Hardware Spec Label */}
              <div className="mt-3 pt-3 border-t border-border-hairline flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Icon name="Radio" size={14} className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Matte Black NFC Card</span>
                </div>
                <span className="text-[11px] text-text-secondary font-medium">Embedded Chip · QR Backup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
