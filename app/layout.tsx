import { Inter } from 'next/font/google'
import './globals.css'
import Layout from './components/Layout'
import Footer from './components/Footer'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '未来图方 - 一站式图像处理工具 | futurepicture.help',
  description: '未来图方是一个强大的在线图像处理工具，提供格式转换、裁剪、调整大小、压缩、滤镜、SVG生成器和AI Logo设计等功能。轻松处理您的图片需求。',
  keywords: '图像处理, 格式转换, 图片裁剪, 图片压缩, AI Logo设计, SVG生成器',
  icons: [
    { rel: 'icon', url: '/images/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/images/android-chrome-512x512.png' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Layout>{children}</Layout>
        <Footer />
      </body>
    </html>
  )
}
