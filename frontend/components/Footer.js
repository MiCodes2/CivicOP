export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Desktop Footer */}
      <footer 
        className="mt-auto flex flex-col w-full hidden md:flex" 
        style={{
          backgroundColor: 'var(--theme-water)', 
          color: 'white', 
          marginBottom: 0, 
          borderTop: 'none'
        }}
      >
        {/* Top accent bar */}
        <div style={{height: 8, flexShrink: 0, background: 'linear-gradient(90deg, var(--theme-city), var(--theme-water), var(--theme-transport), var(--theme-greenspace))'}} />
        
        {/* FIX: Removed bottom padding to tighten vertical space */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex flex-col md:flex-row justify-between items-center w-full flex-1">
          <div className="flex items-center space-x-3 mb-2 md:mb-0 py-1">
            {/* Optional: You can reduce logo size to w-8 h-8 if you want it even smaller */}
            <img src="/CivicOP_logo.png" alt="CivicOP" className="w-10 h-10 rounded object-contain" />
            <div>
              <div className="font-semibold leading-tight">CivicOP</div>
              <div className="text-xs text-white/90">Civic Operation of India</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6 text-sm">
            {/* Mobile: Icons only, Desktop: Text */}
            <a href="/" className="text-white hover:underline flex items-center gap-1" title="Home">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden md:inline">Home</span>
            </a>
            <a href="/governance" className="text-white hover:underline flex items-center gap-1" title="Governance">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden md:inline">Governance</span>
            </a>
            <a href="/tickets" className="text-white hover:underline flex items-center gap-1" title="Tickets">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="hidden md:inline">Tickets</span>
            </a>
            <a href="/privacy" className="text-white hover:underline flex items-center gap-1" title="Privacy">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden md:inline">Privacy</span>
            </a>
            <a href="/login" className="text-white hover:underline flex items-center gap-1" title="Login">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Login</span>
            </a>
            <a href="https://www.civicopindia.com/" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white hidden md:inline">© {currentYear} CivicOP</a>
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer 
        className="md:hidden flex flex-col w-full" 
        style={{
          backgroundColor: 'var(--theme-water)', 
          color: 'white', 
          marginBottom: 0, 
          borderTop: 'none'
        }}
      >
        {/* Top accent bar */}
        <div style={{height: 4, flexShrink: 0, background: 'linear-gradient(90deg, var(--theme-city), var(--theme-water), var(--theme-transport), var(--theme-greenspace))'}} />
        
        {/* Mobile footer content */}
        <div className="px-4 py-3 flex flex-col items-center justify-center space-y-2 text-center text-xs">
          <div className="flex items-center space-x-2">
            <img src="/CivicOP_logo.png" alt="CivicOP" className="w-6 h-6 rounded object-contain" />
            <div>
              <div className="font-semibold leading-tight">CivicOP</div>
              <div className="text-xs text-white/90">Civic Operation of India</div>
            </div>
          </div>
          <div className="w-full border-t border-white/20 pt-2">
            <p className="text-white/90">© {currentYear} CivicOP. All rights reserved.</p>
            <a 
              href="https://www.civicopindia.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white hover:underline inline-block mt-1"
            >
              Visit Civic Opposition Portal
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}