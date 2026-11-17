import { BookOpen, CheckCircle2, Sparkles, X } from 'lucide-react';
import { REWARDS } from '../game/progression';
import { InfoBoardData } from '../types/game';

interface InfoBoardModalProps {
  info: InfoBoardData;
  alreadyRead: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export function InfoBoardModal({
  info,
  alreadyRead,
  onComplete,
  onClose,
}: InfoBoardModalProps) {
  return (
    <div
      className="anim-backdrop-fade fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/58"
      role="dialog"
      aria-modal="true"
      aria-label={info.title}
    >
      <div
        className="anim-modal-pop sriwijaya-panel rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden text-[#261c15]"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#0e5a5c] text-[#faf5eb] border-b-2 border-[#d4941e]">
          <h2 className="font-display font-bold text-base md:text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#f5b942]" />
            <span>{info.title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Papan Informasi"
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scroll space-y-4">
          <p className="text-xs font-bold text-[#0e5a5c]">{info.summary}</p>

          <div className="space-y-3 text-sm leading-relaxed text-[#261c15]">
            {info.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="pt-2 border-t border-[#c99c4c]/50">
            <h3 className="font-display font-bold text-sm text-[#0e5a5c] mb-2.5">
              Kosakata Baru untuk Dicatat
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {info.vocabulary.map((v) => (
                <div
                  key={v.word}
                  className="p-3 rounded-xl bg-white border border-[#c99c4c]/70 text-xs space-y-1"
                >
                  <div className="font-display font-bold text-sm text-[#b93829]">{v.word}</div>
                  <p className="text-[#261c15]">{v.meaning}</p>
                  <p className="text-[11px] italic text-[#5e4b3c]">Contoh: &ldquo;{v.example}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {!alreadyRead ? (
              <span className="text-xs font-bold text-[#0e5a5c] flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#d4941e]" />
                Hadiah Membaca: +{REWARDS.READ_INFO.xp} XP
              </span>
            ) : (
              <span className="text-xs font-bold text-[#0e5a5c] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Sudah Tercatat di Album Pengetahuan
              </span>
            )}

            <button
              type="button"
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-[#b93829] hover:bg-[#9e2e21] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
            >
              {alreadyRead ? 'Tutup' : 'Pahami & Catat (+30 XP)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
