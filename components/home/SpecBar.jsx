export default function SpecBar() {
  return (
    <div className="w-full bg-ink-alt border-b border-line py-2 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto flex flex-wrap items-center justify-between gap-y-1 gap-x-4 font-mono text-[11px] uppercase tracking-wider text-dim">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
          <span>NFC / 13.56 MHz / ISO 14443</span>
        </div>
        <div className="hidden sm:block text-dim/70">
          Works with iPhone and Android. No app.
        </div>
        <div className="text-dim/90">
          Custom branded. Programmed. Tested.
        </div>
      </div>
    </div>
  );
}
