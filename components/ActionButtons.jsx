import profile from "@/data/profile";

/** Reusable icon wrapper used in the 2×2 grid cards */
function IconBox({ icon, fill = false }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span
        className="material-symbols-outlined text-[20px]"
        style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
    </div>
  );
}

/** One card in the 2×2 quick-action grid */
function ActionCard({ href, icon, fill, label, sub, external = true }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col items-start p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
    >
      <IconBox icon={icon} fill={fill} />
      <span className="mt-3 text-label-md font-semibold text-on-surface">
        {label}
      </span>
      <span className="text-[12px] text-on-surface-variant truncate w-full">
        {sub}
      </span>
    </a>
  );
}

/** One row in the "Office & Contact" list */
function ContactRow({ href, icon, label, sub, trailingIcon = "chevron_right", external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[19px]">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-label-md font-medium text-on-surface">{label}</p>
          <p className="text-body-sm text-on-surface-variant truncate">{sub}</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0">
        {trailingIcon}
      </span>
    </a>
  );
}

/** Star rating sub-line shown inside the Google Review card */
function StarRating() {
  return (
    <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
      <span className="font-semibold text-on-surface">{profile.googleRating}</span>
      <span className="text-amber-500 font-bold">★★★★★</span>
      <span className="text-tertiary">({profile.googleRatingCount})</span>
    </span>
  );
}

export default function ActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      {/* ── 2×2 Quick-Action Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          href={`tel:${profile.phone}`}
          icon="call"
          label="Call Direct"
          sub={profile.phone}
          external={false}
        />
        <ActionCard
          href={`https://wa.me/${profile.whatsapp}`}
          icon="chat"
          label="WhatsApp"
          sub="Instant Direct Chat"
        />
        <ActionCard
          href={`https://instagram.com/${profile.instagram}`}
          icon="photo_camera"
          label="Instagram"
          sub={`@${profile.instagram}`}
        />
        {/* Google Review card uses a custom sub element */}
        <a
          href={profile.googleReview}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-start p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98] group"
        >
          <IconBox icon="star" fill />
          <span className="mt-3 text-label-md font-semibold text-on-surface">
            Google Review
          </span>
          <StarRating />
        </a>
      </div>

      {/* ── Office & Contact list ────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card space-y-1">
        <div className="px-2 pb-2">
          <span className="text-[11px] text-tertiary uppercase tracking-wider font-semibold">
            Office &amp; Contact
          </span>
        </div>
        <ContactRow
          href={profile.googleMaps}
          icon="location_on"
          label="Find Us"
          sub={profile.address}
          external
        />
        <ContactRow
          href={`mailto:${profile.email}`}
          icon="mail"
          label="Email"
          sub={profile.email}
        />
        <ContactRow
          href={profile.website}
          icon="language"
          label="Website"
          sub={profile.website.replace(/^https?:\/\//, "")}
          trailingIcon="open_in_new"
          external
        />
      </div>
    </div>
  );
}