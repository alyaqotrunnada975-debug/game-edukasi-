import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { REWARDS } from '../game/progression';
import {
  getCharacterPortraitDataUrl,
  isCharacterSheetReady,
  subscribeCharacterSheetReady,
} from '../three/spriteSheets';
import { GuideDialogue } from '../types/game';

interface DialogueModalProps {
  dialogue: GuideDialogue;
  alreadyTalked: boolean;
  onAdvanceSfx: () => void;
  onComplete: () => void;
  onClose: () => void;
}

export function DialogueModal({
  dialogue,
  alreadyTalked,
  onAdvanceSfx,
  onComplete,
  onClose,
}: DialogueModalProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [guidePortrait, setGuidePortrait] = useState(() =>
    getCharacterPortraitDataUrl(dialogue.guideId),
  );
  const [kikoPortrait, setKikoPortrait] = useState(() =>
    getCharacterPortraitDataUrl('kiko'),
  );

  useEffect(() => {
    setGuidePortrait(getCharacterPortraitDataUrl(dialogue.guideId));
    setKikoPortrait(getCharacterPortraitDataUrl('kiko'));

    const unsubs: Array<() => void> = [];
    if (!isCharacterSheetReady(dialogue.guideId)) {
      unsubs.push(
        subscribeCharacterSheetReady(dialogue.guideId, () => {
          setGuidePortrait(getCharacterPortraitDataUrl(dialogue.guideId));
        }),
      );
    }
    if (!isCharacterSheetReady('kiko')) {
      unsubs.push(
        subscribeCharacterSheetReady('kiko', () => {
          setKikoPortrait(getCharacterPortraitDataUrl('kiko'));
        }),
      );
    }
    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [dialogue.guideId]);

  const current = dialogue.lines[lineIdx];
  const isLast = lineIdx >= dialogue.lines.length - 1;

  const handleNext = () => {
    onAdvanceSfx();
    if (isLast) {
      onComplete();
    } else {
      setLineIdx((prev) => prev + 1);
    }
  };

  return (
    <div
      className="anim-backdrop-fade fixed inset-0 z-40 flex items-end justify-center p-4 md:p-6 bg-black/52"
      role="dialog"
      aria-modal="true"
      aria-label={`Dialog dengan ${dialogue.speakerName}`}
    >
      <div
        className="anim-slide-up sriwijaya-panel rounded-2xl max-w-2xl w-full p-5 text-[#261c15]"
      >
        <div key={lineIdx} className="anim-line-swap">
            <div className="flex items-start gap-4">
              <img
                src={guidePortrait}
                alt={dialogue.speakerName}
                className="w-16 h-16 rounded-xl bg-[#f0e6d2] border-2 border-[#c99c4c] object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-[#0e5a5c]">
                    {current.speaker}
                  </h3>
                  <span className="text-xs font-mono tabular-nums text-[#6e533d]">
                    {lineIdx + 1}/{dialogue.lines.length}
                  </span>
                </div>
                <p className="mt-1.5 text-sm md:text-base leading-relaxed text-[#261c15]">
                  {current.text}
                </p>
              </div>
            </div>

            {current.kikoReaction && (
              <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-[#f0e6d2] border border-[#c99c4c]/70">
                <img
                  src={kikoPortrait}
                  alt="Si Kiko"
                  className="w-10 h-10 rounded-lg bg-white border border-[#c99c4c] object-contain shrink-0"
                />
                <p className="text-xs font-semibold text-[#4e3b2d]">
                  <strong>Si Kiko:</strong> &ldquo;{current.kikoReaction}&rdquo;
                </p>
              </div>
            )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {!alreadyTalked && isLast ? (
            <span className="text-xs font-bold text-[#0e5a5c] flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#d4941e]" />
              Hadiah: +{REWARDS.TALK_GUIDE.xp} XP · +{REWARDS.TALK_GUIDE.coins} Koin
            </span>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#6e533d] hover:text-[#261c15] cursor-pointer"
            >
              Tutup
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm transition-colors cursor-pointer"
          >
            <span>{isLast ? 'Selesai Bicara' : 'Lanjut'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
