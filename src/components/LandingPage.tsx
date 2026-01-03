"use client"
import type { Ref } from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BarChart, Briefcase, HeadphonesIcon } from "lucide-react"
import Image from "next/image"
import { useInView } from "@/hooks/useInView"
import { useAuth } from "@/components/AuthProvider"
import Link from 'next/link'
import TradingViewTickerTape from "./TickerWidget"


const LandingPage = () => { 
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TradingViewTickerTape/>
      <Features />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}

const Header = () => {
  const { user } = useAuth()
  return (
    <header className="container mx-auto p-6">
      <nav className="flex justify-between items-center">
         <Image src={'/logo.svg'}  width={100} height={100} alt='Uphold'/>

         {user ? (
           <Button asChild>
             <Link href="/dashboard/home">Dashboard</Link>
           </Button>
         ) : (
           <Button asChild>
             <Link href="/login">Login</Link>
           </Button>
         )}
      </nav>
    </header>
  )
}

const Hero = () => {
  const [ref, isInView] = useInView()
  return (
    <section ref={ref as unknown as Ref<HTMLElement>} className="relative overflow-hidden bg-gradient-to-br from-background to-card py-32">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-4"
        >
          Revolutionizing your digital trading experience
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8"
        >
          Seamlessly merging complexity with ease, Uphold offers top-notch security, 24/7 support, and an intuitive
          platform for your trading needs.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button size="lg">
            Get started
            <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

const Features = () => {
  const [ref, isInView] = useInView()
  return (
    <section ref={ref as unknown as Ref<HTMLElement>} className="container mx-auto px-6 py-20">
      <h3 className="text-3xl font-bold text-center mb-12">Financial markets, demystified</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: BarChart,
            title: "Analytics",
            description:
              "Our platform delivers insightful analytics and strategic guidance, enabling you to optimize your financial decisions and achieve your financial objectives",
          },
          {
            icon: Briefcase,
            title: "Diverse portfolio",
            description:
              "Utilize our platform to safeguard a substantial portfolio of assets, ensuring secure management and protection tailored to your individual needs.",
          },
          {
            icon: HeadphonesIcon,
            title: "Live support",
            description:
              "Our dedicated team of knowledgeable representatives is always ready to assist you with any concerns, or support you may need at any time of day.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 mb-4 text-primary" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const Stats = () => {
  const [ref, isInView] = useInView()
  return (
    <section ref={ref as unknown as Ref<HTMLElement>} className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-12">Trusted by thousands of users worldwide</h3>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { value: 200, label: "Paid out to traders", suffix: "M+", prefix: "$" },
            { value: 68, label: "Countries registered with us", suffix: "+" },
            { value: 40, label: "Volume of trades monthly", suffix: "k+" },
            { value: 24, label: "Avg. payout processing time", suffix: "h" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="text-4xl font-bold mb-2">
                {stat.prefix}
                <CountUp end={stat.value} duration={2.5} start={isInView ? undefined : 0} />
                {stat.suffix}
              </div>
              <div>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Testimonials = () => {
  const [ref, isInView] = useInView()
  return (
    <section ref={ref as unknown as Ref<HTMLElement>} className="container mx-auto px-6 py-20">
      <h3 className="text-3xl font-bold text-center mb-12">Built for today's ambitious earners</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            name: "Louis van Nuekerk",
            role: "Professional trader",
            quote:
              "Incredible company, I've been trading for a while with them, had two quick withdrawals and fee refund in less than 48 hours. I absolutely recommend the firm",
          },
          {
            name: "Dee",
            role: "Review expert",
            quote: "legitimate! thank you for the opportunity, nothing out there can compare",
          },
          {
            name: "Adam",
            role: "User",
            quote:
              "This is an amazing platform which gives you opportunity to achieve their goals and become successful traders with the support of finances.",
          },
          {
            name: "Agata Vincent",
            role: "Trader",
            quote:
              "Uphold has everything you can ask for, I'm super happy it has been recommended to me as my first broker",
          },
          {
            name: "Jakub Szulc",
            role: "Trader",
            quote:
              "Great company, no issues with payouts, great customer support. Highly recommended for experienced traders.",
          },
          {
            name: "Pro Kittisak",
            role: "User",
            quote:
              "Amazing experience. I have a very nice experience using this platform. Execution speed is one of the best all over the market.",
          },
        ].map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const CTA = () => (
  <section className="bg-primary text-primary-foreground py-20">
    <div className="container mx-auto px-6 text-center">
      <h3 className="text-3xl font-bold mb-4">Get started with trading today</h3>
      <p className="mb-8">It's easy to get started. Register an account with us and get started with trading today.</p>
      <Button size="lg" variant="secondary">
        Get started
        <ArrowRight className="ml-2" />
      </Button>
    </div>
  </section>
)

const Footer = () => (
  <footer className="bg-muted py-12">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold mb-4">About</h4>
          <ul className="space-y-2">
            <li>About us</li>
            <li>Why Uphold</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Earn</h4>
          <ul className="space-y-2">
            <li>Crypto</li>
            <li>Forex</li>
            <li>Stocks</li>
            <li>Real Estate</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>Legal</li>
            <li>Privacy policy</li>
            <li>Terms of service</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li>FAQ</li>
            <li>Send us an email</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 text-sm text-muted-foreground">
        <p>
          The risk of loss in online trading of stocks, options, futures, currencies, foreign equities, and fixed Income
          can be substantial.
        </p>
        <p className="mt-4">
          Before trading, clients must read the relevant risk disclosure statements on our Warnings and Disclosures
          page. Trading on margin is only for experienced investors with high risk tolerance. You may lose more than
          your initial investment. For additional information about rates on margin loans, please see Margin Loan Rates.
          Security futures involve a high degree of risk and are not suitable for all investors. The amount you may lose
          may be greater than your initial investment.
        </p>
        <p className="mt-4">
          For trading security futures, read the Security Futures Risk Disclosure Statement. Structured products and
          fixed income products such as bonds are complex products that are more risky and are not suitable for all
          investors. Before trading, please read the Risk Warning and Disclosure Statement.
        </p>
        <p className="mt-4">&copy; 2016 - 2024 Uphold, Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
)

export default LandingPage

