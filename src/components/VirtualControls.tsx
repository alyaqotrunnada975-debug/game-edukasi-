import { useRef, useState } from 'react';
import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Compass,
  Hand,
  Puzzle,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { isLocationCompleted } from '../game/progression';
import { LocationConfig, LocationProgress } from '../types/game';
import { NearbyTarget } from '../three/ExploreScene3D';
import { RelicArtworkIcon } from './RelicIcon';

interface VirtualControlsProps {
  location: LocationConfig;
  locProgress: LocationProgress;
  nearby: NearbyTarget | null;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  cameraYawDeltaRef: React.MutableRefObject<number>;
  onJump: () => void;
  onInteract: () => void;
  onOpenMiniGame: () => void;
}

export function VirtualControls({
  location,
  locProgress,
  nearby,
  joystickRef,
  cameraYawDeltaRef,
  onJump,
  onInteract,
  onOpenMiniGame,
}: VirtualControlsProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [missionCollapsed, setMissionCollapsed] = useState(false);
  const activePointerId = useRef<number | null>(null);
  const completed = isLocationCompleted(locProgress, location.relics.length);

  const updateStick = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.36;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob({ x: dx, y: dy });
    joystickRef.current = {
      x: dx / maxR,
      y: -dy / maxR, // up on screen = +forward
    };
  };

  const resetStick = () => {
    activePointerId.current = null;
    setKnob({ x: 0, y: 0 });
    joystickRef.current = { x: 0, y: 0 };
  };

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2.5 md:p-4 pt-20 md:pt-24">
      {/* Top-Left Compact Mission Checklist (positioned cleanly below GameHUD) */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="pointer-events-auto sriwijaya-panel rounded-xl p-2.5 md:p-3 max-w-[274px] text-[#261c15]"
          data-testid="mission-panel"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
              <span>Misi {location.shortName}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-mono tabular-nums font-bold text-[#0e5a5c] whitespace-nowrap">
                {locProgress.stars}/3 ★
              </span>
              <button
                type="button"
                onClick={() => setMissionCollapsed((v) => !v)}
                aria-label={missionCollapsed ? 'Tampilkan Daftar Misi' : 'Sembunyikan Daftar Misi'}
                className="p-0.5 rounded hover:bg-[#e7d6b8] text-[#5e442f] cursor-pointer"
              >
                {missionCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {!missionCollapsed && (
            <>
              <ul className="mt-2 space-y-1 text-[11px] font-medium">
                <li className="flex items-center gap-1.5">
                  {locProgress.talkedToGuide ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#9c8c75] shrink-0" />
                  )}
                  <span>Bicara dengan {location.guide.speakerName}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  {locProgress.readInfoBoard ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#9c8c75] shrink-0" />
                  )}
                  <span>Baca Papan Informasi</span>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {locProgress.collectedRelics.length >= location.relics.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#9c8c75] shrink-0" />
                    )}
                    <span className="tabular-nums">
                      Kumpulkan Benda ({locProgress.collectedRelics.length}/{location.relics.length})
                    </span>
                  </div>
                  <div className="pl-5 flex items-center gap-1.5" data-testid="mission-relic-chips">
                    {location.relics.map((relic) => {
                      const found = locProgress.collectedRelics.includes(relic.id);
                      return (
                        <div
                          key={relic.id}
                          title={found ? `${relic.name} (Ditemukan)` : `Cari: ${relic.name}`}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            found
                              ? 'bg-[#fff7df] border-[#d4941e] shadow-xs'
                              : 'bg-[#e7decb]/75 border-[#b9aa90] opacity-60 grayscale'
                          }`}
                        >
                          <RelicArtworkIcon iconType={relic.iconType} className="w-5 h-5" />
                        </div>
                      );
                    })}
                  </div>
                </li>
                <li className="flex items-center gap-1.5">
                  {locProgress.completedMiniGame ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#9c8c75] shrink-0" />
                  )}
                  <span>Selesaikan Tantangan Lokasi</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={onOpenMiniGame}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-3 rounded-lg bg-[#b93829] hover:bg-[#9e2e21] text-[#faf5eb] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>{completed ? 'Mainkan Tantangan Lagi' : 'Buka Tantangan Bahasa'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Controls Row: Joystick Left + Interact/Jump/Rotate Right */}
      <div className="flex items-end justify-between gap-4">
        {/* Virtual Touch Joystick */}
        <div className="flex items-end gap-3">
          <div
            ref={padRef}
            onPointerDown={(e) => {
              activePointerId.current = e.pointerId;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              updateStick(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (activePointerId.current === e.pointerId) {
                updateStick(e.clientX, e.clientY);
              }
            }}
            onPointerUp={resetStick}
            onPointerCancel={resetStick}
            aria-label="Joystick Gerak"
            className="pointer-events-auto relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#182224]/75 border-2 border-[#d4941e]/75 flex items-center justify-center touch-none cursor-grab"
          >
            <div
              className="w-10 h-10 rounded-full bg-[#f5b942] border-2 border-[#faf5eb] shadow-md pointer-events-none"
              style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
            />
          </div>
          <p className="hidden lg:block text-[11px] font-semibold text-[#faf5eb] bg-[#182224]/80 px-3 py-1.5 rounded-lg border border-white/15">
            WASD / Panah · Spasi Lompat · E Interaksi · Geser Layar Putar Kamera
          </p>
        </div>

        {/* Action & Camera Rotate Buttons */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {nearby && (
            <button
              type="button"
              onClick={onInteract}
              data-testid="interact-button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5b942] hover:bg-[#e5a830] text-[#261c15] border-2 border-[#faf5eb] font-display font-bold text-xs md:text-sm shadow-lg transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {nearby.kind === 'relic' && nearby.iconType ? (
                <RelicArtworkIcon iconType={nearby.iconType} className="w-5 h-5 shrink-0" />
              ) : (
                <Hand className="w-4 h-4 shrink-0" />
              )}
              <span>[E] {nearby.label}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => {
                cameraYawDeltaRef.current = -1;
              }}
              onPointerUp={() => {
                cameraYawDeltaRef.current = 0;
              }}
              onPointerLeave={() => {
                cameraYawDeltaRef.current = 0;
              }}
              aria-label="Putar Kamera Kiri"
              className="sriwijaya-hud-chip rounded-xl p-3 text-[#faf5eb] hover:bg-[#233235] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onPointerDown={() => {
                cameraYawDeltaRef.current = 1;
              }}
              onPointerUp={() => {
                cameraYawDeltaRef.current = 0;
              }}
              onPointerLeave={() => {
                cameraYawDeltaRef.current = 0;
              }}
              aria-label="Putar Kamera Kanan"
              className="sriwijaya-hud-chip rounded-xl p-3 text-[#faf5eb] hover:bg-[#233235] cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onJump}
              aria-label="Lompat"
              className="rounded-xl px-4 py-3 bg-[#0e5a5c] hover:bg-[#093d3e] border-2 border-[#d4941e]/80 text-[#faf5eb] font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Lompat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
