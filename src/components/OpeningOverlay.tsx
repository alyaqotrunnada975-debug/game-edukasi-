import { useState } from 'react';
import { BookOpen, HelpCircle, Play, Volume2, VolumeX } from 'lucide-react';

interface OpeningOverlayProps {
  initialName: string;
  muted: boolean;
  hasSavedProgress: boolean;
  onStart: (playerName: string) => void;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  onOpenAbout: () => void;
}

export function OpeningOverlay({
  initialName,
  muted,
  hasSavedProgress,
  onStart,
  onToggleMute,
  onOpenHowToPlay,
  onOpenAbout,
}: OpeningOverlayProps) {
  const [name, setName] = useState(initialName);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Tuliskan nama petualangmu terlebih dahulu ya!');
      return;
    }
    setErrorMsg('');
    onStart(trimmed);
  };

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4 md:p-7">
      {/* Top Bar: Audio mute toggle pinned top-right */}
      <div className="anim-fade-down flex items-start justify-end">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-[#182224]/92 border border-[#d4941e]/75 text-[#faf5eb] text-xs md:text-sm font-semibold hover:bg-[#233235] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-md"
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-[#f5b942]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#f5b942]" />
          )}
          <span>{muted ? 'Suara Mati' : 'Suara Aktif'}</span>
        </button>
      </div>

      {/* Left-pinned compact Title & Start Card — leaves right side wide open for Petualang & Si Kiko */}
      <div className="anim-card-left my-auto w-full max-w-[296px] sm:max-w-[330px] md:max-w-[375px] lg:max-w-[405px] pointer-events-auto">
        <div className="sriwijaya-panel rounded-2xl p-3 sm:p-4 md:p-5 max-h-[calc(100vh-3.6rem)] sm:max-h-[calc(100vh-4.2rem)] overflow-y-auto custom-scroll">
          {/* Custom SVG Heritage Crest Emblem */}
          <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-2.5">
            <svg
              viewBox="0 0 48 48"
              className="w-9 h-9 md:w-11 md:h-11 shrink-0"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="22" fill="#0e5a5c" stroke="#d4941e" strokeWidth="2.5" />
              <path
                d="M10 30 L16 14 L20 14 L20 26 L28 26 L28 14 L32 14 L38 30 Z"
                fill="#b93829"
                stroke="#faf5eb"
                strokeWidth="1.5"
              />
              <path
                d="M8 33 Q16 37 24 33 Q32 29 40 33"
                fill="none"
                stroke="#f5b942"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="24" cy="12" r="3" fill="#f5b942" />
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-[#0e5a5c] leading-tight">
                Bahasa Indonesia Kelas 5 SD · Sumsel
              </p>
              <h1 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-[#261c15] leading-tight">
                Jelajah Sriwijaya
              </h1>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs md:text-sm text-[#4e3b2d] leading-snug mb-2.5 md:mb-3.5">
            Petualangan menyusuri sejarah Sumatera Selatan bersama Si Kiko dan Kak Arya.
          </p>

          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-2.5">
            <div>
              <label
                htmlFor="adventurer-name-input"
                className="block text-[11px] md:text-xs font-bold text-[#261c15] mb-1"
              >
                Nama Petualang
              </label>
              <input
                id="adventurer-name-input"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Budi atau Sari"
                className="w-full px-3 py-1.5 md:py-2 rounded-xl bg-white border-2 border-[#c99c4c]/75 text-[#261c15] text-xs md:text-sm font-semibold focus:outline-none focus:border-[#0e5a5c]"
              />
              {errorMsg && (
                <p className="mt-1 text-[11px] font-semibold text-[#b93829]" role="alert">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              data-start="true"
              className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 px-4 rounded-xl bg-[#b93829] hover:bg-[#9e2e21] text-[#faf5eb] font-display font-bold text-xs sm:text-sm md:text-base shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasSavedProgress ? 'Lanjutkan Petualangan' : 'Mulai Petualangan'}</span>
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 mt-2 md:mt-2.5">
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-2.5 rounded-xl bg-[#f0e6d2] hover:bg-[#e5d6b8] text-[#261c15] border border-[#c99c4c] text-[11px] md:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#0e5a5c]" />
              <span>Cara Bermain</span>
            </button>
            <button
              type="button"
              onClick={onOpenAbout}
              className="flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-2.5 rounded-xl bg-[#f0e6d2] hover:bg-[#e5d6b8] text-[#261c15] border border-[#c99c4c] text-[11px] md:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0e5a5c]" />
              <span>Tentang Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom-left concise control hint (shown when height >= 500px so mobile landscape stays uncluttered) */}
      <div className="anim-slide-up hidden [@media(min-height:500px)]:flex items-center justify-start">
        <span className="max-w-[54vw] sm:max-w-none truncate px-2.5 py-1 rounded-lg bg-[#162426]/85 border border-[#d4941e]/50 text-[10px] sm:text-[11px] font-medium text-[#faf5eb] shadow">
          WASD / Panah Bergerak · Spasi Lompat · E Interaksi · Ketuk Tanah
        </span>
      </div>
    </div>
  );
}
