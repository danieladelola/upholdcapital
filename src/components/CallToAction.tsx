import { Button } from '@/components/ui/button'

export default function CallToAction() {
  return (
    <section className="py-20 px-6 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Get started with trading today</h2>
        <p className="mb-8">It's easy to get started. Register an account with us and get started with trading today.</p>
        <Button size="lg" variant="secondary" asChild>
          <a href="/get-started">Get started</a>
        </Button>
      </div>
    </section>
  )
}

