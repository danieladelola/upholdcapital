import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="py-4 px-6 bg-background border-b">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="flex space-x-4">
          <Image src={'/logo.svg'}  width={100} height={100} alt='Uphold'/>
     </nav>
        <div className="flex space-x-4">
          {!user ? (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          ) : (
            <Button onClick={logout}>
              Logout
            </Button>
          )}

          {user && (
            <Button asChild>
              <Link href="/dashboard/home">Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

