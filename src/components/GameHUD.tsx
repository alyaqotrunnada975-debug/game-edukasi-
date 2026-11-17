import {
  Award,
  BookMarked,
  Coins,
  Home,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getCompletedLocationsCount, getLevelInfo, getTotalStars } from '../game/progression';
import { GameScreen, PlayerProgress } from '../types/game';

interface GameHUDProps {
  screen: GameScreen;
  progress: PlayerProgress;
  isFullscreen: boolean;
  locationTitle?: string;
  onOpenAlbum: () => void;
  onOpenBadges: () => void;
  onOpenAudio: () => void;
  onToggleFullscreen: () => void;
  onBackToMap: () => void;
  onBackHome: () => void;
}

export function GameHUD({
  screen,
  progress,
  isFullscreen,
  locationTitle,
  onOpenAlbum,
  onOpenBadges,
  onOpenAudio,
  onToggleFullscreen,
  onBackToMap,
  onBackHome,
}: GameHUDProps) {
  const levelInfo = getLevelInfo(progress.xp);
  const totalStars = getTotalStars(progress);
  const completedCount = getCompletedLocationsCount(progress);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none flex items-start justify-between gap-2 md:gap-3 p-2.5 md:p-4">
      {/* Top-Left Player Status Cluster */}
      <div className="pointer-events-auto sriwijaya-hud-chip rounded-xl px-3 py-1.5 md:px-3.5 md:py-2 text-[#faf5eb] flex items-center gap-3 md:gap-4 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-[#f5b942] font-bold whitespace-nowrap">
            <span>{progress.playerName || 'Petualang'}</span>
            <span aria-hidden="true">·</span>
            <span>Level {levelInfo.level} ({levelInfo.title})</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 md:mt-1">
            <div className="w-20 sm:w-28 h-2 rounded-full bg-black/45 overflow-hidden border border-white/15">
              <div
                className="h-full bg-[#f5b942] transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[#faf5eb]/90">
              {levelInfo.currentXp} XP
            </span>
          </div>
        </div>

        <div className="h-7 w-px bg-white/20 hidden sm:block" />

        <div className="flex items-center gap-2.5 md:gap-3.5 text-[11px] md:text-xs font-bold tabular-nums">
          <div className="flex items-center gap-1" title="Total Bintang">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f5b942] fill-[#f5b942]" />
            <span>{totalStars}/18</span>
          </div>
          <div className="flex items-center gap-1" title="Koin Sriwijaya">
            <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f5b942]" />
            <span>{progress.coins}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[#9fe3d8]" title="Progres Lokasi">
            <MapIcon className="w-4 h-4" />
            <span>{completedCount}/6 Lokasi</span>
          </div>
        </div>
      </div>

      {/* Location Banner when inside Explore */}
      {screen === 'explore' && locationTitle && (
        <div className="pointer-events-none hidden xl:flex sriwijaya-hud-chip rounded-xl px-4 py-2 text-[#faf5eb] items-center">
          <span className="font-display font-bold text-sm tracking-wide">{locationTitle}</span>
        </div>
      )}

      {/* Top-Right Action Controls */}
      <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenAlbum}
          aria-label="Album Pengetahuan"
          title="Album Pengetahuan"
          className="sriwijaya-hud-chip rounded-xl px-2.5 md:px-3 py-2 text-[#faf5eb] hover:bg-[#233235] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookMarked className="w-4 h-4 text-[#f5b942]" />
          <span className="hidden lg:inline">Album Pengetahuan</span>
        </button>

        <button
          type="button"
          onClick={onOpenBadges}
          aria-label={`Lencana (${progress.badges.length}/6)`}
          title={`Lencana (${progress.badges.length}/6)`}
          className="sriwijaya-hud-chip rounded-xl px-2.5 md:px-3 py-2 text-[#faf5eb] hover:bg-[#233235] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Award className="w-4 h-4 text-[#f5b942]" />
          <span className="hidden lg:inline">Lencana ({progress.badges.length}/6)</span>
        </button>

        <button
          type="button"
          onClick={onOpenAudio}
          aria-label="Pengaturan Audio"
          className="sriwijaya-hud-chip rounded-xl p-2 text-[#faf5eb] hover:bg-[#233235] transition-colors shrink-0 cursor-pointer"
        >
          {progress.audio.muted ? (
            <VolumeX className="w-4 h-4 text-[#f5b942]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#f5b942]" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          className="sriwijaya-hud-chip rounded-xl p-2 text-[#faf5eb] hover:bg-[#233235] transition-colors shrink-0 cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-[#faf5eb]" />
          ) : (
            <Maximize2 className="w-4 h-4 text-[#faf5eb]" />
          )}
        </button>

        {screen === 'explore' && (
          <button
            type="button"
            onClick={onBackToMap}
            className="rounded-xl px-3 py-2 bg-[#0e5a5c] hover:bg-[#093d3e] border border-[#f5b942]/70 text-[#faf5eb] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MapIcon className="w-4 h-4" />
            <span>Peta</span>
          </button>
        )}

        <button
          type="button"
          onClick={onBackHome}
          aria-label="Kembali ke Beranda"
          className="sriwijaya-hud-chip rounded-xl px-3 py-2 text-[#faf5eb] hover:bg-[#233235] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#f5b942]" />
          <span className="hidden md:inline">Beranda</span>
        </button>
      </div>
    </header>
  );
}
