import { NextResponse } from 'next/server'

// If Clerk publishable key is present, use clerkMiddleware so server-side
// calls to auth() can detect the middleware. Otherwise, return next()
// to allow local development without Clerk configured.
const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

let middlewareHandler: (request: Request) => any

if (hasClerkKey) {
  // Try to resolve clerkMiddleware from different Clerk packages/exports.
  // Some versions export it from '@clerk/nextjs/server'.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let clerkMiddlewareFunc: any = null
  try {
    // prefer server entry
    const m = require('@clerk/nextjs/server')
    clerkMiddlewareFunc = m && (m.clerkMiddleware || m.middleware || m.default?.clerkMiddleware || m.default?.middleware)
  } catch (e) {
    try {
      const m2 = require('@clerk/nextjs')
      clerkMiddlewareFunc = m2 && (m2.clerkMiddleware || m2.middleware || m2.default?.clerkMiddleware || m2.default?.middleware)
    } catch (e2) {
      // leave clerkMiddlewareFunc null
    }
  }

  if (typeof clerkMiddlewareFunc === 'function') {
    middlewareHandler = clerkMiddlewareFunc()
  } else {
    // If we couldn't find the middleware function, fall back to next() but
    // surface a helpful message in the server logs.
    // eslint-disable-next-line no-console
    console.error('Clerk middleware not found; falling back to NextResponse.next(). Ensure @clerk/nextjs is installed and exports clerkMiddleware.')
    middlewareHandler = function middleware(request: Request) {
      return NextResponse.next()
    }
  }
} else {
  middlewareHandler = function middleware(request: Request) {
    return NextResponse.next()
  }
}

export default middlewareHandler

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}