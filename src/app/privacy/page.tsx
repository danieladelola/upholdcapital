import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-lg mb-6">
          At Uphold, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
        </p>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, make transactions, or contact our support team. This may include your name, email address, phone number, and financial information.
            </p>
            <p className="mb-4">
              We also automatically collect certain information about your use of our platform, including IP address, browser type, and usage patterns.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use your information to provide and improve our services, process transactions, communicate with you, and ensure the security of our platform. We may also use your data for marketing purposes with your consent.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="mb-4">
              We do not sell or rent your personal information to third parties. We may share your information only in limited circumstances, such as with service providers who help us operate our platform, or when required by law.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="mb-4">
              We implement robust security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">
              You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time. To exercise these rights, please contact our support team.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our platform.
            </p>
          </div>
        </div>
        <p className="mt-8">
          If you have any questions about this Privacy Policy, please contact us at support@upholdcapital.vip.
        </p>
      </div>
      <Footer />
    </>
  )
}