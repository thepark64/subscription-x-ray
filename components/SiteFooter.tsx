import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="footer-brand-name title-3">
            <BrandMark size={24} />
            <span>Subscription X-Ray</span>
          </Link>
          <p className="footer-tagline body-6">
            See what&apos;s quietly leaving your account every month. Browser
            local CSV and PDF statement scanner for UPI AutoPay, NACH, and
            recurring card charges. ₹69 once grants 12 never expiring scans.
          </p>
        </div>

        <nav className="footer-col" aria-label="Product links">
          <h3 className="title-4">Product</h3>
          <ul>
            <li>
              <Link href="/scanner" className="body-6">
                Statement scanner
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="body-6">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#demo" className="body-6">
                Interactive sample
              </Link>
            </li>
            <li>
              <Link href="/compare" className="body-6">
                Compare approaches
              </Link>
            </li>
            <li>
              <Link href="/faq" className="body-6">
                Frequently asked questions
              </Link>
            </li>
            <li>
              <Link href="/login" className="body-6">
                Sign in or sign up
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Statement guides">
          <h3 className="title-4">Guides</h3>
          <ul>
            <li>
              <Link href="/guides" className="body-6">
                All 10 statement guides
              </Link>
            </li>
            <li>
              <Link href="/guides/find-upi-autopay-mandates" className="body-6">
                Find UPI AutoPay mandates
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-upi-autopay" className="body-6">
                Cancel UPI AutoPay
              </Link>
            </li>
            <li>
              <Link href="/guides/find-hidden-subscriptions" className="body-6">
                Find hidden subscriptions
              </Link>
            </li>
            <li>
              <Link
                href="/guides/hdfc-sbi-icici-automatic-payments"
                className="body-6"
              >
                HDFC, SBI &amp; ICICI statements
              </Link>
            </li>
            <li>
              <Link
                href="/guides/calculate-monthly-subscription-spending"
                className="body-6"
              >
                Calculate monthly spend
              </Link>
            </li>
            <li>
              <Link href="/guides/debit-card-recurring-payments" className="body-6">
                Debit card recurring charges
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Company and legal">
          <h3 className="title-4">Info and legal</h3>
          <ul>
            <li>
              <Link href="/about" className="body-6">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="body-6">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="body-6">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="body-6">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/refund" className="body-6">
                Refund Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
