import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Pokemon TCG Catalog</h1>
        
        <div className="flex justify-center mb-8">
          <SignedOut>
            <div className="text-center">
              <p className="mb-4 text-lg">Sign in to start tracking your Pokemon card collection</p>
              <p className="text-gray-600">Click the Sign In button in the header to get started</p>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="text-center">
              <p className="mb-4 text-lg">Welcome back!</p>
              <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
                Go to Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
        
        <div className="grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Simple Auth{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Clerk handles all authentication complexity. Just works.
            </p>
          </div>
          
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              One Platform{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Everything on Vercel. No CORS, no complexity.
            </p>
          </div>
          
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Stable Stack{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Next.js 14 + React 18. Battle-tested in production.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}