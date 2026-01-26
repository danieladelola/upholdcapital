import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FAQ() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">What is Uphold?</h2>
            <p className="mb-4">
              Uphold is a comprehensive trading platform that provides access to multiple financial markets including cryptocurrencies, forex, stocks, and real estate. We offer secure, user-friendly tools for both novice and experienced traders.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">How do I get started?</h2>
            <p className="mb-4">
              To get started, create an account on our platform, complete the verification process, and fund your account. You can then begin trading across our supported markets.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Is my money safe?</h2>
            <p className="mb-4">
              Yes, we prioritize the security of your funds. We use bank-grade encryption, secure servers, and comply with regulatory standards to protect your assets.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">What are the trading hours?</h2>
            <p className="mb-4">
              Our platform operates 24/7 for most markets, but specific trading hours may vary depending on the asset class and market conditions.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">How do I withdraw funds?</h2>
            <p className="mb-4">
              You can withdraw funds through your account dashboard. Withdrawals are typically processed within 24 hours, though processing times may vary based on your location and chosen method.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">What fees do you charge?</h2>
            <p className="mb-4">
              Our fee structure varies by service. We offer competitive spreads and commissions. Detailed fee information is available in your account and on our pricing page.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Do you offer customer support?</h2>
            <p className="mb-4">
              Yes, our support team is available 24/7 via email, live chat, and phone. We're here to help with any questions or issues you may have.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Can I trade on mobile?</h2>
            <p className="mb-4">
              Absolutely! Our platform is fully responsive and works seamlessly on mobile devices. We also offer dedicated mobile apps for iOS and Android.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">What educational resources do you provide?</h2>
            <p className="mb-4">
              We offer a comprehensive library of educational materials including tutorials, webinars, market analysis, and trading guides to help you improve your skills.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">How do I contact support?</h2>
            <p className="mb-4">
              You can reach our support team by emailing support@upholdcapital.vip, using the live chat feature on our platform, or calling our support hotline.
            </p>
          </div>
        </div>
        <p className="mt-8">
          Can't find the answer you're looking for? Contact our support team, and we'll be happy to help.
        </p>
      </div>
      <Footer />
    </>
  )
}