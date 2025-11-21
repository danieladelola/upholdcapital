import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Stats() {
  const stats = [
    { title: "Paid out to traders", value: "$200M+" },
    { title: "Countries registered with us", value: "68+" },
    { title: "Volume of trades monthly", value: "40k+" },
    { title: "Avg. payout processing time", value: "24h" }
  ]

  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by thousands of users worldwide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

