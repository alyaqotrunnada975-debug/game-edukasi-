import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Puzzle, RotateCcw, Sparkles, X } from 'lucide-react';
import { REWARDS } from '../game/progression';
import { MiniGameConfig } from '../types/game';

interface MiniGameModalProps {
  config: MiniGameConfig;
  alreadyCompleted: boolean;
  onSuccessSfx: () => void;
  onErrorSfx: () => void;
  onClickSfx: () => void;
  onComplete: () => void;
  onClose: () => void;
}

function deterministicShuffle<T>(items: T[], seedOffset = 1): T[] {
  const arr = [...items];
  // Rotate/swap deterministically so initial state is never already solved
  if (arr.length >= 2) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i + seedOffset) % arr.length;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }
  return arr;
}

function SentenceOrderWidget({
  items,
  buttonLabel,
  onClickSfx,
  onErrorSfx,
  onSolved,
}: {
  items: { id: string; text: string; correctOrder: number }[];
  buttonLabel: string;
  onClickSfx: () => void;
  onErrorSfx: () => void;
  onSolved: () => void;
}) {
  const [ordered, setOrdered] = useState(() => deterministicShuffle(items, 1));
  const [feedback, setFeedback] = useState<string | null>(null);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    onClickSfx();
    const next = [...ordered];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    setOrdered(next);
    setFeedback(null);
  };

  const check = () => {
    const isCorrect = ordered.every((item, idx) => item.correctOrder === idx + 1);
    if (isCorrect) {
      onSolved();
    } else {
      onErrorSfx();
      setFeedback('Urutan kalimat belum padu. Perhatikan alur dari gambaran umum ke bagian khusus ya!');
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {ordered.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-[#c99c4c]/70 text-sm"
          >
            <span className="w-7 h-7 rounded-lg bg-[#0e5a5c] text-[#faf5eb] font-mono font-bold text-xs flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <p className="flex-1 text-[#261c15] leading-snug">{item.text}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => move(idx, -1)}
                aria-label={`Naikkan kalimat ${idx + 1}`}
                className="p-2 rounded-lg bg-[#f0e6d2] hover:bg-[#e5d6b8] disabled:opacity-35 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={idx === ordered.length - 1}
                onClick={() => move(idx, 1)}
                aria-label={`Turunkan kalimat ${idx + 1}`}
                className="p-2 rounded-lg bg-[#f0e6d2] hover:bg-[#e5d6b8] disabled:opacity-35 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <p className="text-xs font-bold text-[#b93829] bg-[#fdecea] p-2.5 rounded-lg border border-[#b93829]/30">
          {feedback}
        </p>
      )}

      <button
        type="button"
        onClick={check}
        className="w-full py-2.5 px-4 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function PairMatchWidget({
  pairs,
  leftTitle,
  rightTitle,
  onClickSfx,
  onErrorSfx,
  onSolved,
}: {
  pairs: { id: string; left: string; right: string }[];
  leftTitle: string;
  rightTitle: string;
  onClickSfx: () => void;
  onErrorSfx: () => void;
  onSolved: () => void;
}) {
  const shuffledRight = useMemo(() => deterministicShuffle(pairs, 2), [pairs]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) {
      setErrorMsg(`Pilih salah satu ${leftTitle} di sebelah kiri terlebih dahulu.`);
      return;
    }
    if (selectedLeft === rightId) {
      onClickSfx();
      const next = [...matchedIds, rightId];
      setMatchedIds(next);
      setSelectedLeft(null);
      setErrorMsg(null);
      if (next.length === pairs.length) {
        onSolved();
      }
    } else {
      onErrorSfx();
      setErrorMsg('Pasangan belum cocok, ayo teliti lagi ya!');
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#0e5a5c]">{leftTitle}</p>
          {pairs.map((p) => {
            const done = matchedIds.includes(p.id);
            const active = selectedLeft === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => {
                  onClickSfx();
                  setSelectedLeft(p.id);
                  setErrorMsg(null);
                }}
                className={`w-full text-left p-3 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer ${
                  done
                    ? 'bg-[#e3f2ec] border-[#0e5a5c] text-[#0e5a5c]'
                    : active
                      ? 'bg-[#f5b942] border-[#261c15] text-[#261c15]'
                      : 'bg-white border-[#c99c4c]/70 hover:bg-[#faf0dc]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{p.left}</span>
                  {done && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-[#0e5a5c]">{rightTitle}</p>
          {shuffledRight.map((p) => {
            const done = matchedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => handleRightClick(p.id)}
                className={`w-full text-left p-3 rounded-xl border-2 text-xs leading-snug transition-colors cursor-pointer ${
                  done
                    ? 'bg-[#e3f2ec] border-[#0e5a5c] text-[#0e5a5c]'
                    : 'bg-white border-[#c99c4c]/70 hover:bg-[#faf0dc]'
                }`}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs font-bold text-[#b93829] bg-[#fdecea] p-2.5 rounded-lg">{errorMsg}</p>
      )}
    </div>
  );
}

export function MiniGameModal({
  config,
  alreadyCompleted,
  onSuccessSfx,
  onErrorSfx,
  onClickSfx,
  onComplete,
  onClose,
}: MiniGameModalProps) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [finished, setFinished] = useState(false);

  // Shared MC state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mcFeedback, setMcFeedback] = useState<string | null>(null);

  // Stage state for Effective Sentence (Loc 3)
  const [pickedTokens, setPickedTokens] = useState<string[]>([]);
  const [sentenceError, setSentenceError] = useState<string | null>(null);

  // Stage state for Fact vs Legend (Loc 4)
  const [flAnswers, setFlAnswers] = useState<Record<string, 'fakta' | 'legenda'>>({});
  const [charChoice, setCharChoice] = useState<string>('');
  const [flError, setFlError] = useState<string | null>(null);

  // Stage state for Memory Match + Riddles (Loc 6)
  const memoryCards = useMemo(() => {
    if (config.type !== 'memory-and-riddle') return [];
    const deck = config.memoryPairs.flatMap((pair) => [
      { uid: `${pair.id}-a`, pairId: pair.id, label: pair.title },
      { uid: `${pair.id}-b`, pairId: pair.id, label: pair.clue },
    ]);
    return deterministicShuffle(deck, 3);
  }, [config]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [riddleAnswers, setRiddleAnswers] = useState<Record<string, number>>({});
  const [riddleError, setRiddleError] = useState<string | null>(null);

  const markSolved = () => {
    onSuccessSfx();
    setFinished(true);
  };

  const handleCardFlip = (uid: string, pairId: string) => {
    if (matchedPairs.includes(pairId) || flippedUids.includes(uid) || flippedUids.length >= 2) {
      return;
    }
    onClickSfx();
    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = memoryCards.find((c) => c.uid === nextFlipped[0]);
      const second = memoryCards.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        const nextMatched = [...matchedPairs, pairId];
        setMatchedPairs(nextMatched);
        setFlippedUids([]);
        onSuccessSfx();
        if (config.type === 'memory-and-riddle' && nextMatched.length === config.memoryPairs.length) {
          setTimeout(() => setStage(2), 450);
        }
      } else {
        setTimeout(() => {
          setFlippedUids([]);
        }, 650);
      }
    }
  };

  return (
    <div
      className="anim-backdrop-fade fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/62"
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      <div
        className="anim-modal-pop sriwijaya-panel rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#261c15]"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#b93829] text-[#faf5eb] border-b-2 border-[#f5b942]">
          <h2 className="font-display font-bold text-base md:text-lg flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-[#f5b942]" />
            <span>{config.title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Tantangan"
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scroll space-y-4">
          {finished ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0e5a5c] text-[#f5b942] flex items-center justify-center mx-auto">
                <Sparkles className="w-9 h-9" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-[#0e5a5c]">
                Luar Biasa! Tantangan Berhasil Dituntaskan!
              </h3>
              <p className="text-sm text-[#3a2c22] max-w-md mx-auto">
                {alreadyCompleted
                  ? 'Kamu sudah menyelesaikan tantangan ini sebelumnya, tapi latihanmu tetap keren!'
                  : `Kamu meraih +${REWARDS.COMPLETE_MINIGAME.xp} XP, +${REWARDS.COMPLETE_MINIGAME.coins} Koin, dan Lencana lokasi ini!`}
              </p>
              <button
                type="button"
                onClick={onComplete}
                className="px-6 py-3 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
              >
                Klaim Hadiah & Lanjutkan
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs md:text-sm font-semibold text-[#4e3b2d] bg-[#f0e6d2] p-3 rounded-xl border border-[#c99c4c]/70">
                {config.instruction}
              </p>

              {/* 1. BENTENG KUTO BESAK: Susun Paragraf Deskripsi */}
              {config.type === 'paragraph-order' && (
                <SentenceOrderWidget
                  items={config.sentences}
                  buttonLabel="Periksa Urutan Paragraf"
                  onClickSfx={onClickSfx}
                  onErrorSfx={onErrorSfx}
                  onSolved={markSolved}
                />
              )}

              {/* 2. MUSEUM SMB II: Cocokkan Koleksi & Ide Pokok */}
              {config.type === 'match-and-main-idea' && stage === 1 && (
                <PairMatchWidget
                  pairs={config.pairs.map((p) => ({
                    id: p.id,
                    left: p.itemName,
                    right: p.description,
                  }))}
                  leftTitle="Benda Koleksi Museum"
                  rightTitle="Keterangan Sejarah"
                  onClickSfx={onClickSfx}
                  onErrorSfx={onErrorSfx}
                  onSolved={() => {
                    onSuccessSfx();
                    setStage(2);
                  }}
                />
              )}

              {config.type === 'match-and-main-idea' && stage === 2 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white border border-[#c99c4c] space-y-2">
                    <h3 className="font-display font-bold text-sm text-[#0e5a5c]">
                      {config.readingTitle}
                    </h3>
                    <p className="text-sm leading-relaxed">{config.readingPassage}</p>
                  </div>
                  <p className="text-sm font-bold text-[#261c15]">{config.question}</p>
                  <div className="space-y-2">
                    {config.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onClickSfx();
                          setSelectedOption(opt.id);
                          setMcFeedback(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border-2 text-xs md:text-sm cursor-pointer ${
                          selectedOption === opt.id
                            ? 'bg-[#f5b942]/30 border-[#0e5a5c] font-bold'
                            : 'bg-white border-[#c99c4c]/60 hover:bg-[#faf0dc]'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                  {mcFeedback && (
                    <p className="text-xs font-bold text-[#b93829]">{mcFeedback}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = config.options.find((o) => o.id === selectedOption);
                      if (chosen?.isCorrect) markSolved();
                      else {
                        onErrorSfx();
                        setMcFeedback('Belum tepat! Ide pokok adalah kalimat utama yang merangkum isi paragraf.');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
                  >
                    Periksa Jawaban Ide Pokok
                  </button>
                </div>
              )}

              {/* 3. JEMBATAN AMPERA: Kalimat Efektif S-P-O-K & Pemahaman */}
              {config.type === 'effective-sentence' && stage === 1 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#0e5a5c]">{config.hintSpok}</p>
                  <div className="min-h-[56px] p-3 rounded-xl bg-white border-2 border-dashed border-[#0e5a5c] flex flex-wrap gap-2 items-center">
                    {pickedTokens.length === 0 ? (
                      <span className="text-xs text-[#7d6d5d]">
                        Klik kartu kata di bawah untuk menyusun kalimat efektif...
                      </span>
                    ) : (
                      pickedTokens.map((tok, i) => (
                        <button
                          key={`${tok}-${i}`}
                          type="button"
                          onClick={() => {
                            onClickSfx();
                            setPickedTokens((prev) => prev.filter((_, idx) => idx !== i));
                            setSentenceError(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0e5a5c] text-[#faf5eb] text-xs font-bold cursor-pointer"
                        >
                          {tok}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {config.wordTokens
                      .filter((t) => !pickedTokens.includes(t))
                      .map((tok) => (
                        <button
                          key={tok}
                          type="button"
                          onClick={() => {
                            onClickSfx();
                            setPickedTokens((prev) => [...prev, tok]);
                            setSentenceError(null);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#c99c4c] hover:bg-[#faf0dc] text-xs font-bold cursor-pointer"
                        >
                          {tok}
                        </button>
                      ))}
                  </div>

                  {sentenceError && (
                    <p className="text-xs font-bold text-[#b93829]">{sentenceError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClickSfx();
                        setPickedTokens([]);
                        setSentenceError(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#f0e6d2] border border-[#c99c4c] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (pickedTokens.join(' ') === config.correctSentence) {
                          onSuccessSfx();
                          setStage(2);
                        } else {
                          onErrorSfx();
                          setSentenceError('Susunan S-P-O-K belum tepat. Mulai dengan Subjek ("Siswa kelas lima")!');
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
                    >
                      Periksa Kalimat Efektif
                    </button>
                  </div>
                </div>
              )}

              {config.type === 'effective-sentence' && stage === 2 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white border border-[#c99c4c] space-y-2">
                    <h3 className="font-display font-bold text-sm text-[#0e5a5c]">
                      {config.readingTitle}
                    </h3>
                    <p className="text-sm leading-relaxed">{config.readingPassage}</p>
                  </div>
                  <p className="text-sm font-bold">{config.question}</p>
                  <div className="space-y-2">
                    {config.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onClickSfx();
                          setSelectedOption(opt.id);
                          setMcFeedback(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border-2 text-xs md:text-sm cursor-pointer ${
                          selectedOption === opt.id
                            ? 'bg-[#f5b942]/30 border-[#0e5a5c] font-bold'
                            : 'bg-white border-[#c99c4c]/60 hover:bg-[#faf0dc]'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                  {mcFeedback && <p className="text-xs font-bold text-[#b93829]">{mcFeedback}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = config.options.find((o) => o.id === selectedOption);
                      if (chosen?.isCorrect) markSolved();
                      else {
                        onErrorSfx();
                        setMcFeedback('Baca ulang paragraf di atas dengan teliti ya!');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
                  >
                    Periksa Jawaban Bacaan
                  </button>
                </div>
              )}

              {/* 4. PULAU KEMARO: Fakta vs Legenda + Urutkan Kisah */}
              {config.type === 'fact-vs-legend' && stage === 1 && (
                <div className="space-y-3">
                  {config.statements.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl bg-white border border-[#c99c4c]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <p className="text-xs md:text-sm flex-1">{st.text}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(['fakta', 'legenda'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              onClickSfx();
                              setFlAnswers((prev) => ({ ...prev, [st.id]: cat }));
                              setFlError(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                              flAnswers[st.id] === cat
                                ? 'bg-[#0e5a5c] text-white'
                                : 'bg-[#f0e6d2] text-[#261c15]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="p-3 rounded-xl bg-white border border-[#c99c4c]/70 space-y-2">
                    <p className="text-xs font-bold text-[#0e5a5c]">
                      {config.characterQuestion.prompt}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {config.characterQuestion.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            onClickSfx();
                            setCharChoice(opt);
                            setFlError(null);
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-semibold text-left cursor-pointer ${
                            charChoice === opt
                              ? 'bg-[#f5b942]/35 border-[#0e5a5c] font-bold'
                              : 'bg-[#faf5eb] border-[#c99c4c]/60'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {flError && <p className="text-xs font-bold text-[#b93829]">{flError}</p>}

                  <button
                    type="button"
                    onClick={() => {
                      const allCatRight = config.statements.every(
                        (s) => flAnswers[s.id] === s.category,
                      );
                      const charRight = charChoice === config.characterQuestion.correct;
                      if (allCatRight && charRight) {
                        onSuccessSfx();
                        setStage(2);
                      } else {
                        onErrorSfx();
                        setFlError('Masih ada pilihan Fakta/Legenda atau tokoh yang kurang tepat.');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
                  >
                    Lanjut ke Tahap Urutkan Kisah
                  </button>
                </div>
              )}

              {config.type === 'fact-vs-legend' && stage === 2 && (
                <SentenceOrderWidget
                  items={config.storyOrder}
                  buttonLabel="Periksa Urutan Legenda Pulau Kemaro"
                  onClickSfx={onClickSfx}
                  onErrorSfx={onErrorSfx}
                  onSolved={markSolved}
                />
              )}

              {/* 5. RUMAH LIMAS: Kosakata & Teks Pengamatan */}
              {config.type === 'vocab-and-observation' && stage === 1 && (
                <PairMatchWidget
                  pairs={config.vocabMatches.map((v) => ({
                    id: v.id,
                    left: v.word,
                    right: v.definition,
                  }))}
                  leftTitle="Kosakata Rumah Limas"
                  rightTitle="Arti Kosakata"
                  onClickSfx={onClickSfx}
                  onErrorSfx={onErrorSfx}
                  onSolved={() => {
                    onSuccessSfx();
                    setStage(2);
                  }}
                />
              )}

              {config.type === 'vocab-and-observation' && stage === 2 && (
                <SentenceOrderWidget
                  items={config.observationOrder}
                  buttonLabel="Periksa Susunan Teks Pengamatan"
                  onClickSfx={onClickSfx}
                  onErrorSfx={onErrorSfx}
                  onSolved={markSolved}
                />
              )}

              {/* 6. TAMAN PURBAKALA: Memory Match & Teka-Teki Sriwijaya */}
              {config.type === 'memory-and-riddle' && stage === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0e5a5c]">
                    <span>Cocokkan Kartu Warisan Sumatera Selatan</span>
                    <span className="tabular-nums">
                      {matchedPairs.length}/{config.memoryPairs.length} Pasang
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {memoryCards.map((card) => {
                      const isMatched = matchedPairs.includes(card.pairId);
                      const isOpen = isMatched || flippedUids.includes(card.uid);
                      return (
                        <button
                          key={card.uid}
                          type="button"
                          onClick={() => handleCardFlip(card.uid, card.pairId)}
                          className={`min-h-[70px] p-2 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer ${
                            isMatched
                              ? 'bg-[#e3f2ec] border-[#0e5a5c] text-[#0e5a5c]'
                              : isOpen
                                ? 'bg-[#f5b942]/30 border-[#261c15] text-[#261c15]'
                                : 'bg-[#0e5a5c] border-[#d4941e] text-[#f5b942] hover:bg-[#093d3e]'
                          }`}
                        >
                          {isOpen ? card.label : 'Sriwijaya'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {config.type === 'memory-and-riddle' && stage === 2 && (
                <div className="space-y-3">
                  {config.riddles.map((rid, rIdx) => (
                    <div
                      key={rid.id}
                      className="p-3.5 rounded-xl bg-white border border-[#c99c4c] space-y-2"
                    >
                      <p className="text-xs md:text-sm font-bold text-[#261c15]">
                        {rIdx + 1}. {rid.question}
                      </p>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {rid.options.map((opt, oIdx) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              onClickSfx();
                              setRiddleAnswers((prev) => ({ ...prev, [rid.id]: oIdx }));
                              setRiddleError(null);
                            }}
                            className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer ${
                              riddleAnswers[rid.id] === oIdx
                                ? 'bg-[#0e5a5c] text-white border-[#0e5a5c] font-bold'
                                : 'bg-[#faf5eb] border-[#c99c4c]/60'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {riddleError && (
                    <p className="text-xs font-bold text-[#b93829]">{riddleError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const allOk = config.riddles.every(
                        (r) => riddleAnswers[r.id] === r.correctIndex,
                      );
                      if (allOk) markSolved();
                      else {
                        onErrorSfx();
                        setRiddleError('Ada jawaban teka-teki yang belum tepat. Coba periksa kembali!');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0e5a5c] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
                  >
                    Selesaikan Teka-Teki Sriwijaya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
