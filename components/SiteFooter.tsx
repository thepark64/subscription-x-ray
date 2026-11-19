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
            Local browser Indian bank and card CSV or PDF statement scanner for
            recurring charges, UPI AutoPay mandates, and NACH debits. Single
            ₹69 payment unlocks 12 never expiring scans.
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
              <Link href="/#demo" className="body-6">
                Interactive sample
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="body-6">
                ₹69 scan pack
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
                All statement guides
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
              <Link href="/guides/identify-nach-emandate" className="body-6">
                Identify NACH mandates
              </Link>
            </li>
            <li>
              <Link href="/guides/recurring-card-payments" className="body-6">
                Recurring card payments
              </Link>
            </li>
            <li>
              <Link href="/guides/read-bank-statements" className="body-6">
                Read bank statements
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
