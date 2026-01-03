import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="py-20 px-6 bg-primary text-primary-foreground ">
              </br></br></br></br>

      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Get started today</h1>
        <p className="text-xl mb-8">Revolutionizing your digital trading experience</p>
        <p className="mb-8">Seamlessly merging complexity with ease, Uphold offers top-notch security, 24/7 support, and an intuitive platform for your trading needs.</p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild>
            <a href="/signup">Get started</a>
          </Button>
        </div>
        </br></br></br></br>
      </div>
    </section>
  )
}

