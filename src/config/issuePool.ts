export const ISSUE_POOL = {
  issues: [
    {
      id: 'UXR-01',
      category: 'Clarity & Messaging',
      title: 'Value Proposition Tidak Jelas',
      severity: 'high',
      description: 'User tidak langsung memahami produk ini untuk siapa dan manfaat utamanya.',
      why_it_matters: 'User biasanya memutuskan untuk lanjut atau keluar dalam 5–8 detik pertama.',
      recommendation: 'Perjelas headline dengan menyebut target user, masalah utama, dan outcome spesifik.',
      applicable_pages: ['landing'],
      paid_only: false
    },
    {
      id: 'UXR-02',
      category: 'Clarity & Messaging',
      title: 'Headline Terlalu Generik',
      severity: 'medium',
      description: 'Headline menggunakan istilah umum tanpa konteks yang membedakan produk.',
      why_it_matters: 'Headline generik tidak memberi alasan kuat bagi user untuk membaca lebih lanjut.',
      recommendation: 'Gunakan headline yang menyebut konteks spesifik atau use case utama.',
      applicable_pages: ['landing'],
      paid_only: false
    },
    {
      id: 'UXR-03',
      category: 'Clarity & Messaging',
      title: 'CTA Tidak Spesifik',
      severity: 'medium',
      description: 'CTA tidak menjelaskan apa yang akan terjadi setelah diklik.',
      why_it_matters: 'CTA yang ambigu menurunkan kejelasan dan motivasi user.',
      recommendation: "Gunakan CTA berbasis outcome, misalnya 'Audit UX Landing Page Ini'.",
      applicable_pages: ['landing', 'dashboard', 'app'],
      paid_only: false
    },
    {
      id: 'UXR-04',
      category: 'Clarity & Messaging',
      title: 'Terlalu Banyak Pesan di Above the Fold',
      severity: 'medium',
      description: 'Bagian atas halaman memuat terlalu banyak informasi sekaligus.',
      why_it_matters: 'Terlalu banyak pesan membuat user sulit menentukan fokus.',
      recommendation: 'Prioritaskan satu pesan utama dan satu CTA di atas.',
      applicable_pages: ['landing'],
      paid_only: false
    },
    {
      id: 'UXR-05',
      category: 'Conversion & Flow',
      title: 'Visual Hierarchy Tidak Jelas',
      severity: 'high',
      description: 'Elemen utama tidak menonjol dibanding elemen lainnya.',
      why_it_matters: 'User tidak tahu bagian mana yang harus diperhatikan atau diklik.',
      recommendation: 'Perkuat hierarchy dengan ukuran, kontras, dan spacing.',
      applicable_pages: ['landing', 'dashboard', 'app'],
      paid_only: false
    },
    {
      id: 'UXR-06',
      category: 'Conversion & Flow',
      title: 'Friction Terlalu Dini',
      severity: 'high',
      description: 'User diminta melakukan tindakan berat terlalu awal (login, form panjang).',
      why_it_matters: 'Friction awal meningkatkan bounce rate.',
      recommendation: 'Tunda login atau form sampai user melihat value awal.',
      applicable_pages: ['dashboard', 'app'],
      paid_only: false
    },
    {
      id: 'UXR-07',
      category: 'Conversion & Flow',
      title: 'Alur Tidak Menjawab Keraguan User',
      severity: 'medium',
      description: 'User tidak mendapatkan jawaban cepat atas pertanyaan penting.',
      why_it_matters: 'Keraguan yang tidak terjawab menghentikan konversi.',
      recommendation: 'Tambahkan FAQ singkat atau microcopy penenang.',
      applicable_pages: ['landing', 'dashboard'],
      paid_only: true
    },
    {
      id: 'UXR-08',
      category: 'Conversion & Flow',
      title: 'CTA Secondary Mengganggu CTA Utama',
      severity: 'low',
      description: 'Terlalu banyak CTA dengan bobot visual yang sama.',
      why_it_matters: 'Attention user terpecah.',
      recommendation: 'Bedakan CTA utama dan sekunder secara visual.',
      applicable_pages: ['landing'],
      paid_only: true
    },
    {
      id: 'UXR-09',
      category: 'Trust & Credibility',
      title: 'Kurang Trust Signal',
      severity: 'high',
      description: 'Tidak ada elemen yang membangun kepercayaan user.',
      why_it_matters: 'User ragu melanjutkan tanpa bukti kredibilitas.',
      recommendation: 'Tambahkan testimonial, logo klien, atau preview hasil.',
      applicable_pages: ['landing'],
      paid_only: true
    },
    {
      id: 'UXR-10',
      category: 'Trust & Credibility',
      title: 'Klaim Terlalu Besar Tanpa Bukti',
      severity: 'medium',
      description: "Klaim seperti 'AI-powered' tanpa penjelasan konkret.",
      why_it_matters: 'Klaim kosong menurunkan kepercayaan.',
      recommendation: 'Jelaskan secara singkat bagaimana AI membantu.',
      applicable_pages: ['landing'],
      paid_only: true
    },
    {
      id: 'UXR-11',
      category: 'Trust & Credibility',
      title: 'Tidak Ada Preview Output',
      severity: 'high',
      description: 'User tidak tahu hasil apa yang akan didapat.',
      why_it_matters: 'Ketidakpastian menurunkan konversi.',
      recommendation: 'Tampilkan contoh hasil audit atau potongan insight.',
      applicable_pages: ['landing'],
      paid_only: true
    },
    {
      id: 'UXR-12',
      category: 'Usability & Interaction',
      title: 'Density Konten Terlalu Tinggi',
      severity: 'medium',
      description: 'Terlalu banyak teks atau elemen dalam satu area.',
      why_it_matters: 'Meningkatkan cognitive load.',
      recommendation: 'Pecah konten menjadi section lebih kecil.',
      applicable_pages: ['dashboard', 'app'],
      paid_only: false
    },
    {
      id: 'UXR-13',
      category: 'Usability & Interaction',
      title: 'Visual Tidak Mendukung Tujuan',
      severity: 'low',
      description: 'Visual bersifat dekoratif tanpa fungsi.',
      why_it_matters: 'Visual yang tidak relevan mengganggu fokus.',
      recommendation: 'Gunakan visual yang menjelaskan flow atau fungsi.',
      applicable_pages: ['landing', 'app'],
      paid_only: true
    },
    {
      id: 'UXR-14',
      category: 'Usability & Interaction',
      title: 'Feedback Sistem Tidak Jelas',
      severity: 'medium',
      description: 'User tidak tahu apa yang sedang diproses sistem.',
      why_it_matters: 'Ketidakjelasan menimbulkan frustrasi.',
      recommendation: 'Tambahkan loading state dan status feedback.',
      applicable_pages: ['dashboard', 'app'],
      paid_only: false
    },
    {
      id: 'UXR-15',
      category: 'Retention & Reusability',
      title: 'Tidak Ada Alasan untuk Kembali',
      severity: 'high',
      description: 'Setelah selesai, user tidak terdorong untuk reuse.',
      why_it_matters: 'Produk menjadi one-time use.',
      recommendation: 'Tambahkan histori audit, reminder, atau insight lanjutan.',
      applicable_pages: ['dashboard'],
      paid_only: true
    }
  ]
} as const;

export const IssuePoolMapping = {
  landing: ['UXR-01', 'UXR-02', 'UXR-03', 'UXR-04', 'UXR-05', 'UXR-09', 'UXR-11'],
  dashboard: ['UXR-05', 'UXR-06', 'UXR-07', 'UXR-12', 'UXR-14', 'UXR-15'],
  app: ['UXR-06', 'UXR-08', 'UXR-12', 'UXR-13', 'UXR-14', 'UXR-15']
} as const;

export type IssueEntry = (typeof ISSUE_POOL.issues)[number];
export type IssueId = IssueEntry['id'];
export type IssueCategory = IssueEntry['category'];
export type IssueSeverity = IssueEntry['severity'];
