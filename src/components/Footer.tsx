import Link from 'next/link'

export default function Footer() {
  const footerSections = [
    {
      title: "About",
      links: [
        { name: "About us", href: "/about" },
        { name: "Why Uphold", href: "/why-us" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Legal", href: "/legal" },
        { name: "Privacy policy", href: "/privacy" },
        { name: "Terms of service", href: "/terms" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "FAQ", href: "/faq" },
        { name: "Send us an email", href: "mailto:support@upholdcapital.vip" },
      ]
    }
  ]

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 text-sm">
          <p className="mb-4">The risk of loss in online trading of stocks, options, futures, currencies, foreign equities, and fixed Income can be substantial.</p>
          <p className="mb-4">Before trading, clients must read the relevant risk disclosure statements on our Warnings and Disclosures page. Trading on margin is only for experienced investors with high risk tolerance. You may lose more than your initial investment. For additional information about rates on margin loans, please see Margin Loan Rates. Security futures involve a high degree of risk and are not suitable for all investors. The amount you may lose may be greater than your initial investment.</p>
          <p className="mb-4">For trading security futures, read the Security Futures Risk Disclosure Statement. Structured products and fixed income products such as bonds are complex products that are more risky and are not suitable for all investors. Before trading, please read the Risk Warning and Disclosure Statement.</p>
          <p>© 2016 Uphold, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

