import profile from "@/data/profile";

/**
 * InitialsAvatar — circular avatar with gradient ring + initials,
 * replacing the profile photo until a real image is added to public/.
 */
function InitialsAvatar() {
  const initials = profile.ownerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    // Outer gradient ring
    <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-primary/20 to-surface-container shadow-card">
      {/* Inner circle */}
      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
        <span className="text-on-primary text-3xl font-bold tracking-tight select-none">
          {initials}
        </span>
      </div>
    </div>
  );
}

export default function ProfileHeader() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card relative overflow-hidden flex flex-col items-center text-center">
      {/* Decorative background accents */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-surface-container-low rounded-full pointer-events-none opacity-60" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-surface-container-low rounded-full pointer-events-none opacity-40" />

      {/* Studio branding pill */}
      <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/20">
        <span className="material-symbols-outlined text-[14px] text-primary">
          auto_awesome
        </span>
        <span className="text-[11px] font-bold text-on-surface tracking-wider uppercase">
          {profile.businessName}
        </span>
      </div>

      {/* Portrait with verified badge */}
      <div className="relative mb-4">
        <InitialsAvatar />
        {/* Verified badge */}
        <div className="absolute bottom-0 right-1 bg-primary text-on-primary w-7 h-7 rounded-full flex items-center justify-center shadow-card ring-2 ring-white">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
        </div>
      </div>

      {/* Identity details */}
      <div className="space-y-1">
        <h1 className="text-headline-lg font-bold text-on-surface">
          {profile.ownerName}
        </h1>
        <p className="text-label-lg font-semibold text-primary">
          {profile.jobTitle}
        </p>
        <p className="text-body-sm text-on-surface-variant font-medium">
          {profile.businessName}
        </p>
      </div>

      {/* Category chip */}
      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/25 rounded-full text-on-surface">
        <span className="material-symbols-outlined text-[15px] text-primary">
          design_services
        </span>
        <span className="text-[11px] font-semibold">{profile.category}</span>
      </div>

      {/* Description */}
      <p className="mt-4 text-body-md text-on-surface-variant leading-relaxed">
        {profile.description}
      </p>
    </div>
  );
}