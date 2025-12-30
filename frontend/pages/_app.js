import Head from 'next/head'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="icon" sizes="192x192" href="/favicon/android-chrome-192x192.png" />
        <link rel="icon" sizes="512x512" href="/favicon/android-chrome-512x512.png" />
        <style>{`
          :root{
            --theme-city: ${process.env.NEXT_PUBLIC_THEME_CITY || '#F9A825'};
            --theme-water: ${process.env.NEXT_PUBLIC_THEME_WATER || '#3B99D9'};
            --theme-transport: ${process.env.NEXT_PUBLIC_THEME_TRANSPORT || '#D32F2F'};
            --theme-greenspace: ${process.env.NEXT_PUBLIC_THEME_GREEN || '#388E3C'};
            --theme-bg: ${process.env.NEXT_PUBLIC_THEME_BG || '#FFFFFF'};
          }
        `}</style>
      </Head>
      <Header />
      <div style={{height: 6, background: 'linear-gradient(90deg, var(--theme-city), var(--theme-water), var(--theme-transport), var(--theme-greenspace))'}} className="w-full" />
      <div className="max-w-7xl mx-auto flex py-6 px-4 sm:px-6 lg:px-8">
        <aside className="w-64 bg-water/5 rounded-lg shadow-sm p-4">
          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50">
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50">
              <span className="text-lg">🗺️</span>
              <span>Map View</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50">
              <span className="text-lg">🎫</span>
              <span>Tickets</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50">
              <span className="text-lg">🤖</span>
              <span>AI Hub</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50">
              <span className="text-lg">📡</span>
              <span>IoT Sensors</span>
            </button>
          </nav>
        </aside>
        <main className="flex-1 px-6 pb-8">
          <Component {...pageProps} />
        </main>
      </div>
      <Footer />
    </>
  )
}