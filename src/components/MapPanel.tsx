import { CheckCircle2, Lock, MapPin, PartyPopper, Play, Star } from 'lucide-react';
import { LOCATIONS } from '../data/locations';
import {
  areAllLocationsCompleted,
  isLocationCompleted,
  isLocationUnlocked,
} from '../game/progression';
import { LocationId, PlayerProgress } from '../types/game';

interface MapPanelProps {
  progress: PlayerProgress;
  selectedLocationId: LocationId;
  onSelectLocation: (id: LocationId) => void;
  onEnterLocation: (id: LocationId) => void;
  onOpenFinale: () => void;
}

export function MapPanel({
  progress,
  selectedLocationId,
  onSelectLocation,
  onEnterLocation,
  onOpenFinale,
}: MapPanelProps) {
  const selectedLoc = LOCATIONS.find((l) => l.id === selectedLocationId) ?? LOCATIONS[0];
  const unlocked = isLocationUnlocked(progress, selectedLoc.id);
  const locProg = progress.locations[selectedLoc.id];
  const completed = isLocationCompleted(locProg, selectedLoc.relics.length);
  const allDone = areAllLocationsCompleted(progress);

  return (
    <div
      className="anim-slide-up fixed inset-x-0 bottom-0 z-20 pointer-events-none p-3 md:p-4 flex flex-col gap-2.5"
    >
      {/* Selected Location Detail Bar + Location List Strip */}
      <div className="max-w-7xl mx-auto w-full pointer-events-auto sriwijaya-panel rounded-2xl p-3 md:p-3.5 flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
        {/* 6 Location Selector Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
          {LOCATIONS.map((loc) => {
            const locUnlocked = isLocationUnlocked(progress, loc.id);
            const lp = progress.locations[loc.id];
            const locDone = isLocationCompleted(lp, loc.relics.length);
            const isSel = loc.id === selectedLocationId;

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc.id)}
                className={`flex flex-col items-start px-2.5 py-2 rounded-xl border text-left transition-colors min-w-0 cursor-pointer ${
                  isSel
                    ? 'bg-[#0e5a5c] text-[#faf5eb] border-[#d4941e]'
                    : locUnlocked
                      ? 'bg-[#f0e6d2] text-[#261c15] border-[#c99c4c]/70 hover:bg-[#e7d8ba]'
                      : 'bg-[#e6dfd2] text-[#6d6359] border-[#c5baa6] opacity-85'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1 text-[11px] font-bold">
                  <span>Lokasi {loc.order}</span>
                  {!locUnlocked ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  ) : locDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#f5b942] shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                  )}
                </div>
                <span className="font-display font-bold text-xs mt-0.5 truncate w-full">
                  {loc.shortName}
                </span>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        lp.stars >= s
                          ? 'text-[#f5b942] fill-[#f5b942]'
                          : isSel
                            ? 'text-white/30'
                            : 'text-[#261c15]/20'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Location Summary & Primary Action */}
        <div className="flex items-center justify-between gap-3 xl:border-l xl:border-[#c99c4c]/50 xl:pl-4 shrink-0">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-sm md:text-base text-[#261c15] truncate">
              {selectedLoc.name}
            </h2>
            <p className="text-xs text-[#4e3b2d] truncate max-w-xs">
              {unlocked
                ? completed
                  ? `Tuntas (${locProg.stars}/3 Bintang · ${locProg.collectedRelics.length}/3 Benda)`
                  : `Terbuka · ${locProg.collectedRelics.length}/3 Benda · ${locProg.stars}/3 Bintang`
                : `Selesaikan Lokasi ${selectedLoc.order - 1} untuk membuka`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allDone && (
              <button
                type="button"
                onClick={onOpenFinale}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#d4941e] hover:bg-[#be8217] text-[#261c15] font-display font-bold text-xs md:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4" />
                <span>Perayaan Akhir</span>
              </button>
            )}

            <button
              type="button"
              disabled={!unlocked}
              onClick={() => onEnterLocation(selectedLoc.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-display font-bold text-xs md:text-sm transition-colors whitespace-nowrap shrink-0 ${
                unlocked
                  ? 'bg-[#b93829] hover:bg-[#9e2e21] text-[#faf5eb] cursor-pointer'
                  : 'bg-[#b8afa0] text-[#5e564b] cursor-not-allowed'
              }`}
            >
              {unlocked ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
              <span>{unlocked ? 'Jelajahi Lokasi' : 'Terkunci'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
