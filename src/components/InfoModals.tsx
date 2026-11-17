import { BookOpen, CheckCircle2, Lock, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { BADGES } from '../data/badges';
import { LOCATIONS } from '../data/locations';
import { AudioSettings, PlayerProgress } from '../types/game';
import { LocationBadgeEmblem, RelicArtworkIcon } from './RelicIcon';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

function ModalShell({ title, onClose, children, maxWidth = 'max-w-2xl' }: ModalShellProps) {
  return (
    <div
      className="anim-backdrop-fade fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/62"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`anim-modal-pop sriwijaya-panel rounded-2xl w-full ${maxWidth} max-h-[88vh] flex flex-col overflow-hidden text-[#261c15]`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#0e5a5c] text-[#faf5eb] border-b-2 border-[#d4941e]">
          <h2 className="font-display font-bold text-base md:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Tutup ${title}`}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scroll space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Cara Bermain Jelajah Sriwijaya" onClose={onClose} maxWidth="max-w-xl">
      <ol className="space-y-3 text-sm leading-relaxed text-[#3a2c22]">
        <li>
          <strong className="text-[#0e5a5c]">1. Pilih Lokasi di Peta 3D:</strong> Mulailah dari Benteng Kuto Besak (Lokasi 1). Selesaikan seluruh misi di setiap lokasi untuk membuka lokasi berikutnya hingga Lokasi 6.
        </li>
        <li>
          <strong className="text-[#0e5a5c]">2. Jelajahi Dunia 3D/2.5D:</strong> Gunakan tombol <strong>WASD / Panah</strong>, joystick virtual di layar, atau <strong>ketuk lantai tanah</strong> untuk berjalan otomatis bersama Si Kiko. Tekan <strong>Spasi</strong> untuk melompat dan geser layar untuk memutar kamera.
        </li>
        <li>
          <strong className="text-[#0e5a5c]">3. Bicara, Baca & Kumpulkan:</strong> Dekati Kak Arya, Papan Informasi, dan 3 Benda Bersejarah yang berputar lalu tekan tombol <strong>[E] / Interaksi</strong>.
        </li>
        <li>
          <strong className="text-[#0e5a5c]">4. Selesaikan Tantangan Bahasa Indonesia:</strong> Uji kemampuanmu menyusun paragraf, mencari ide pokok, merangkai kalimat S-P-O-K, memilah fakta-legenda, hingga menuntaskan teka-teki Sriwijaya untuk meraih 3 Bintang dan Lencana!
        </li>
      </ol>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 px-4 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
      >
        Siap Berpetualang!
      </button>
    </ModalShell>
  );
}

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Tentang Jelajah Sriwijaya" onClose={onClose} maxWidth="max-w-xl">
      <p className="text-sm leading-relaxed text-[#3a2c22]">
        <strong>Jelajah Sriwijaya: Petualangan Menyusuri Sejarah Sumatera Selatan</strong> adalah game edukasi interaktif berbasis web 3D/2.5D untuk siswa kelas 5 SD pada mata pelajaran <strong>Bahasa Indonesia</strong> materi <em>&ldquo;Berkunjung ke Tempat Bersejarah&rdquo;</em>.
      </p>
      <div className="p-3.5 rounded-xl bg-[#f0e6d2] border border-[#c99c4c] text-xs space-y-1.5 text-[#3a2c22]">
        <p><strong>6 Destinasi Bersejarah:</strong> Benteng Kuto Besak, Museum SMB II, Jembatan Ampera, Pulau Kemaro, Rumah Limas, dan Taman Purbakala Kerajaan Sriwijaya.</p>
        <p><strong>Kompetensi Bahasa:</strong> Teks deskripsi, ide pokok bacaan, kalimat efektif S-P-O-K, fakta vs. legenda, kosakata daerah/baku, dan teks laporan pengamatan.</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 px-4 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
      >
        Tutup
      </button>
    </ModalShell>
  );
}

export function AudioSettingsModal({
  audio,
  onChange,
  onResetProgress,
  onClose,
}: {
  audio: AudioSettings;
  onChange: (next: AudioSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Pengaturan Audio & Progres" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0e6d2] border border-[#c99c4c]">
          <span className="font-bold">Status Suara Nusantara</span>
          <button
            type="button"
            onClick={() => onChange({ ...audio, muted: !audio.muted })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer ${
              audio.muted ? 'bg-[#b93829] text-white' : 'bg-[#0e5a5c] text-white'
            }`}
          >
            {audio.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{audio.muted ? 'Mati' : 'Aktif'}</span>
          </button>
        </div>

        <div>
          <label htmlFor="music-vol" className="flex justify-between text-xs font-bold mb-1">
            <span>Volume Musik Melayu (Suling, Gambus, Rebana)</span>
            <span className="tabular-nums">{Math.round(audio.musicVolume * 100)}%</span>
          </label>
          <input
            id="music-vol"
            type="range"
            min={0}
            max={100}
            value={Math.round(audio.musicVolume * 100)}
            onChange={(e) => onChange({ ...audio, musicVolume: Number(e.target.value) / 100 })}
            className="w-full accent-[#0e5a5c]"
          />
        </div>

        <div>
          <label htmlFor="sfx-vol" className="flex justify-between text-xs font-bold mb-1">
            <span>Volume Efek Suara</span>
            <span className="tabular-nums">{Math.round(audio.sfxVolume * 100)}%</span>
          </label>
          <input
            id="sfx-vol"
            type="range"
            min={0}
            max={100}
            value={Math.round(audio.sfxVolume * 100)}
            onChange={(e) => onChange({ ...audio, sfxVolume: Number(e.target.value) / 100 })}
            className="w-full accent-[#0e5a5c]"
          />
        </div>

        <div className="pt-3 border-t border-[#c99c4c]/40 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onResetProgress}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f0e6d2] hover:bg-[#e5d6b8] border border-[#b93829]/50 text-[#b93829] text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulang dari Awal</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0e5a5c] hover:bg-[#093d3e] text-[#faf5eb] font-display font-bold text-sm cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function AlbumModal({ progress, onClose }: { progress: PlayerProgress; onClose: () => void }) {
  return (
    <ModalShell title="Album Pengetahuan Sumatera Selatan" onClose={onClose} maxWidth="max-w-3xl">
      <p className="text-xs text-[#4e3b2d]">
        Baca Papan Informasi dan kumpulkan Benda Bersejarah di setiap lokasi untuk melengkapi Album Pengetahuanmu!
      </p>

      <div className="space-y-4">
        {LOCATIONS.map((loc) => {
          const lp = progress.locations[loc.id];
          const relicsFound = lp.collectedRelics;
          const vocabUnlocked = lp.readInfoBoard;

          return (
            <div key={loc.id} className="p-4 rounded-xl bg-[#f0e6d2]/80 border border-[#c99c4c]/70 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-sm text-[#0e5a5c]">
                  {loc.order}. {loc.name}
                </h3>
                <span className="text-xs font-bold tabular-nums text-[#4e3b2d]">
                  {relicsFound.length}/{loc.relics.length} Benda · {vocabUnlocked ? 'Info Terbaca' : 'Info Belum Dibaca'}
                </span>
              </div>

              {/* Relics Grid */}
              <div className="grid sm:grid-cols-3 gap-2">
                {loc.relics.map((r) => {
                  const owned = relicsFound.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                        owned
                          ? 'bg-white border-[#c99c4c] text-[#261c15]'
                          : 'bg-[#e5dccb] border-[#c5baa6] text-[#75695c]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                          owned
                            ? 'bg-[#fff8e4] border-[#d4941e]'
                            : 'bg-[#d8cebb] border-[#bfb49f]'
                        }`}
                      >
                        <RelicArtworkIcon
                          iconType={r.iconType}
                          className={`w-8 h-8 ${owned ? '' : 'opacity-35 grayscale'}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1">
                          {owned ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a5c] shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{owned ? r.name : 'Benda Belum Ditemukan'}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug">
                          {owned ? r.historyFact : 'Jelajahi lokasi ini untuk menemukannya.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vocabulary List */}
              {vocabUnlocked && (
                <div className="pt-2 border-t border-[#c99c4c]/40">
                  <p className="text-[11px] font-bold text-[#0e5a5c] mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Kosakata Baru:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {loc.infoBoard.vocabulary.map((v) => (
                      <div key={v.word} className="text-[11px] bg-white/80 p-2 rounded-lg border border-[#c99c4c]/40">
                        <strong>{v.word}:</strong> {v.meaning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function BadgesModal({ progress, onClose }: { progress: PlayerProgress; onClose: () => void }) {
  return (
    <ModalShell title={`Koleksi Lencana Petualang (${progress.badges.length}/6)`} onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-3">
        {BADGES.map((badge) => {
          const earned = progress.badges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                earned
                  ? 'bg-white border-[#d4941e]'
                  : 'bg-[#e6dfd2] border-[#c5baa6] opacity-75'
              }`}
            >
              <LocationBadgeEmblem
                badgeId={badge.id}
                earned={earned}
                className="w-12 h-12 shrink-0"
              />
              <div>
                <h3 className="font-display font-bold text-sm text-[#261c15]">{badge.title}</h3>
                <p className="text-xs text-[#4e3b2d] mt-0.5 leading-snug">{badge.description}</p>
                <p className="text-[11px] font-bold mt-1.5 text-[#0e5a5c]">
                  {earned ? 'Sudah Diraih' : 'Selesaikan tantangan lokasi terkait'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
