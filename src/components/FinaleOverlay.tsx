import { Award, CheckCircle2, Compass, RotateCcw, Star } from 'lucide-react';
import { COMPETENCIES_MASTERED } from '../data/badges';
import { getLevelInfo, getTotalStars } from '../game/progression';
import { PlayerProgress } from '../types/game';

interface FinaleOverlayProps {
  progress: PlayerProgress;
  onFreeExplore: () => void;
  onReplay: () => void;
}

export function FinaleOverlay({ progress, onFreeExplore, onReplay }: FinaleOverlayProps) {
  const levelInfo = getLevelInfo(progress.xp);
  const totalStars = getTotalStars(progress);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center p-4">
      <div
        className="anim-modal-pop pointer-events-auto sriwijaya-panel rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#261c15]"
      >
        <div className="px-6 py-4 bg-[#0e5a5c] text-[#faf5eb] border-b-2 border-[#d4941e] flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#f5b942]">
              Selamat, {progress.playerName || 'Petualang'}! Seluruh Misi Tuntas!
            </p>
            <h1 className="font-display font-extrabold text-xl md:text-2xl">
              Perayaan Agung Penjaga Warisan Sriwijaya
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold tabular-nums">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#f5b942] fill-[#f5b942]" /> {totalStars}/18 Bintang
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-[#f5b942]" /> {progress.badges.length}/6 Lencana
            </span>
            <span>
              Level {levelInfo.level} · {progress.xp} XP
            </span>
          </div>
        </div>

        <div className="p-5 overflow-y-auto custom-scroll space-y-4">
          <p className="text-sm text-[#3a2c22] leading-relaxed">
            Kamu, Si Kiko, dan Kak Arya telah berhasil menyusuri enam tempat bersejarah di Sumatera Selatan serta menguasai <strong>8 Kompetensi Bahasa Indonesia Kelas 5 SD</strong>:
          </p>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {COMPETENCIES_MASTERED.map((comp) => (
              <div
                key={comp.title}
                className="p-3 rounded-xl bg-white border border-[#c99c4c]/70 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0e5a5c] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-xs text-[#261c15]">{comp.title}</h3>
                  <p className="text-[11px] text-[#4e3b2d] mt-0.5 leading-snug">{comp.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onReplay}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f0e6d2] hover:bg-[#e5d6b8] border border-[#c99c4c] text-[#261c15] font-display font-bold text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#b93829]" />
              <span>Main Ulang</span>
            </button>
            <button
              type="button"
              onClick={onFreeExplore}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#b93829] hover:bg-[#9e2e21] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Jelajahi Bebas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
