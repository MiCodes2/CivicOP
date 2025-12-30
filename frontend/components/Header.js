import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()
  const isGovernance = router.pathname.startsWith('/governance')

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center" style={{ marginLeft: '1in' }}>
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

          <div className="flex-1 flex justify-center">
            {isGovernance && (
              <div className="text-center bg-water/10 px-4 py-2 rounded-md shadow-sm">
                <h2 className="font-bold text-water text-lg md:text-xl">Governance</h2>
                <p className="text-xs text-water/80">Governance Dashboard</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4" style={{ marginRight: '1in' }}>
            {!isGovernance && (
              <>
                <Link href="/governance" className="bg-greenspace hover:bg-greenspace/90 text-white font-medium py-2 px-4 rounded-lg shadow-sm">
                  Governance
                </Link>
                <Link href="/" className="bg-water hover:bg-water/90 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200">
                  Report Issue
                </Link>
              </>
            )}

            <Link href="/login" className="font-medium text-water hover:text-water/90">
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
