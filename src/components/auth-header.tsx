import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">
        <Image src={'/logo.svg'}  width={100} height={100} alt='Uphold'/>
        </h1>
        <Link href="/" >
          <Button variant="link" >Back to Homepage</Button>
        </Link>
      </div>
    </header>
  )
}

