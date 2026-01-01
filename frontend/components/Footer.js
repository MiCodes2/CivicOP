export default function Footer() {
  return (
    <footer 
      className="mt-auto flex flex-col w-full" 
      style={{
        backgroundColor: 'var(--theme-water)', 
        color: 'white', 
        // FIX: Removed 'minHeight' so the footer can actually shrink to fit the smaller padding
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

        <div className="flex items-center space-x-6 text-sm">
          <a href="/" className="text-white hover:underline">Home</a>
          <a href="/governance" className="text-white hover:underline">Governance</a>
          <a href="/tickets" className="text-white hover:underline">Tickets</a>
          <a href="/privacy" className="text-white hover:underline">Privacy</a>
          <a href="/terms" className="text-white hover:underline">Terms</a>
          <a href="/login" className="text-white hover:underline">Login</a>
          <a href="https://www.civicopindia.com/" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white">© {new Date().getFullYear()} CivicOP</a>
        </div>
      </div>
    </footer>
  )
}