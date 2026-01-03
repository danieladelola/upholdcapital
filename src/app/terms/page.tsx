import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-lg mb-6">
          These Terms of Service govern your use of the Uphold platform. By accessing or using our services, you agree to be bound by these terms.
        </p>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By creating an account or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
            <p className="mb-4">
              You must be at least 18 years old and a resident of a jurisdiction where our services are available. You are responsible for ensuring that your use of our platform complies with local laws.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Account Responsibilities</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Trading Risks</h2>
            <p className="mb-4">
              Trading financial instruments involves substantial risk. You acknowledge that you may lose money and that past performance does not guarantee future results. You trade at your own risk.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
            <p className="mb-4">
              You agree not to engage in fraudulent activities, market manipulation, or any illegal use of our platform. Violation of these terms may result in account suspension or termination.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Fees and Charges</h2>
            <p className="mb-4">
              We may charge fees for certain services. All applicable fees will be disclosed before you incur them. Fees are subject to change with notice.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="mb-4">
              Uphold shall not be liable for any indirect, incidental, or consequential damages arising from your use of our platform. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend your account at any time for violation of these terms or for other reasons we deem necessary.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="mb-4">
              These terms are governed by the laws of [Jurisdiction]. Any disputes will be resolved in the courts of [Jurisdiction].
            </p>
          </div>
        </div>
        <p className="mt-8">
          These terms may be updated from time to time. Continued use of our platform constitutes acceptance of the updated terms.
        </p>
      </div>
      <Footer />
    </>
  )
}