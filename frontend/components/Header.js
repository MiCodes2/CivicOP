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
        <div className="flex-1 flex justify-center px-8">
          
          {isGovernance ? (
            // CASE A: Governance Dashboard Title
            <div className="text-center bg-water/10 px-4 py-2 rounded-md shadow-sm hidden md:block">
              <h2 className="font-bold text-water text-lg md:text-xl">Governance</h2>
              <p className="text-xs text-water/80">Governance Dashboard</p>
            </div>
          ) : (
            // CASE B: Home Page Search Bar (NEW)
            // Only visible on Desktop (hidden md:flex) to save space on mobile
            <div className="hidden md:flex w-full max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Search Icon */}
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-water focus:ring-1 focus:ring-water sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search for wards, issues, or locations..."
              />
            </div>
          )}
        </div>

        {/* RIGHT: Buttons - Optimized for mobile */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {/* Bengaluru Pilot Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full whitespace-nowrap">
            <span>🧪</span>
            <span>Bengaluru Pilot</span>
          </span>

          {!isGovernance && (
            <>
              {/* Governance Hub Button - visible to everyone */}
              <Link href="/governance" className="bg-water hover:bg-water/90 text-white font-medium p-2 md:px-4 md:py-2 rounded-lg shadow-sm flex items-center gap-2 transition" title="Civic Governance Hub">
                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden lg:inline">Governance</span>
              </Link>
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
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
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
                      <p className="text-xs text-gray-400 mt-1 capitalize">Role: {currentUser.role}</p>
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
    </header>
  )
}