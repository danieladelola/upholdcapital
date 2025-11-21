import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart3, Briefcase, HeadphonesIcon } from 'lucide-react'

export default function Features() {
  const features = [
    {
      title: "Analytics",
      description: "Our platform delivers insightful analytics and strategic guidance, enabling you to optimize your financial decisions and achieve your financial objectives",
      icon: BarChart3
    },
    {
      title: "Diverse portfolio",
      description: "Utilize our platform to safeguard a substantial portfolio of assets, ensuring secure management and protection tailored to your individual needs.",
      icon: Briefcase
    },
    {
      title: "Live support",
      description: "Our dedicated team of knowledgeable representatives is always ready to assist you with any concerns, or support you may need at any time of day.",
      icon: HeadphonesIcon
    }
  ]

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Financial markets, demystified</h2>
        <p className="text-center mb-12">Making financial markets understandable and accessible to everyone, one trade at a time.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

