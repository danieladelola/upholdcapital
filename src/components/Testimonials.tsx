import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Louis van Nuekerk",
      role: "Professional trader",
      content: "Incredible company, I've been trading for a while with them, had two quick withdrawals and fee refund in less than 48 hours. I absolutely recommend the firm"
    },
    {
      name: "Dee",
      role: "Review expert",
      content: "legitimate! thank you for the opportunity, nothing out there can compare"
    },
    {
      name: "Adam",
      role: "User",
      content: "This is an amazing platform which gives you opportunity to achieve their goals and become successful traders with the support of finances."
    },
    {
      name: "Agata Vincent",
      role: "Trader",
      content: "Uphold has everything you can ask for, I'm super happy it has been recommended to me as my first broker"
    },
    {
      name: "Jakub Szulc",
      role: "Trader",
      content: "Great company, no issues with payouts, great customer support. Highly recommended for experienced traders."
    },
    {
      name: "Pro Kittisak",
      role: "User",
      content: "Amazing experience. I have a very nice experience using this platform. Execution speed is one of the best all over the market."
    }
  ]

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Built for today's ambitious earners</h2>
        <p className="text-center mb-12">Thousands of forward-thinking users rely on Uphold everyday to turbo-charge their financial operations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

