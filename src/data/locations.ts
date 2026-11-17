import { LocationConfig } from '../types/game';

export const LOCATIONS: LocationConfig[] = [
  {
    id: 'benteng-kuto-besak',
    order: 1,
    name: 'Benteng Kuto Besak',
    shortName: 'Benteng Kuto Besak',
    subtitle: 'Jalur Tropis & Air Terjun · Sejarah Kesultanan Palembang',
    backdropUrl: '/assets/aistudio/Vibrant_Jungle_Pathway_and_Waterfall-1_d59797cf.png',
    floorTheme: 'stone-courtyard',
    fogColor: '#bfe3c8',
    skyTopColor: '#2ea8e6',
    skyBottomColor: '#d7f3e3',
    mapCoords: [-7.5, 2.2],
    guidePos: [-3.2, -2.5],
    infoBoardPos: [3.4, -2.2],
    badgeId: 'badge-benteng',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Selamat datang di Benteng Kuto Besak! Benteng megah di tepi Sungai Musi ini mulai dibangun pada tahun 1780 oleh Sultan Mahmud Badaruddin I.',
          kikoReaction: 'Wah! Dinding batunya kokoh sekali ya, Kak!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Betul, Kiko! Uniknya, benteng ini merupakan satu-satunya keraton kesultanan di Indonesia yang dibangun sendiri oleh arsitek dan pekerja pribumi tanpa batu semen modern.',
        },
        {
          speaker: 'Kak Arya',
          text: 'Ayo baca Papan Informasi untuk belajar kosakata baru, temukan 3 benda bersejarah tersembunyi di pelataran, lalu selesaikan tantangan menyusun paragraf deskripsi!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Benteng Kuto Besak',
      summary: 'Mengenal arsitektur keraton pertahanan Kesultanan Palembang Darussalam.',
      paragraphs: [
        'Benteng Kuto Besak terletak menghadap langsung ke Sungai Musi. Panjang benteng ini mencapai hampir 290 meter dengan tembok setinggi hampir 10 meter dan ketebalan sekitar 2 meter.',
        'Pada masa lalu, pekerja mencampur batu kapur, putih telur, dan pasir halus sebagai perekat dinding benteng. Benteng ini berfungsi sebagai pusat pemerintahan sekaligus pertahanan Kesultanan Palembang.',
      ],
      vocabulary: [
        {
          word: 'Keraton',
          meaning: 'Istana tempat kediaman raja atau sultan beserta pusat pemerintahan.',
          example: 'Benteng Kuto Besak dahulu menjadi keraton Kesultanan Palembang.',
        },
        {
          word: 'Bastion',
          meaning: 'Menara atau bagian sudut benteng yang menjorok keluar untuk pengintaian.',
          example: 'Meriam kuno ditempatkan di sudut bastion benteng.',
        },
        {
          word: 'Perekat',
          meaning: 'Bahan yang digunakan untuk menyatukan batu bata atau batu kapur.',
          example: 'Campuran batu kapur menjadi perekat alami yang sangat kuat.',
        },
      ],
    },
    relics: [
      {
        id: 'meriam-lela',
        name: 'Meriam Lela Kuno',
        shortDesc: 'Meriam perunggu pertahanan sudut benteng.',
        historyFact: 'Meriam Lela digunakan prajurit Kesultanan Palembang untuk menjaga lalu lintas kapal di Sungai Musi.',
        iconType: 'cannon',
        position: [-7.2, 2.8],
      },
      {
        id: 'kunci-gerbang',
        name: 'Kunci Gerbang Besi',
        shortDesc: 'Kunci tempa berat gerbang utama keraton.',
        historyFact: 'Gerbang utama Benteng Kuto Besak dikunci setiap malam demi keamanan lingkungan keraton.',
        iconType: 'key',
        position: [0.5, 4.6],
      },
      {
        id: 'batu-kapur',
        name: 'Batu Kapur Perekat',
        shortDesc: 'Contoh bongkahan kapur putih perekat dinding.',
        historyFact: 'Batu kapur dicampur putih telur menghasilkan adonan perekat yang tahan air sungai.',
        iconType: 'stone',
        position: [7.4, 2.2],
      },
    ],
    miniGame: {
      type: 'paragraph-order',
      title: 'Susun Paragraf Deskripsi Benteng Kuto Besak',
      instruction: 'Urutkan 4 kalimat di bawah ini dari nomor 1 sampai 4 agar menjadi paragraf deskripsi yang runtut dan padu!',
      sentences: [
        {
          id: 'bkb-1',
          text: 'Benteng Kuto Besak adalah bangunan bersejarah peninggalan Kesultanan Palembang di tepi Sungai Musi.',
          correctOrder: 1,
        },
        {
          id: 'bkb-2',
          text: 'Dinding benteng ini sangat tebal dan kokoh karena dibuat dari susunan batu bata serta perekat batu kapur.',
          correctOrder: 2,
        },
        {
          id: 'bkb-3',
          text: 'Di setiap sudut dindingnya terdapat bastion pengintai dan meriam kuno yang mengarah ke sungai.',
          correctOrder: 3,
        },
        {
          id: 'bkb-4',
          text: 'Kini, pelataran Benteng Kuto Besak menjadi tempat wisata sejarah kebanggaan warga Sumatera Selatan.',
          correctOrder: 4,
        },
      ],
    },
  },
  {
    id: 'museum-smb2',
    order: 2,
    name: 'Museum Sultan Mahmud Badaruddin II',
    shortName: 'Museum SMB II',
    subtitle: 'Pelataran Rumah Adat Palembang · Koleksi Kerajaan & Kesultanan',
    backdropUrl: '/assets/aistudio/Palembang_Heritage_House_Courtyard-6_815b8035.png',
    floorTheme: 'heritage-terracotta',
    fogColor: '#d9ebdc',
    skyTopColor: '#2998ea',
    skyBottomColor: '#d7f0fb',
    mapCoords: [-4.5, 0.8],
    guidePos: [-3.5, -2.2],
    infoBoardPos: [3.6, -2.0],
    badgeId: 'badge-museum',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Kita sekarang berada di Museum Sultan Mahmud Badaruddin II! Bangunan berarsitektur tradisional Palembang ini berdiri tepat di sebelah Benteng Kuto Besak.',
          kikoReaction: 'Kiko dengar di dalam sini banyak arca dan kain emas yang indah!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Tepat sekali! Museum ini menyimpan ribuan koleksi, mulai dari arca zaman Sriwijaya, koin kuno Pitis, hingga kain Songket Palembang yang berkilau.',
        },
        {
          speaker: 'Kak Arya',
          text: 'Jangan lupa pelajari papan informasi, kumpulkan 3 artefak di halaman museum, dan pecahkan tantangan mencocokkan koleksi serta mencari ide pokok!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Museum SMB II',
      summary: 'Rumah penyimpanan ratusan artefak bersejarah dari masa Sriwijaya hingga Kesultanan.',
      paragraphs: [
        'Museum Sultan Mahmud Badaruddin II menyimpan benda-benda bernilai sejarah tinggi. Salah satu koleksinya adalah kain Songket Lepus yang ditenun menggunakan benang emas asli.',
        'Selain kain adat, terdapat pula replika arca batu dari masa Kerajaan Sriwijaya dan mata uang logam bernama Pitis yang dahulu digunakan untuk berdagang di pasar terapung Sungai Musi.',
      ],
      vocabulary: [
        {
          word: 'Artefak',
          meaning: 'Benda buatan manusia di masa lampau yang memiliki nilai sejarah.',
          example: 'Museum menjaga artefak kuno agar dapat dipelajari generasi muda.',
        },
        {
          word: 'Kurator',
          meaning: 'Petugas ahli yang merawat, meneliti, dan menata koleksi museum.',
          example: 'Kurator museum mencatat asal-usul setiap koin Pitis.',
        },
        {
          word: 'Replika',
          meaning: 'Tiruan benda bersejarah yang dibuat semirip mungkin dengan aslinya.',
          example: 'Pengunjung dapat melihat replika arca Sriwijaya dari dekat.',
        },
      ],
    },
    relics: [
      {
        id: 'songket-lepus',
        name: 'Kain Songket Lepus',
        shortDesc: 'Kain tenun sutra berhias benang emas Palembang.',
        historyFact: 'Motif Lepus berarti "menutupi", menandakan hampir seluruh kain dipenuhi sulaman benang emas.',
        iconType: 'songket',
        position: [-6.8, 3.4],
      },
      {
        id: 'arca-sriwijaya',
        name: 'Replika Arca Sriwijaya',
        shortDesc: 'Patung batu warisan seni pahat era Sriwijaya.',
        historyFact: 'Arca batu menunjukkan tingginya keterampilan seni pahat masyarakat Sriwijaya abad ke-8.',
        iconType: 'statue',
        position: [1.0, 5.0],
      },
      {
        id: 'koin-pitis',
        name: 'Koin Pitis Palembang',
        shortDesc: 'Uang logam timah berlubang khas Kesultanan.',
        historyFact: 'Koin Pitis terbuat dari campuran timah dan biasa diikat dengan tali rotan saat berbelanja.',
        iconType: 'coin',
        position: [7.0, 2.8],
      },
    ],
    miniGame: {
      type: 'match-and-main-idea',
      title: 'Kurator Museum & Ide Pokok Bacaan',
      instruction: 'Langkah 1: Pasangkan 3 benda koleksi museum dengan keterangannya. Langkah 2: Pilih ide pokok bacaan yang paling tepat!',
      pairs: [
        {
          id: 'songket',
          itemName: 'Kain Songket Lepus',
          description: 'Kain tenun tradisional Palembang bermotif penuh benang emas.',
        },
        {
          id: 'arca',
          itemName: 'Replika Arca Sriwijaya',
          description: 'Tiruan patung batu peninggalan peradaban maritim abad ke-8.',
        },
        {
          id: 'pitis',
          itemName: 'Koin Pitis Palembang',
          description: 'Mata uang logam timah berlubang yang dipakai pada masa Kesultanan.',
        },
      ],
      readingTitle: 'Kejayaan Kain Songket Palembang',
      readingPassage:
        'Kain Songket Palembang merupakan warisan budaya yang sangat dibanggakan masyarakat Sumatera Selatan. Kain ini dibuat dengan teknik tenun tradisional menggunakan benang sutra dan benang emas. Dahulu, songket hanya dikenakan oleh keluarga kerajaan dan bangsawan pada upacara adat penting.',
      question: 'Apa ide pokok dari paragraf bacaan di atas?',
      options: [
        {
          id: 'opt-a',
          text: 'Kain Songket Palembang adalah warisan budaya berbenang sutra dan emas kebanggaan Sumatera Selatan.',
          isCorrect: true,
        },
        {
          id: 'opt-b',
          text: 'Benang emas lebih mahal daripada benang kapas biasa.',
          isCorrect: false,
        },
        {
          id: 'opt-c',
          text: 'Semua warga Palembang wajib menenun kain setiap hari Minggu.',
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 'jembatan-ampera',
    order: 3,
    name: 'Jembatan Ampera & Sungai Musi',
    shortName: 'Jembatan Ampera',
    subtitle: 'Tepi Sungai Musi · Ikon Kota Palembang (Pemandu: Kak Arya)',
    backdropUrl: '/assets/aistudio/Vibrant_Musi_Riverfront_and_Ampera_Bridge-2_08919466.png',
    floorTheme: 'musi-boardwalk',
    fogColor: '#cbe6f7',
    skyTopColor: '#1f94ee',
    skyBottomColor: '#d2ecfc',
    mapCoords: [-0.8, 0.2],
    guidePos: [-3.0, -2.0],
    infoBoardPos: [3.4, -2.0],
    badgeId: 'badge-ampera',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Selamat datang di tepi Sungai Musi! Di hadapan kita berdiri gagah Jembatan Ampera yang menghubungkan wilayah Seberang Ulu dan Seberang Ilir.',
          kikoReaction: 'Kiko suka melihat perahu ketek melintas di bawah menara merahnya, Kak!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Nama Ampera berasal dari singkatan Amanat Penderitaan Rakyat. Jembatan ini diresmikan pada tahun 1965 dan sempat memiliki bagian tengah yang bisa terangkat agar kapal besar bisa lewat!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Ayo baca Papan Informasi dermaga, cari 3 benda pelayaran di sepanjang tepi sungai, lalu susun kalimat efektif pola S-P-O-K bersama Kak Arya!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Jembatan Ampera & Sungai Musi',
      summary: 'Simbol persatuan Seberang Ulu dan Ilir yang melintasi Sungai Musi.',
      paragraphs: [
        'Sungai Musi memiliki panjang sekitar 750 kilometer dan membelah Kota Palembang menjadi dua bagian. Sebelum Jembatan Ampera berdiri, penduduk menyeberang menggunakan perahu sampan atau perahu ketek.',
        'Jembatan Ampera memiliki dua menara kembar berwarna merah cerah setinggi 63 meter. Setiap hari, perahu ketek bermesin melintasi bawah jembatan sambil membawa hasil bumi dan wisatawan.',
      ],
      vocabulary: [
        {
          word: 'Perahu Ketek',
          meaning: 'Perahu kayu bermotor khas Sungai Musi yang bersuara "ketek-ketek".',
          example: 'Wisatawan menaiki perahu ketek menyusuri tepian Sungai Musi.',
        },
        {
          word: 'Kalimat Efektif',
          meaning: 'Kalimat yang disusun sesuai kaidah S-P-O-K sehingga mudah dipahami.',
          example: 'Petualang memotret Jembatan Ampera pada sore hari.',
        },
        {
          word: 'Dermaga',
          meaning: 'Tepi sungai atau pelabuhan kayu tempat perahu bersandar.',
          example: 'Perahu ketek merapat dengan rapi di dermaga.',
        },
      ],
    },
    relics: [
      {
        id: 'kompas-pelayar',
        name: 'Kompas Pelayar Musi',
        shortDesc: 'Kompas kuningan penunjuk arah perahu sungai.',
        historyFact: 'Pelayar Sungai Musi dahulu mengandalkan kompas dan arah arus pasang surut saat berlayar malam.',
        iconType: 'compass',
        position: [-7.0, 2.4],
      },
      {
        id: 'miniatur-ketek',
        name: 'Miniatur Perahu Ketek',
        shortDesc: 'Ukiran kayu perahu tradisional bermotor khas Musi.',
        historyFact: 'Nama "ketek" diambil dari bunyi mesin perahu yang berdetak ketek-ketek saat membelah air.',
        iconType: 'boat',
        position: [0.0, 4.4],
      },
      {
        id: 'lencana-menara',
        name: 'Lencana Menara Merah',
        shortDesc: 'Pin peringatan peresmian Menara Kembar Ampera.',
        historyFact: 'Warna Jembatan Ampera sempat berubah dari abu-abu, kuning, hingga akhirnya merah ikonik.',
        iconType: 'badge',
        position: [7.2, 2.6],
      },
    ],
    miniGame: {
      type: 'effective-sentence',
      title: 'Susun Kalimat Efektif & Kisah Menara Kembar',
      instruction: 'Langkah 1: Susun kartu kata menjadi kalimat efektif berpola S-P-O-K. Langkah 2: Jawab pertanyaan bacaan!',
      wordTokens: ['menyusuri', 'dengan perahu ketek', 'Siswa kelas lima', 'Sungai Musi', 'pada pagi hari'],
      correctSentence: 'Siswa kelas lima menyusuri Sungai Musi dengan perahu ketek pada pagi hari',
      hintSpok: 'Petunjuk pola: [Subjek] + [Predikat] + [Objek] + [Keterangan Alat] + [Keterangan Waktu]',
      readingTitle: 'Keistimewaan Menara Kembar Ampera',
      readingPassage:
        'Ketika pertama kali beroperasi pada tahun 1965, bagian tengah Jembatan Ampera dapat diangkat naik setinggi 10 meter menggunakan bandul pemberat di dalam kedua menara kembarnya. Hal itu dilakukan supaya kapal dagang berukuran besar dapat berlayar melewati Sungai Musi tanpa tersangkut.',
      question: 'Mengapa bagian tengah Jembatan Ampera dahulu dirancang agar bisa terangkat?',
      options: [
        {
          id: 'amp-a',
          text: 'Agar kapal dagang berukuran besar bisa melintas di Sungai Musi dengan aman.',
          isCorrect: true,
        },
        {
          id: 'amp-b',
          text: 'Supaya kendaraan roda empat dapat melompat ke seberang sungai.',
          isCorrect: false,
        },
        {
          id: 'amp-c',
          text: 'Untuk menjemur hasil tangkapan ikan nelayan di atas menara.',
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 'pulau-kemaro',
    order: 4,
    name: 'Pulau Kemaro',
    shortName: 'Pulau Kemaro',
    subtitle: 'Jembatan Kayu Rawa & Danau Teratai · Fakta dan Legenda',
    backdropUrl: '/assets/aistudio/South_Sumatran_Wetland_Boardwalk-5_40fbae4a.png',
    floorTheme: 'swamp-lotus',
    fogColor: '#e4ecd3',
    skyTopColor: '#56b7e8',
    skyBottomColor: '#fbe4b8',
    mapCoords: [2.8, -0.5],
    guidePos: [-3.2, -2.4],
    infoBoardPos: [3.2, -2.2],
    badgeId: 'badge-kemaro',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Selamat datang di Pulau Kemaro! Pulau kecil di tengah Sungai Musi ini tidak pernah tenggelam meskipun air sungai pasang tinggi, sehingga disebut Pulau Kemaro atau kemarau.',
          kikoReaction: 'Lihat Pagoda sembilan lantainya menjulang tinggi di tepi kolam teratai!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Di sini kita akan belajar membedakan mana Fakta Sejarah dan mana Cerita Legenda dari kisah putri Siti Fatimah dan pangeran Tan Bun An.',
        },
        {
          speaker: 'Kak Arya',
          text: 'Baca Papan Informasi di jembatan kayu, temukan 3 benda peninggalan, lalu urutkan kisah legenda Pulau Kemaro dengan tepat!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Pulau Kemaro',
      summary: 'Memahami perbedaan fakta geografi dan legenda rakyat Siti Fatimah.',
      paragraphs: [
        'Secara geografis, Pulau Kemaro adalah delta sungai yang berjarak sekitar 6 kilometer dari Jembatan Ampera. Di pulau ini berdiri Pagoda Hok Tjing Rio berlantai sembilan yang dibangun pada tahun 2006.',
        'Menurut cerita rakyat, Pulau Kemaro berasal dari kisah cinta Putri Siti Fatimah dan saudagar Tan Bun An. Ketika guci hadiah ternyata berisi emas di balik sawi asin, Tan Bun An terjun ke sungai dan Siti Fatimah menyusulnya.',
      ],
      vocabulary: [
        {
          word: 'Fakta',
          meaning: 'Kenyataan atau peristiwa yang benar-benar terjadi dan dapat dibuktikan.',
          example: 'Pagoda Pulau Kemaro memiliki sembilan tingkat adalah sebuah fakta.',
        },
        {
          word: 'Legenda',
          meaning: 'Cerita rakyat zaman dahulu yang berkaitan dengan asal-usul suatu tempat.',
          example: 'Kisah Siti Fatimah dan Tan Bun An merupakan legenda Pulau Kemaro.',
        },
        {
          word: 'Delta',
          meaning: 'Endapan tanah di tengah atau muara sungai yang membentuk daratan.',
          example: 'Pulau Kemaro terbentuk sebagai delta subur di Sungai Musi.',
        },
      ],
    },
    relics: [
      {
        id: 'guci-keramik',
        name: 'Guci Keramik Hias',
        shortDesc: 'Guci porselen antik berlukis motif naga dan bunga.',
        historyFact: 'Dalam legenda, sembilan guci hadiah dari negeri Tiongkok menyimpan emas di dasar sawi asin.',
        iconType: 'jar',
        position: [-6.8, 3.0],
      },
      {
        id: 'lentera-pagoda',
        name: 'Lentera Merah Pagoda',
        shortDesc: 'Lampion merah penghias serambi Pagoda sembilan tingkat.',
        historyFact: 'Pagoda berlantai sembilan melambangkan keharmonisan budaya Nusantara dan Tionghoa di Palembang.',
        iconType: 'lantern',
        position: [0.4, 4.8],
      },
      {
        id: 'prasasti-pohon',
        name: 'Prasasti Pohon Cinta',
        shortDesc: 'Papan ukir kisah di dekat Pohon Cinta Pulau Kemaro.',
        historyFact: 'Pohon Cinta yang rimbun di Pulau Kemaro sering menjadi tempat berteduh para peziarah dan pelancong.',
        iconType: 'tablet',
        position: [6.8, 2.4],
      },
    ],
    miniGame: {
      type: 'fact-vs-legend',
      title: 'Fakta vs. Legenda & Alur Kisah Pulau Kemaro',
      instruction: 'Langkah 1: Pilah pernyataan Fakta dan Legenda serta pilih tokoh utamanya. Langkah 2: Urutkan kisah Pulau Kemaro!',
      statements: [
        {
          id: 'fl-1',
          text: 'Pulau Kemaro berada di tengah Sungai Musi sekitar 6 km dari Jembatan Ampera.',
          category: 'fakta',
        },
        {
          id: 'fl-2',
          text: 'Timbunan tanah tempat Siti Fatimah dan Tan Bun An menghilang berubah menjadi pulau yang tak pernah terendam.',
          category: 'legenda',
        },
        {
          id: 'fl-3',
          text: 'Pagoda di Pulau Kemaro memiliki 9 lantai dan berdiri kokoh menghadap sungai.',
          category: 'fakta',
        },
      ],
      characterQuestion: {
        prompt: 'Siapakah dua tokoh utama dalam legenda asal-usul Pulau Kemaro?',
        options: [
          'Putri Siti Fatimah dan Pangeran Tan Bun An',
          'Sultan Mahmud Badaruddin II dan Ratu Sinar',
          'Si Kiko dan Raja Balaputradewa',
        ],
        correct: 'Putri Siti Fatimah dan Pangeran Tan Bun An',
      },
      storyOrder: [
        {
          id: 'km-1',
          text: 'Pangeran Tan Bun An meminang Putri Siti Fatimah dari Kerajaan Palembang dan meminta hadiah sembilan guci kepada orang tuanya.',
          correctOrder: 1,
        },
        {
          id: 'km-2',
          text: 'Saat guci dibuka di atas kapal, bagian atasnya tampak hanya berisi sayuran sawi asin sehingga Tan Bun An kecewa dan membuangnya ke sungai.',
          correctOrder: 2,
        },
        {
          id: 'km-3',
          text: 'Guci terakhir pecah di geladak dan terlihatlah batangan emas berkilauan di bagian dasar guci.',
          correctOrder: 3,
        },
        {
          id: 'km-4',
          text: 'Tan Bun An melompat ke Sungai Musi untuk mengambil emas, diikuti Siti Fatimah, lalu di tempat itu muncul daratan Pulau Kemaro.',
          correctOrder: 4,
        },
      ],
    },
  },
  {
    id: 'rumah-limas',
    order: 5,
    name: 'Rumah Limas Palembang',
    shortName: 'Rumah Limas',
    subtitle: 'Taman Desa Rumah Adat Sumatera · Kosakata & Teks Pengamatan',
    backdropUrl: '/assets/aistudio/Vibrant_Sumatra_Village_Garden_Scene-3_498fa8d8.png',
    floorTheme: 'village-garden',
    fogColor: '#d7ebc9',
    skyTopColor: '#2a9ae8',
    skyBottomColor: '#d8f1fa',
    mapCoords: [-2.2, -3.2],
    guidePos: [-3.4, -2.2],
    infoBoardPos: [3.4, -2.2],
    badgeId: 'badge-limas',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Pernahkah kamu melihat gambar rumah adat di uang pecahan sepuluh ribu rupiah? Itulah Rumah Limas khas Sumatera Selatan!',
          kikoReaction: 'Atapnya berbentuk limas dengan hiasan tanduk melengkung yang indah, Kak!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Benar, Kiko! Rumah panggung ini dibangun dari kayu Unglen yang tahan air selama ratusan tahun dan lantainya bertingkat-tingkat yang disebut Kekijing.',
        },
        {
          speaker: 'Kak Arya',
          text: 'Mari pelajari 4 kosakata arsitektur penting di Papan Informasi, temukan 3 benda kerajinan di taman, dan susun teks pengamatan Rumah Limas!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Arsitektur Rumah Limas',
      summary: 'Mengenal rumah panggung tradisional Sumatera Selatan yang sarat makna musyawarah.',
      paragraphs: [
        'Rumah Limas adalah rumah panggung kayu bertingkat yang lantainya memiliki beberapa tingkatan (Kekijing). Setiap tingkatan melambangkan penghormatan terhadap tamu, keluarga, dan sesepuh adat.',
        'Atap rumah dihiasi ornamen Simbar di puncaknya dan dibangun menggunakan Kayu Unglen atau kayu ulin yang sangat keras dan tidak mudah lapuk oleh air maupun rayap.',
      ],
      vocabulary: [
        {
          word: 'Kekijing',
          meaning: 'Lantai bertingkat pada Rumah Limas yang membagi ruang tamu dan upacara.',
          example: 'Para tamu kehormatan duduk di tingkat kekijing paling atas.',
        },
        {
          word: 'Simbar',
          meaning: 'Hiasan ukiran melengkung menyerupai tanduk di puncak bubungan atap.',
          example: 'Ukiran simbar memperindah siluet atap Rumah Limas.',
        },
        {
          word: 'Rumah Panggung',
          meaning: 'Rumah yang ditopang tiang-tiang tinggi agar aman dari banjir pasang sungai.',
          example: 'Rumah panggung Palembang terasa sejuk karena udara mengalir dari bawah.',
        },
        {
          word: 'Kayu Unglen',
          meaning: 'Kayu besi khas Sumatera yang sangat awet, tahan air, dan anti rayap.',
          example: 'Tiang penyangga Rumah Limas dibuat dari kayu unglen pilihan.',
        },
      ],
    },
    relics: [
      {
        id: 'ukiran-lak',
        name: 'Panel Ukiran Lak Emas',
        shortDesc: 'Ukiran kayu bermotif bunga teratai berlapis cat lak emas.',
        historyFact: 'Seni ukir Lak khas Palembang memadukan motif flora Nusantara dengan kilau warna keemasan.',
        iconType: 'lacquer',
        position: [-6.6, 3.2],
      },
      {
        id: 'kayu-unglen',
        name: 'Contoh Kayu Unglen',
        shortDesc: 'Potongan kayu besi Sumatera yang keras dan berat.',
        historyFact: 'Semakin sering terkena air, kayu Unglen justru semakin keras membatu sehingga cocok untuk rumah panggung.',
        iconType: 'wood',
        position: [0.2, 4.6],
      },
      {
        id: 'miniatur-simbar',
        name: 'Miniatur Hiasan Simbar',
        shortDesc: 'Model hiasan tanduk melati di ujung atap Rumah Limas.',
        historyFact: 'Hiasan Simbar di bubungan atap melambangkan keagungan dan doa keselamatan bagi penghuni rumah.',
        iconType: 'spire',
        position: [7.0, 2.6],
      },
    ],
    miniGame: {
      type: 'vocab-and-observation',
      title: 'Kosakata Arsitektur & Teks Pengamatan Rumah Limas',
      instruction: 'Langkah 1: Pasangkan 4 kosakata Rumah Limas dengan artinya. Langkah 2: Urutkan teks laporan pengamatan!',
      vocabMatches: [
        {
          id: 'v-kekijing',
          word: 'Kekijing',
          definition: 'Tingkatan lantai berbeda tinggi yang membagi ruang tamu dan upacara adat.',
        },
        {
          id: 'v-simbar',
          word: 'Simbar',
          definition: 'Ornamen ukiran melengkung yang menghiasi puncak bubungan atap.',
        },
        {
          id: 'v-panggung',
          word: 'Rumah Panggung',
          definition: 'Bangunan bertiang tinggi untuk menghindari genangan air pasang sungai.',
        },
        {
          id: 'v-unglen',
          word: 'Kayu Unglen',
          definition: 'Kayu besi khas Sumatera yang kuat, tahan air, dan anti lapuk.',
        },
      ],
      observationOrder: [
        {
          id: 'obs-1',
          text: 'Pada hari Sabtu, siswa kelas 5 melakukan pengamatan langsung ke kompleks Rumah Limas Palembang.',
          correctOrder: 1,
        },
        {
          id: 'obs-2',
          text: 'Dari luar, tampak atap berbentuk limas dengan hiasan simbar serta tiang rumah panggung dari kayu unglen.',
          correctOrder: 2,
        },
        {
          id: 'obs-3',
          text: 'Ketika masuk ke ruang dalam, terlihat lantai bertingkat yang disebut kekijing dengan dinding berukir lak emas.',
          correctOrder: 3,
        },
        {
          id: 'obs-4',
          text: 'Berdasarkan pengamatan tersebut, Rumah Limas mencerminkan kearifan masyarakat Sumatera Selatan terhadap alam sungai.',
          correctOrder: 4,
        },
      ],
    },
  },
  {
    id: 'taman-purbakala',
    order: 6,
    name: 'Taman Purbakala Kerajaan Sriwijaya',
    shortName: 'Taman Sriwijaya',
    subtitle: 'Reruntuhan Candi Hutan Tropis · Warisan Kerajaan Maritim',
    backdropUrl: '/assets/aistudio/Jungle_Temple_Ruins_Adventure-4_e5999158.png',
    floorTheme: 'candi-ruins',
    fogColor: '#d5e6c5',
    skyTopColor: '#2ea3e8',
    skyBottomColor: '#d9f2f7',
    mapCoords: [4.2, 3.0],
    guidePos: [-3.2, -2.4],
    infoBoardPos: [3.6, -2.0],
    badgeId: 'badge-sriwijaya',
    guide: {
      speakerName: 'Kak Arya',
      guideId: 'arya',
      lines: [
        {
          speaker: 'Kak Arya',
          text: 'Kita telah sampai di destinasi terakhir: Taman Purbakala Kerajaan Sriwijaya! Di kawasan Karanganyar inilah jejak pusat kerajaan maritim terbesar Nusantara ditemukan.',
          kikoReaction: 'Prasasti Kedukan Bukit dan jalur kanal kuno ada di sini ya, Kak!',
        },
        {
          speaker: 'Kak Arya',
          text: 'Betul, Kiko! Sejak abad ke-7, Sriwijaya dikenal sebagai kerajaan maritim dan pusat pembelajaran bahasa Sanskerta serta pengetahuan di Asia Tenggara.',
        },
        {
          speaker: 'Kak Arya',
          text: 'Temukan 3 peninggalan terakhir di pelataran candi, baca informasi prasasti, lalu selesaikan Memory Match & Teka-Teki Sejarah Sriwijaya!',
        },
      ],
    },
    infoBoard: {
      title: 'Papan Informasi: Kerajaan Maritim Sriwijaya',
      summary: 'Menelusuri jejak kejayaan abad ke-7 melalui Prasasti Kedukan Bukit dan kanal kuno.',
      paragraphs: [
        'Taman Purbakala Kerajaan Sriwijaya menyimpan jaringan kanal kuno, pulau buatan, serta peninggalan bata candi yang membuktikan kecanggihan tata kota air pada masa lampau.',
        'Salah satu bukti tertulis terpenting adalah Prasasti Kedukan Bukit berangka tahun 682 Masehi yang ditulis dalam huruf Pallawa dan bahasa Melayu Kuno tentang perjalanan suci Dapunta Hyang.',
      ],
      vocabulary: [
        {
          word: 'Prasasti',
          meaning: 'Piagam atau tulisan sejarah yang dipahatkan pada batu atau lempeng logam.',
          example: 'Prasasti Kedukan Bukit mencatat berdirinya Kerajaan Sriwijaya.',
        },
        {
          word: 'Maritim',
          meaning: 'Hal yang berkaitan dengan laut, pelayaran, dan perdagangan kapal.',
          example: 'Sriwijaya menjadi kerajaan maritim yang disegani pelaut mancanegara.',
        },
        {
          word: 'Candi',
          meaning: 'Bangunan purbakala dari batu atau bata merah peninggalan masa lampau.',
          example: 'Reruntuhan bata candi dilestarikan di Taman Purbakala.',
        },
      ],
    },
    relics: [
      {
        id: 'prasasti-kedukan',
        name: 'Prasasti Kedukan Bukit',
        shortDesc: 'Batu bertulis tahun 682 M beraksara Pallawa.',
        historyFact: 'Prasasti Kedukan Bukit adalah salah satu bukti tertulis tertua dalam bahasa Melayu Kuno.',
        iconType: 'inscription',
        position: [-7.0, 3.0],
      },
      {
        id: 'bata-candi',
        name: 'Bata Candi Kuno',
        shortDesc: 'Batu bata merah berukuran besar buatan perajin kuno.',
        historyFact: 'Bata candi purba dicetak dari tanah liat Sungai Musi dan dibakar padat agar tahan ratusan tahun.',
        iconType: 'brick',
        position: [0.6, 4.8],
      },
      {
        id: 'kapal-jung',
        name: 'Model Kapal Jung Sriwijaya',
        shortDesc: 'Miniatur kapal layar kayu besar pelaut Sriwijaya.',
        historyFact: 'Kapal jung Nusantara mampu berlayar jauh mengarungi Selat Malaka hingga Samudra Hindia.',
        iconType: 'ship',
        position: [6.8, 2.8],
      },
    ],
    miniGame: {
      type: 'memory-and-riddle',
      title: 'Memory Match Warisan Sumsel & Teka-Teki Sriwijaya',
      instruction: 'Langkah 1: Cocokkan semua pasangan kartu warisan Sumatera Selatan! Langkah 2: Jawab 3 teka-teki sejarah Sriwijaya!',
      memoryPairs: [
        { id: 'm1', title: 'Benteng Kuto Besak', clue: 'Keraton tepi Musi' },
        { id: 'm2', title: 'Jembatan Ampera', clue: 'Menara Kembar Merah' },
        { id: 'm3', title: 'Kain Songket', clue: 'Tenun benang emas' },
        { id: 'm4', title: 'Pulau Kemaro', clue: 'Pagoda 9 lantai' },
        { id: 'm5', title: 'Rumah Limas', clue: 'Lantai Kekijing' },
        { id: 'm6', title: 'Kedukan Bukit', clue: 'Prasasti 682 M' },
      ],
      riddles: [
        {
          id: 'rid-1',
          question: 'Pada abad ke-7 hingga ke-12, Sriwijaya dikenal luas di Asia Tenggara sebagai kerajaan ...',
          options: ['Maritim dan pusat perdagangan laut', 'Kerajaan padang pasir', 'Kerajaan gunung es'],
          correctIndex: 0,
        },
        {
          id: 'rid-2',
          question: 'Prasasti Kedukan Bukit tahun 682 Masehi dipahatkan menggunakan aksara Pallawa dalam bahasa ...',
          options: ['Bahasa Inggris Kuno', 'Bahasa Melayu Kuno', 'Bahasa Yunani'],
          correctIndex: 1,
        },
        {
          id: 'rid-3',
          question: 'Apa bukti kecanggihan tata kota di Taman Purbakala Kerajaan Sriwijaya?',
          options: [
            'Jaringan kanal air kuno yang saling terhubung',
            'Rel kereta cepat bawah tanah',
            'Menara kaca pencakar langit',
          ],
          correctIndex: 0,
        },
      ],
    },
  },
];
