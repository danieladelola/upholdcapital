"use client"

import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { ArrowLeft } from "lucide-react"

export default function UserProfilePage() {
  const { user } = useAuth()

  if (!user) return <div>Please log in</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
            <div className="w-full text-left">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">

          <Link
            href="/dashboard"
            className="inline-flex items-left self-start text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
            </div>
        </div>
      <div className="w-full overflow-hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">User Profile</h1>
          <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {/* Add more fields as needed */}
        </div>
      </div>
    </div>
  )
}

