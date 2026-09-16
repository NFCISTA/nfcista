import ProfileHeader from "@/components/ProfileHeader";
import BusinessInfo from "@/components/BusinessInfo";
import ActionButtons from "@/components/ActionButtons";
import ShareButton from "@/components/ShareButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        <ProfileHeader />
        <BusinessInfo />
        <ActionButtons />
        <ShareButton />
        <footer className="w-full pb-2 text-center flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span className="text-[12px] text-tertiary font-medium">
            Digital Business Card
          </span>
        </footer>
      </div>
    </main>
  );
}