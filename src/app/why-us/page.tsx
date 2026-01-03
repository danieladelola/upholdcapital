import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function WhyUphold() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Why Uphold</h1>
        <p className="text-lg mb-6">
          Choose Uphold for a seamless, secure, and innovative trading experience that sets us apart from the competition.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Top-Notch Security</h2>
            <p className="mb-4">
              Our platform employs state-of-the-art security measures to protect your assets and personal information. With advanced encryption and multi-factor authentication, you can trade with confidence.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">24/7 Support</h2>
            <p className="mb-4">
              Our dedicated support team is available around the clock to assist you with any questions or issues. Whether you're a beginner or an experienced trader, we're here to help.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Intuitive Platform</h2>
            <p className="mb-4">
              Designed with user experience in mind, our platform is easy to navigate and use, even for those new to trading. Access powerful analytics and tools without the complexity.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Diverse Markets</h2>
            <p className="mb-4">
              Trade across multiple asset classes including cryptocurrencies, forex, stocks, and real estate, all from a single, unified platform.
            </p>
          </div>
        </div>
        <p>
          Join thousands of successful traders who have chosen Uphold as their trusted trading partner. Start your journey towards financial success today.
        </p>
      </div>
      <Footer />
    </>
  )
}