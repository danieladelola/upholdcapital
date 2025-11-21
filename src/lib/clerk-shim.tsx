"use client"

import React from "react"

// Minimal shim for @clerk/nextjs used during local development when
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Exports basic components
// and hooks expected by the app so they don't crash when Clerk isn't configured.

export const ClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const SignedIn: React.FC<{ children: React.ReactNode }> = () => null
export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>

export const SignInButton: React.FC<any> = ({ children, ...props }) => (
  <button {...props} onClick={() => { /* no-op */ }}>
    {children || "Sign in"}
  </button>
)

export const SignOutButton: React.FC<any> = ({ children, onClick, ...props }) => (
  <button
    {...props}
    onClick={async (e) => {
      if (typeof onClick === "function") onClick(e)
    }}
  >
    {children || "Sign out"}
  </button>
)

export const UserProfile: React.FC<any> = () => null

export function useUser() {
  return { user: null, isSignedIn: false }
}

export function useAuth() {
  return {
    isLoaded: true,
    userId: null,
    signOut: async () => {},
  }
}

export const withServerSideAuth = (handler: any) => handler

export default {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserProfile,
  useUser,
  useAuth,
  withServerSideAuth,
}
