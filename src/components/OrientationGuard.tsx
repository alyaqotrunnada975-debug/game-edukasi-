import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

export function OrientationGuard() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => {
      const portrait = window.innerWidth < window.innerHeight && window.innerWidth < 768;
      setIsPortraitMobile(portrait);
      if (!portrait) setDismissed(false);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (!isPortraitMobile || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-[#093d3e] text-[#faf5eb]"
      role="dialog"
      aria-modal="true"
      aria-label="Arahkan layar ke mode mendatar"
    >
      <div className="sriwijaya-panel text-teak max-w-sm w-full rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0e5a5c] text-[#f5b942] flex items-center justify-center">
          <RotateCw className="w-9 h-9" />
        </div>
        <h2 className="font-display text-xl font-bold text-[#261c15]">
          Putar Layar ke Mode Mendatar (Landscape)
        </h2>
        <p className="text-sm text-[#4e3b2d] leading-relaxed">
          Jelajah Sriwijaya dirancang untuk tampilan 16:9 mendatar agar peta 3D dan kontrol petualangan nyaman dimainkan.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-semibold text-sm hover:bg-[#093d3e] transition-colors whitespace-nowrap shrink-0"
        >
          Tetap Lanjutkan
        </button>
      </div>
    </div>
  );
}
