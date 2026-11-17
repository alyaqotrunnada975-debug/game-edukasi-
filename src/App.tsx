import { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { audioEngine } from './audio/nusantaraAudio';
import { DialogueModal } from './components/DialogueModal';
import { FinaleOverlay } from './components/FinaleOverlay';
import { GameHUD } from './components/GameHUD';
import { InfoBoardModal } from './components/InfoBoardModal';
import {
  AboutModal,
  AlbumModal,
  AudioSettingsModal,
  BadgesModal,
  HowToPlayModal,
} from './components/InfoModals';
import { MapPanel } from './components/MapPanel';
import { MiniGameModal } from './components/MiniGameModal';
import { OpeningOverlay } from './components/OpeningOverlay';
import { OrientationGuard } from './components/OrientationGuard';
import { VirtualControls } from './components/VirtualControls';
import { LOCATIONS } from './data/locations';
import {
  applyCollectRelicReward,
  applyMiniGameReward,
  applyReadInfoReward,
  applyTalkGuideReward,
  areAllLocationsCompleted,
  createInitialProgress,
  isLocationCompleted,
  isLocationUnlocked,
  loadProgressFromStorage,
  REWARDS,
  saveProgressToStorage,
} from './game/progression';
import { ExploreScene3D, NearbyTarget } from './three/ExploreScene3D';
import { FinaleScene3D } from './three/FinaleScene3D';
import { MapDiorama3D } from './three/MapDiorama3D';
import { OpeningScene3D } from './three/OpeningScene3D';
import { AudioSettings, GameScreen, LocationId, PlayerProgress } from './types/game';

type ActiveModal =
  | null
  | 'howToPlay'
  | 'about'
  | 'audio'
  | 'album'
  | 'badges'
  | 'dialogue'
  | 'infoboard'
  | 'minigame'
  | 'confirmReset';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgressFromStorage());
  const [screen, setScreen] = useState<GameScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'map';
    }
    return 'opening';
  });
  const [selectedMapLoc, setSelectedMapLoc] = useState<LocationId>('benteng-kuto-besak');
  const [activeExploreLocId, setActiveExploreLocId] = useState<LocationId>('benteng-kuto-besak');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [nearby, setNearby] = useState<NearbyTarget | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionState, setTransitionState] = useState<{
    phase: 'entering' | 'exiting' | null;
    label: string;
  }>({ phase: null, label: '' });
  const transitionTimersRef = useRef<number[]>([]);

  // Refs for ExploreScene3D controls (no 60Hz React state updates)
  const joystickRef = useRef({ x: 0, y: 0 });
  const cameraYawDeltaRef = useRef(0);
  const jumpSignalRef = useRef(0);
  const interactSignalRef = useRef(0);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
    transitionTimersRef.current = [];
  }, []);

  useEffect(() => clearTransitionTimers, [clearTransitionTimers]);

  const transitionToScreen = useCallback(
    (nextScreen: GameScreen, label: string, beforeSwap?: () => void) => {
      clearTransitionTimers();
      setTransitionState({ phase: 'entering', label });
      const swapTimer = window.setTimeout(() => {
        beforeSwap?.();
        setScreen(nextScreen);
      }, 240);
      const exitTimer = window.setTimeout(() => {
        setTransitionState((prev) => ({ ...prev, phase: 'exiting' }));
      }, 420);
      const hideTimer = window.setTimeout(() => {
        setTransitionState({ phase: null, label: '' });
      }, 760);
      transitionTimersRef.current = [swapTimer, exitTimer, hideTimer];
    },
    [clearTransitionTimers],
  );

  const showToast = useCallback((text: string) => {
    const id = Date.now();
    setToast({ id, text });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3400);
  }, []);

  // Persist progress & sync audio settings
  useEffect(() => {
    saveProgressToStorage(progress);
    audioEngine.updateSettings(progress.audio);
  }, [progress]);

  // Mirror state to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state =
      screen === 'opening' ? 'title' : screen === 'finale' ? 'gameover' : 'playing';
    document.body.dataset.screen = screen;
  }, [screen]);

  // Listen fullscreen changes
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Keyboard Escape closes open modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  const activeLocation =
    LOCATIONS.find((l) => l.id === activeExploreLocId) ?? LOCATIONS[0];
  const activeLocProgress = progress.locations[activeLocation.id];
  const hasSavedProgress =
    progress.xp > 0 || progress.playerName.trim().length > 0;

  const handleStartAdventure = (name: string) => {
    audioEngine.startMusic();
    audioEngine.playClick();
    setProgress((prev) => ({ ...prev, playerName: name }));
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    transitionToScreen('map', 'Membuka Peta Sumatera Selatan...');
  };

  const handleToggleMute = () => {
    audioEngine.startMusic();
    setProgress((prev) => ({
      ...prev,
      audio: { ...prev.audio, muted: !prev.audio.muted },
    }));
  };

  const handleAudioChange = (nextAudio: AudioSettings) => {
    audioEngine.startMusic();
    setProgress((prev) => ({ ...prev, audio: nextAudio }));
  };

  const handleToggleFullscreen = () => {
    audioEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleEnterLocation = (locId: LocationId) => {
    if (!isLocationUnlocked(progress, locId)) return;
    const loc = LOCATIONS.find((l) => l.id === locId);
    audioEngine.startMusic();
    audioEngine.playClick();
    transitionToScreen(
      'explore',
      `Menuju ${loc?.shortName ?? 'Lokasi Sejarah'}...`,
      () => {
        setActiveExploreLocId(locId);
        setNearby(null);
      },
    );
  };

  const handleInteractTarget = useCallback(
    (target: NearbyTarget) => {
      if (target.kind === 'guide') {
        audioEngine.playDialog();
        setActiveModal('dialogue');
      } else if (target.kind === 'infoboard') {
        audioEngine.playClick();
        setActiveModal('infoboard');
      } else if (target.kind === 'relic') {
        const relicObj = activeLocation.relics.find((r) => r.id === target.id);
        setProgress((prev) => {
          const { next, awarded } = applyCollectRelicReward(
            prev,
            activeLocation.id,
            target.id,
          );
          if (awarded) {
            audioEngine.playRelic();
            showToast(
              `Menemukan ${relicObj?.name ?? 'Benda Bersejarah'}! (+${REWARDS.FIND_RELIC.xp} XP)`,
            );
          }
          return next;
        });
        setNearby((prev) =>
          prev?.kind === 'relic' && prev.id === target.id ? null : prev,
        );
      }
    },
    [activeLocation, showToast],
  );

  const handleCompleteDialogue = () => {
    setProgress((prev) => {
      const { next, awarded } = applyTalkGuideReward(prev, activeLocation.id);
      if (awarded) {
        audioEngine.playRelic();
        showToast(
          `Selesai berdialog! +${REWARDS.TALK_GUIDE.xp} XP · +${REWARDS.TALK_GUIDE.coins} Koin`,
        );
      }
      return next;
    });
    setActiveModal(null);
  };

  const handleCompleteInfoBoard = () => {
    setProgress((prev) => {
      const { next, awarded } = applyReadInfoReward(prev, activeLocation.id);
      if (awarded) {
        audioEngine.playRelic();
        showToast(`Kosakata baru dicatat di Album! (+${REWARDS.READ_INFO.xp} XP)`);
      }
      return next;
    });
    setActiveModal(null);
  };

  const handleCompleteMiniGame = () => {
    let unlockedFinaleNow = false;
    setProgress((prev) => {
      const { next, awarded } = applyMiniGameReward(prev, activeLocation.id);
      const justFinishedLoc = isLocationCompleted(
        next.locations[activeLocation.id],
        activeLocation.relics.length,
      );
      if (awarded) {
        audioEngine.playFanfare();
        if (areAllLocationsCompleted(next) && !next.finaleSeen) {
          unlockedFinaleNow = true;
          return { ...next, finaleSeen: true };
        }
        showToast(
          justFinishedLoc
            ? `Lokasi ${activeLocation.shortName} Tuntas! (+${REWARDS.COMPLETE_MINIGAME.xp} XP, +${REWARDS.COMPLETE_MINIGAME.coins} Koin)`
            : `Tantangan selesai! Lengkapi misi tersisa untuk membuka lokasi berikutnya.`,
        );
      }
      return next;
    });
    setActiveModal(null);
    if (unlockedFinaleNow) {
      transitionToScreen('finale', 'Perayaan Agung Warisan Sriwijaya...');
    }
  };

  const handleConfirmReset = () => {
    audioEngine.playClick();
    const fresh = createInitialProgress(progress.playerName);
    fresh.audio = progress.audio;
    setProgress(fresh);
    setActiveModal(null);
    transitionToScreen('opening', 'Mengatur Ulang Petualangan...', () => {
      setSelectedMapLoc('benteng-kuto-besak');
      setActiveExploreLocId('benteng-kuto-besak');
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#162426]">
      {/* Orientation Guard for Mobile Portrait */}
      <OrientationGuard />

      {/* 3D WebGL Scene Layers */}
      {screen === 'opening' && <OpeningScene3D />}

      {screen === 'map' && (
        <MapDiorama3D
          progress={progress}
          selectedLocationId={selectedMapLoc}
          onSelectLocation={(id) => {
            audioEngine.playClick();
            setSelectedMapLoc(id);
          }}
        />
      )}

      {screen === 'explore' && (
        <ExploreScene3D
          location={activeLocation}
          collectedRelics={activeLocProgress.collectedRelics}
          readInfoBoard={activeLocProgress.readInfoBoard}
          talkedToGuide={activeLocProgress.talkedToGuide}
          modalOpen={activeModal !== null}
          audioSettings={progress.audio}
          joystickRef={joystickRef}
          cameraYawDeltaRef={cameraYawDeltaRef}
          jumpSignalRef={jumpSignalRef}
          interactSignalRef={interactSignalRef}
          onNearbyChange={setNearby}
          onInteract={handleInteractTarget}
          onStepSfx={() => audioEngine.playStep()}
          onJumpSfx={() => audioEngine.playJump()}
        />
      )}

      {screen === 'finale' && <FinaleScene3D />}

      {/* Screen-Specific UI Overlays */}
      {screen === 'opening' && (
        <OpeningOverlay
          initialName={progress.playerName}
          muted={progress.audio.muted}
          hasSavedProgress={hasSavedProgress}
          onStart={handleStartAdventure}
          onToggleMute={handleToggleMute}
          onOpenHowToPlay={() => {
            audioEngine.playClick();
            setActiveModal('howToPlay');
          }}
          onOpenAbout={() => {
            audioEngine.playClick();
            setActiveModal('about');
          }}
        />
      )}

      {(screen === 'map' || screen === 'explore') && (
        <GameHUD
          screen={screen}
          progress={progress}
          isFullscreen={isFullscreen}
          locationTitle={screen === 'explore' ? activeLocation.name : undefined}
          onOpenAlbum={() => {
            audioEngine.playClick();
            setActiveModal('album');
          }}
          onOpenBadges={() => {
            audioEngine.playClick();
            setActiveModal('badges');
          }}
          onOpenAudio={() => {
            audioEngine.playClick();
            setActiveModal('audio');
          }}
          onToggleFullscreen={handleToggleFullscreen}
          onBackToMap={() => {
            audioEngine.playClick();
            transitionToScreen('map', 'Kembali ke Peta Sumatera Selatan...');
          }}
          onBackHome={() => {
            audioEngine.playClick();
            transitionToScreen('opening', 'Kembali ke Halaman Utama...');
          }}
        />
      )}

      {screen === 'map' && (
        <MapPanel
          progress={progress}
          selectedLocationId={selectedMapLoc}
          onSelectLocation={(id) => {
            audioEngine.playClick();
            setSelectedMapLoc(id);
          }}
          onEnterLocation={handleEnterLocation}
          onOpenFinale={() => {
            audioEngine.playFanfare();
            transitionToScreen('finale', 'Menuju Perayaan Agung...');
          }}
        />
      )}

      {screen === 'explore' && (
        <VirtualControls
          location={activeLocation}
          locProgress={activeLocProgress}
          nearby={nearby}
          joystickRef={joystickRef}
          cameraYawDeltaRef={cameraYawDeltaRef}
          onJump={() => {
            jumpSignalRef.current += 1;
          }}
          onInteract={() => {
            interactSignalRef.current += 1;
          }}
          onOpenMiniGame={() => {
            audioEngine.playClick();
            setActiveModal('minigame');
          }}
        />
      )}

      {screen === 'finale' && (
        <FinaleOverlay
          progress={progress}
          onFreeExplore={() => {
            audioEngine.playClick();
            transitionToScreen('map', 'Membuka Peta Jelajah Bebas...');
          }}
          onReplay={() => {
            audioEngine.playClick();
            setActiveModal('confirmReset');
          }}
        />
      )}

      {/* Non-intrusive Reward Toast */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="anim-fade-down fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2 rounded-xl bg-[#0e5a5c] border-2 border-[#f5b942] text-[#faf5eb] font-display font-bold text-xs md:text-sm shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#f5b942]" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Smooth Sriwijaya Two-Phase Compass Transition Curtain */}
      {transitionState.phase && (
        <div
          className={`fixed inset-0 z-50 bg-[#0b4244] flex flex-col items-center justify-center gap-3.5 text-[#faf5eb] ${
            transitionState.phase === 'entering' ? 'anim-curtain-in' : 'anim-curtain-out'
          }`}
          data-testid="scene-transition-curtain"
        >
          <div className="anim-compass-spin w-16 h-16 rounded-2xl bg-[#135c5e] border-2 border-[#f5b942] shadow-xl flex items-center justify-center">
            <Compass className="w-9 h-9 text-[#f5b942]" />
          </div>
          <p className="anim-slide-up font-display font-bold text-base md:text-lg tracking-wide text-[#faf5eb] px-4 text-center">
            {transitionState.label}
          </p>
          <div className="w-44 h-1.5 rounded-full bg-black/30 overflow-hidden border border-[#f5b942]/40">
            <div className="anim-shimmer-bar w-1/2 h-full rounded-full bg-[#f5b942]" />
          </div>
        </div>
      )}

      {/* Active Modals */}
      {activeModal === 'howToPlay' && (
        <HowToPlayModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'about' && (
        <AboutModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'audio' && (
        <AudioSettingsModal
          audio={progress.audio}
          onChange={handleAudioChange}
          onResetProgress={() => setActiveModal('confirmReset')}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'album' && (
        <AlbumModal progress={progress} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'badges' && (
        <BadgesModal progress={progress} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'dialogue' && (
        <DialogueModal
          dialogue={activeLocation.guide}
          alreadyTalked={activeLocProgress.talkedToGuide}
          onAdvanceSfx={() => audioEngine.playDialog()}
          onComplete={handleCompleteDialogue}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'infoboard' && (
        <InfoBoardModal
          info={activeLocation.infoBoard}
          alreadyRead={activeLocProgress.readInfoBoard}
          onComplete={handleCompleteInfoBoard}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'minigame' && (
        <MiniGameModal
          config={activeLocation.miniGame}
          alreadyCompleted={activeLocProgress.completedMiniGame}
          onSuccessSfx={() => audioEngine.playRelic()}
          onErrorSfx={() => audioEngine.playError()}
          onClickSfx={() => audioEngine.playClick()}
          onComplete={handleCompleteMiniGame}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'confirmReset' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi Ulang Petualangan"
        >
          <div className="sriwijaya-panel rounded-2xl max-w-sm w-full p-5 space-y-4 text-[#261c15]">
            <h2 className="font-display font-bold text-lg text-[#b93829]">
              Mulai Petualangan dari Awal?
            </h2>
            <p className="text-sm text-[#3a2c22]">
              Semua bintang, XP, koin, dan lencana yang tersimpan akan diatur ulang ke nol.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-[#f0e6d2] border border-[#c99c4c] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-[#b93829] text-white text-xs font-bold cursor-pointer"
              >
                Ya, Ulang dari Awal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
