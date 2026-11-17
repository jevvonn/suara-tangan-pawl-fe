/**
 * In-memory dummy database used until the backend API is ready.
 * Data resets on every page reload.
 *
 * When the API is available, delete this file and replace the bodies of the
 * service functions in this folder with real `fetch` calls.
 */
import type { EducationNews, Letter, User } from '@/lib/api/types'
import signA from '@/assets/signs/bisindo/a.webp'
import signH from '@/assets/signs/bisindo/h.webp'
import signL from '@/assets/signs/bisindo/l.webp'
import signO from '@/assets/signs/bisindo/o.webp'

/** Simulates network latency so loading states are visible. */
export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function now() {
  return new Date().toISOString()
}

/** Dummy "upload": keeps the file in the browser and returns a URL for it. */
export function uploadFile(file: File) {
  return URL.createObjectURL(file)
}

/** Frees a URL created by `uploadFile`; bundled asset URLs are left alone. */
export function releaseFile(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

const letters: Letter[] = [
  { id: 'ltr_h', symbol: 'H', imageUrl: signH, createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  { id: 'ltr_a', symbol: 'A', imageUrl: signA, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: 'ltr_l', symbol: 'L', imageUrl: signL, createdAt: daysAgo(6), updatedAt: daysAgo(6) },
  { id: 'ltr_o', symbol: 'O', imageUrl: signO, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
]

const users: User[] = [
  { id: 'usr_admin', name: 'Admin Suara Tangan', email: 'admin@example.com', role: 'admin', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'usr_dewi', name: 'Dewi Anggraini', email: 'dewi.anggraini@example.com', role: 'admin', createdAt: daysAgo(21), updatedAt: daysAgo(21) },
  { id: 'usr_fajar', name: 'Fajar Nugroho', email: 'fajar.nugroho@example.com', role: 'user', createdAt: daysAgo(14), updatedAt: daysAgo(14) },
  { id: 'usr_putri', name: 'Putri Ayu Lestari', email: 'putri.lestari@example.com', role: 'user', createdAt: daysAgo(9), updatedAt: daysAgo(9) },
  { id: 'usr_andi', name: 'Andi Saputra', email: 'andi.saputra@example.com', role: 'user', createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { id: 'usr_rina', name: 'Rina Wulandari', email: 'rina.wulandari@example.com', role: 'user', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
]

const educationNews: EducationNews[] = [
  {
    id: 'news_bisindo_sibi',
    title: 'Mengenal Perbedaan BISINDO dan SIBI',
    content:
      'BISINDO (Bahasa Isyarat Indonesia) tumbuh secara alami dari komunitas Tuli dan digunakan dalam percakapan sehari-hari. SIBI (Sistem Isyarat Bahasa Indonesia) disusun mengikuti tata bahasa Indonesia dan banyak dipakai di lingkungan pendidikan formal. Memahami keduanya membantu kita berkomunikasi lebih tepat sesuai konteks.',
    thumbnailUrl: null,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: 'news_abjad_jari',
    title: 'Belajar Abjad Jari BISINDO dari Huruf H, A, L, O',
    content:
      'Mulailah belajar bahasa isyarat dengan mengeja nama atau kata sapaan sederhana. Kata "HALO" adalah latihan yang menyenangkan untuk mengenal bentuk tangan huruf H, A, L, dan O dalam BISINDO.',
    thumbnailUrl: signH,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 'news_tips_komunikasi',
    title: 'Tips Berkomunikasi dengan Teman Tuli',
    content:
      'Tarik perhatian dengan melambaikan tangan atau menepuk bahu secara perlahan. Hadapkan wajah saat berbicara, bicaralah dengan jelas tanpa berlebihan, dan jangan menutupi mulut. Bila perlu, gunakan tulisan atau gestur untuk memperjelas pesan.',
    thumbnailUrl: null,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'news_hbii',
    title: 'Hari Bahasa Isyarat Internasional Diperingati Setiap 23 September',
    content:
      'Perserikatan Bangsa-Bangsa menetapkan 23 September sebagai Hari Bahasa Isyarat Internasional untuk meningkatkan kesadaran akan pentingnya bahasa isyarat dalam pemenuhan hak asasi penyandang Tuli.',
    thumbnailUrl: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

export const db = { letters, users, educationNews }
