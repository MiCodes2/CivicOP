import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import { authHelpers, dbHelpers, supabase } from '../lib/supabase'

export default function Header() {
  const router = useRouter()
  const isGovernance = router.pathname.startsWith('/governance')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchUser = async () => {
      try {
        const user = await authHelpers.getUser()
        if (isMounted) {
          if (user) {
            const { data, error } = await dbHelpers.getUserById(user.id)
            if (!error && data) {
              setCurrentUser(data)
            }
          } else {
            setCurrentUser(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      if (isMounted) {
        if (session?.user) {
          fetchUser()
        } else {
          setCurrentUser(null)
        }
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      setCurrentUser(null)
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Search functionality
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const searchTerm = query.trim().toLowerCase()
      const { data, error } = await supabase
        .from('civic_issues')
        .select('id, category, description, address, status, severity, ward_number, created_at')
        .or(`category.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,ward_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      setSearchResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery)
        setShowSearchResults(true)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (result) => {
    setShowSearchResults(false)
    setShowMobileSearch(false)
    setSearchQuery('')
    // Navigate to tickets page with the issue highlighted
    router.push(`/tickets?highlight=${result.id}`)
  }

  const catIcons = { 'Pothole': '🕳️', 'Garbage': '🗑️', 'Streetlight': '💡', 'Water Leak': '💧', 'Road Damage': '🚧', 'Other': '📍' }
  const statusColors = { 'OPEN': 'bg-orange-100 text-orange-700', 'IN_PROGRESS': 'bg-blue-100 text-blue-700', 'RESOLVED': 'bg-green-100 text-green-700', 'CLOSED': 'bg-gray-100 text-gray-700' }

  // Search Results Dropdown Component
  const SearchResultsDropdown = ({ results, loading, onResultClick }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center">
          <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 mt-2">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center">
          <span className="text-2xl">🔍</span>
          <p className="text-sm text-gray-500 mt-1">No results found</p>
          <p className="text-xs text-gray-400">Try different keywords</p>
        </div>
      ) : (
        <>
          <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-500 font-medium">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((result) => {
            const status = (result.status || 'OPEN').toUpperCase()
            return (
              <button
                key={result.id}
                onClick={() => onResultClick(result)}
                className="w-full p-3 hover:bg-blue-50 transition text-left border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                    {catIcons[result.category] || '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{result.category || 'Issue'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColors[status] || statusColors['OPEN']}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{result.description || 'No description'}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                      {result.address && <span className="truncate max-w-[150px]">📍 {result.address.split(',')[0]}</span>}
                      {result.ward_number && <span>• Ward {result.ward_number}</span>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
          <Link href="/tickets" className="block px-3 py-2 bg-gray-50 text-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-100 transition">
            View all tickets →
          </Link>
        </>
      )}
    </div>
  )

  return (
    <header className="bg-white shadow-sm border-b" style={{ height: 'var(--app-header-height)' }}>
      <div className="w-full h-full flex items-center justify-between px-4 md:px-[1in]">
        
        {/* LEFT: Logo & App Name */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center space-x-1">
            <Image
              src="/CivicOP_logo.png"
              alt="CivicOP Logo"
              width={56}
              height={56}
              className="rounded object-contain w-10 h-10 md:w-14 md:h-14"
              style={{ objectFit: 'contain' }}
            />
            <div className="leading-tight">
              <h1 className="font-bold text-gray-900">
                <span className="text-xl md:text-2xl">CivicOP</span>
              </h1>
              <p className="text-xs text-gray-600">Civic Operation of India</p>
            </div>
          </Link>
        </div>

        {/* CENTER: Dynamic Content */}
        {/* Added 'px-8' to ensure it doesn't touch the logo or buttons */}
        <div className="flex-1 flex justify-center px-4 md:px-8">
          
          {isGovernance ? (
            // CASE A: Governance Dashboard Title
            <div className="text-center bg-water/10 px-4 py-2 rounded-md shadow-sm hidden md:block">
              <h2 className="font-bold text-water text-lg md:text-xl">Governance</h2>
              <p className="text-xs text-water/80">Governance Dashboard</p>
            </div>
          ) : (
            // CASE B: Site-wide Search Bar
            <div ref={searchRef} className="hidden md:flex w-full max-w-lg relative">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-sm transition duration-150 ease-in-out"
                  placeholder="Search issues, locations, wards..."
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <SearchResultsDropdown results={searchResults} loading={searchLoading} onResultClick={handleResultClick} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Buttons - Optimized for mobile */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {/* Mobile Search Button */}
          {!isGovernance && (
            <button
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Search"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Bengaluru Pilot Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full whitespace-nowrap">
            <span>🧪</span>
            <span>Bengaluru Pilot</span>
          </span>

          {!isGovernance && (
            <>
              {/* Governance Hub Button - visible to admin, ward_admin, and ward_executive_engineer */}
              {currentUser && ['admin', 'ward_admin', 'ward_executive_engineer'].includes(currentUser.role) && (
                <Link href="/governance" className="bg-water hover:bg-water/90 text-white font-medium p-2 md:px-4 md:py-2 rounded-lg shadow-sm flex items-center gap-2 transition" title="Civic Governance Hub">
                  <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden lg:inline">Governance</span>
                </Link>
              )}
            </>
          )}

          {/* User Profile or Login Button */}
          {!loading ? (
            currentUser ? (
              // User is logged in - Show profile menu
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  title={`${currentUser.full_name || currentUser.email}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-water text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {(currentUser.full_name || currentUser.email)?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.full_name || currentUser.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.role === 'admin' && 'Super Admin'}
                        {currentUser.role === 'ward_admin' && 'Ward Admin'}
                        {currentUser.role === 'ward_executive_engineer' && 'Executive Engineer'}
                        {!['admin', 'ward_admin', 'ward_executive_engineer'].includes(currentUser.role) && currentUser.role}
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{currentUser.full_name || currentUser.email}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentUser.role === 'admin' && 'Super Administrator'}
                        {currentUser.role === 'ward_admin' && 'Ward Administrator'}
                        {currentUser.role === 'ward_executive_engineer' && 'Executive Engineer'}
                        {!['admin', 'ward_admin', 'ward_executive_engineer'].includes(currentUser.role) && `Role: ${currentUser.role}`}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - Show login button
              <Link href="/login" className="bg-greenspace hover:bg-greenspace/90 text-white font-medium p-2 md:px-4 md:py-2 rounded-lg shadow-sm flex items-center gap-2 transition" title="Login">
                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Login</span>
              </Link>
            )
          ) : (
            // Loading state
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          )}
        </div>
        
      </div>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileSearch(false)}></div>
          
          {/* Search Panel */}
          <div ref={mobileSearchRef} className="absolute top-0 left-0 right-0 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="font-semibold text-gray-900">Search CivicOP</h3>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-base transition"
                  placeholder="Search issues, locations, wards..."
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Search Results */}
            <div className="max-h-[60vh] overflow-y-auto border-t">
              {searchLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-2">Searching...</p>
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm text-gray-500 mt-2">No results found</p>
                  <p className="text-xs text-gray-400">Try different keywords</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-medium">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.map((result) => {
                    const status = (result.status || 'OPEN').toUpperCase()
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 hover:bg-blue-50 transition text-left border-b border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                            {catIcons[result.category] || '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{result.category || 'Issue'}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[status] || statusColors['OPEN']}`}>
                                {status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{result.description || 'No description'}</p>
                            {result.address && (
                              <p className="text-[11px] text-gray-400 mt-1 truncate">📍 {result.address}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  <Link 
                    href="/tickets" 
                    onClick={() => setShowMobileSearch(false)}
                    className="block px-4 py-3 bg-gray-50 text-center text-sm text-blue-600 font-medium"
                  >
                    View all tickets →
                  </Link>
                </>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm mt-2">Start typing to search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}