import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutUs() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <p className="text-lg mb-6">
          Uphold is a leading platform dedicated to revolutionizing the digital trading experience. We provide top-notch security, 24/7 support, and an intuitive interface for traders worldwide.
        </p>
        <p className="mb-6">
          Founded in 2016, Uphold has grown to serve thousands of users across 68 countries, offering access to diverse financial markets including crypto, forex, stocks, and real estate.
        </p>
        <p className="mb-6">
          Our mission is to demystify financial markets and empower ambitious earners with the tools and insights they need to succeed in trading.
        </p>
        <p>
          With a focus on security, transparency, and user experience, Uphold continues to innovate and provide exceptional trading opportunities for both novice and experienced traders.
        </p>
      </div>
      <Footer />
    </>
  )
}