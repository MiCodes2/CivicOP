import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()
  const isGovernance = router.pathname.startsWith('/governance')

  return (
    <header className="bg-white shadow-sm border-b" style={{ height: 'var(--app-header-height)' }}>
      {/* Changes made here:
        1. Removed 'max-w-7xl mx-auto' (which limited width).
        2. Added 'w-full' to stretch full width.
        3. Added 'px-4 md:px-[1in]' to create the 1-inch margin on desktop (approx 96px) 
           and safe padding on mobile.
      */}
      <div className="w-full h-full flex items-center justify-between px-4 md:px-[1in]">
        
        {/* LEFT ALIGN: Logo & App Name */}
        <div className="flex items-center">
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

        {/* CENTER: Governance Title (Conditional) */}
        {/* Kept this to preserve layout balance. If visible, it stays centered. If hidden, empty div takes no space. */}
        <div className="flex-1 flex justify-center">
          {isGovernance && (
            <div className="text-center bg-water/10 px-4 py-2 rounded-md shadow-sm hidden md:block">
              <h2 className="font-bold text-water text-lg md:text-xl">Governance</h2>
              <p className="text-xs text-water/80">Governance Dashboard</p>
            </div>
          )}
        </div>

        {/* RIGHT ALIGN: Buttons */}
        {/* Removed inline style={{ marginRight: '1in' }} as the parent padding handles it now */}
        <div className="flex items-center space-x-4">
          {!isGovernance && (
            <>
              <Link href="/governance" className="hidden md:inline-block bg-water hover:bg-water/90 text-white font-medium py-2 px-4 rounded-lg shadow-sm">
                Civic Governance Hub
              </Link>
              <Link href="/" className="hidden md:inline-block bg-city hover:bg-city/90 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
                Report Issue
              </Link>
            </>
          )}

          <Link href="/login" className="bg-greenspace hover:bg-greenspace/90 text-white font-medium py-2 px-4 rounded-lg shadow-sm">
            Login
          </Link>
        </div>
        
      </div>
    </header>
  )
}