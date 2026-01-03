import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Legal() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Legal Information</h1>
        <p className="text-lg mb-6">
          Uphold is committed to transparency and compliance with all applicable laws and regulations. Below you'll find important legal information about our services.
        </p>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
            <p className="mb-4">
              Uphold operates in compliance with international financial regulations and standards. We are registered and licensed in jurisdictions where required.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Risk Disclosure</h2>
            <p className="mb-4">
              Trading financial instruments carries significant risk. The risk of loss in online trading of stocks, options, futures, currencies, foreign equities, and fixed income can be substantial. You may lose more than your initial investment.
            </p>
            <p className="mb-4">
              Before trading, clients must read the relevant risk disclosure statements. Trading on margin is only for experienced investors with high risk tolerance.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Security Futures</h2>
            <p className="mb-4">
              Security futures involve a high degree of risk and are not suitable for all investors. The amount you may lose may be greater than your initial investment. Please read the Security Futures Risk Disclosure Statement before trading.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Structured Products</h2>
            <p className="mb-4">
              Structured products and fixed income products such as bonds are complex products that are more risky and are not suitable for all investors. Before trading, please read the Risk Warning and Disclosure Statement.
            </p>
          </div>
        </div>
        <p className="mt-8">
          For more detailed information, please refer to our Privacy Policy and Terms of Service.
        </p>
      </div>
      <Footer />
    </>
  )
}