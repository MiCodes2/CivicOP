import { useRouter } from 'next/router'
import React from 'react'
import Head from 'next/head'
import Link from 'next/link';
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isGovernancePage = router.pathname === '/governance';

  React.useEffect(() => {
    // We measure heights to keep CSS variables updated for other calculations
    function setHeights() {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      if (header) document.documentElement.style.setProperty('--app-header-height', `${header.offsetHeight}px`);
      if (footer) document.documentElement.style.setProperty('--app-footer-height', `${footer.offsetHeight}px`);
    }

    setHeights();
    window.addEventListener('resize', setHeights);
    return () => window.removeEventListener('resize', setHeights);
  }, []);

  return (
    <>
      <Head>
        <title>CivicOP - Civic Operation of India</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        
        <style>{`
          :root{
            --theme-city: ${process.env.NEXT_PUBLIC_THEME_CITY || '#F9A825'};
            --theme-water: ${process.env.NEXT_PUBLIC_THEME_WATER || '#3B99D9'};
            --theme-transport: ${process.env.NEXT_PUBLIC_THEME_TRANSPORT || '#D32F2F'};
            --theme-greenspace: ${process.env.NEXT_PUBLIC_THEME_GREEN || '#388E3C'};
            --theme-bg: ${process.env.NEXT_PUBLIC_THEME_BG || '#FFFFFF'};
            --app-header-height: 88px;
            --app-footer-height: 88px;
          }
        `}</style>
      </Head>

      {isGovernancePage ? (
        // === GOVERNANCE DASHBOARD (Full Screen App Mode) ===
        <Component {...pageProps} />
      ) : (
        // === STANDARD LAYOUT (Fixed Screen Height) ===
        // h-screen + overflow-hidden prevents the entire window from scrolling
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
          
          {/* 1. Header Area (Fixed) */}
          <div className="shrink-0 z-50 relative">
             <Header />
             {/* Decorative Bar */}
             <div style={{height: 8, background: 'linear-gradient(90deg, var(--theme-city), var(--theme-water), var(--theme-transport), var(--theme-greenspace))'}} className="w-full" />
          </div>
          
          {/* 2. Middle Content (Takes remaining space) */}
          <div className="flex overflow-hidden relative" style={{ height: 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 8px)' }} >
            
            {/* Sidebar (Scrolls independently if needed) */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 overflow-y-auto no-scrollbar z-40 pr-0">
               <div className="pl-4 pr-0 pt-4 pb-4 space-y-2">
                  <NavButton icon="📊" label="Dashboard" />
                  <NavButton icon="🗺️" label="Map View" />
                  <NavButton icon="🎫" label="Tickets" />
                  <NavButton icon="🤖" label="AI Hub" />
                  <NavButton icon="📡" label="IoT Sensors" />
               </div>
            </aside>
            
            {/* Mobile Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40">
              <MobileNavButton icon="📊" label="Dashboard" href="/dashboard" />
              <MobileNavButton icon="🗺️" label="Map" href="/map-view" />
              <MobileNavButton icon="🎫" label="Tickets" href="/tickets" />
              <MobileNavButton icon="🤖" label="AI" href="/ai-hub" />
              <MobileNavButton icon="📡" label="IoT" href="/iot-sensors" />
            </nav>
            
            {/* Main Content (Scrolls independently) */}
            {/* We pass 'fillHeight' prop to the child component */}
            <main className="flex-1 w-full min-w-0 pl-0 pr-0 pb-0 bg-gray-50/50 overflow-y-auto flex flex-col md:pb-0 pb-20">
              <Component {...pageProps} fillHeight={true} />
            </main>
          </div>
          
          {/* 3. Footer Area (Fixed) */}
          <div className="shrink-0 z-50 relative">
            <Footer />
          </div>
        </div>
      )}
    </>
  )
}



function NavButton({ icon, label }) {
  const router = useRouter();
  const slug = '/' + label.toLowerCase().replace(/\s+/g, '-');
  const active = router.pathname === slug;

  return (
    <Link href={slug} legacyBehavior>
      <a className={`w-full flex items-center space-x-3 pl-4 pr-0 py-3 rounded-lg text-left transition-colors font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}>
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
}

function MobileNavButton({ icon, label, href }) {
  const router = useRouter();
  const active = router.pathname === href;

  return (
    <Link href={href} legacyBehavior>
      <a className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title={label}>
        <span className="text-2xl">{icon}</span>
        <span className="text-xs mt-0.5 font-medium">{label}</span>
      </a>
    </Link>
  );
}