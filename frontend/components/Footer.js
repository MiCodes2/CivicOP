export default function Footer() {
  return (
    <footer className="mt-auto" style={{backgroundColor: 'var(--theme-water)', color: 'white'}}>
      {/* Top accent subtle gradient (re-using brand colors) */}
      <div style={{height: 6, background: 'linear-gradient(90deg, var(--theme-city), var(--theme-water), var(--theme-transport), var(--theme-greenspace))'}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <img src="/CivicOP_logo.png" alt="CivicOP" className="w-10 h-10 rounded object-contain" />
          <div>
            <div className="font-semibold">CivicOP</div>
            <div className="text-sm text-white/90">Civic Operation of India</div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <a href="/" className="text-white hover:underline">Home</a>
          <a href="/governance" className="text-white hover:underline">Governance</a>
          <a href="/login" className="text-white hover:underline">Login</a>
          <a href="https://www.civicopindia.com/" target="_blank" rel="noreferrer" className="text-white/90 hover:text-white">© {new Date().getFullYear()} CivicOP</a>
        </div>
      </div>
    </footer>
  )
}
