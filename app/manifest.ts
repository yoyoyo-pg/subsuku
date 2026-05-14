import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Subsuku',
    short_name: 'Subsuku',
    description: '月々のサブスクリプション支出を一覧管理・可視化',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
