import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { GUIDES } from "@/lib/guides";

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
              <Link href="/help" className="body-6">
                Cancellation Help Center
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

        <nav className="footer-col" aria-label="Statement and cancellation guides">
          <h3 className="title-4">Help &amp; Guides</h3>
          <ul>
            <li>
              <Link href="/guides" className="body-6">
                All {GUIDES.length} statement guides
              </Link>
            </li>
            <li>
              <Link href="/guides/find-forgotten-subscriptions" className="body-6">
                Find forgotten subscriptions
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-upi-autopay" className="body-6">
                Cancel UPI AutoPay
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-credit-card-subscriptions" className="body-6">
                Cancel credit card subscriptions
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-nach-mandate" className="body-6">
                Cancel NACH mandates
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-google-play-subscription" className="body-6">
                Cancel Google Play
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-apple-subscription" className="body-6">
                Cancel Apple subscriptions
              </Link>
            </li>
            <li>
              <Link href="/guides/identify-unknown-bank-debits" className="body-6">
                Identify unknown bank debits
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
