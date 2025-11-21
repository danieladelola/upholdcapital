import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { SignInButton, SignedIn, SignedOut, } from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="py-4 px-6 bg-background border-b">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="flex space-x-4">
          <Image src={'/logo.png'}  width={100} height={100} alt='Xfoundation'/>
     </nav>
        <div className="flex space-x-4">
          <SignedOut>
            <SignInButton />
          </SignedOut>

          <SignedIn>

          <Button asChild>
            <Link href="/dashboard/home">Dashboard</Link>
          </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

