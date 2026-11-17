import { BadgeConfig } from '../types/game';

export const BADGES: BadgeConfig[] = [
  {
    id: 'badge-benteng',
    locationId: 'benteng-kuto-besak',
    title: 'Penjaga Benteng Kuto',
    description: 'Berhasil menyusun paragraf deskripsi bersejarah dan menjelajahi Benteng Kuto Besak.',
    accentColor: '#B93829',
  },
  {
    id: 'badge-museum',
    locationId: 'museum-smb2',
    title: 'Kurator Cilik SMB II',
    description: 'Menguasai pencocokan benda koleksi museum dan menemukan ide pokok bacaan.',
    accentColor: '#D4941E',
  },
  {
    id: 'badge-ampera',
    locationId: 'jembatan-ampera',
    title: 'Navigator Sungai Musi',
    description: 'Menyusun kalimat efektif berpola S-P-O-K serta memahami kisah Menara Kembar Ampera.',
    accentColor: '#C84B31',
  },
  {
    id: 'badge-kemaro',
    locationId: 'pulau-kemaro',
    title: 'Penutur Legenda Kemaro',
    description: 'Cermat membedakan fakta sejarah dan cerita legenda serta mengurutkan kisahnya.',
    accentColor: '#0E5A5C',
  },
  {
    id: 'badge-limas',
    locationId: 'rumah-limas',
    title: 'Arsitek Rumah Limas',
    description: 'Memahami kosakata arsitektur Palembang dan menyusun teks deskripsi pengamatan.',
    accentColor: '#8B5A2B',
  },
  {
    id: 'badge-sriwijaya',
    locationId: 'taman-purbakala',
    title: 'Penjelajah Agung Sriwijaya',
    description: 'Menuntaskan seluruh warisan Sriwijaya dan teka-teki sejarah maritim Nusantara.',
    accentColor: '#1E6B52',
  },
];

export const COMPETENCIES_MASTERED: { title: string; detail: string }[] = [
  {
    title: '1. Menyusun Paragraf Deskripsi',
    detail: 'Merangkai kalimat deskriptif secara runtut dari gambaran umum ke bagian khusus.',
  },
  {
    title: '2. Menentukan Ide Pokok Bacaan',
    detail: 'Menemukan gagasan utama dalam setiap paragraf teks sejarah museum.',
  },
  {
    title: '3. Memahami Informasi Visual & Artefak',
    detail: 'Menghubungkan benda bersejarah dengan keterangan fungsi dan zamannya.',
  },
  {
    title: '4. Menyusun Kalimat Efektif (S-P-O-K)',
    detail: 'Merakit kata menjadi kalimat baku yang jelas dengan Subjek, Predikat, Objek, dan Keterangan.',
  },
  {
    title: '5. Pemahaman Bacaan Nonfiksi',
    detail: 'Menggali fakta sejarah pembangunan Jembatan Ampera dari teks bacaan.',
  },
  {
    title: '6. Membedakan Fakta dan Legenda',
    detail: 'Memilah kenyataan sejarah dari cerita rakyat serta mengidentifikasi tokoh utamanya.',
  },
  {
    title: '7. Menguasai Kosakata Daerah & Baku',
    detail: 'Mengenal istilah budaya seperti Kekijing, Simbar, Kayu Unglen, dan Prasasti.',
  },
  {
    title: '8. Menyusun Teks Pengamatan',
    detail: 'Mengurutkan laporan hasil pengamatan tempat bersejarah dengan runtut dan teliti.',
  },
];
