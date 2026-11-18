import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="footer-brand-name">
            Subscription X-Ray
          </Link>
          <p className="footer-tagline">
            Privacy-first Indian bank &amp; card CSV/PDF scanner for recurring
            charges, UPI AutoPay mandates, and NACH debits. ₹69 one-time for 12
            non-expiring scans.
          </p>
        </div>

        <nav className="footer-col" aria-label="Product links">
          <h3>Product</h3>
          <ul>
            <li>
              <Link href="/scanner">Statement scanner</Link>
            </li>
            <li>
              <Link href="/#demo">Interactive sample</Link>
            </li>
            <li>
              <Link href="/#pricing">₹69 scan pack</Link>
            </li>
            <li>
              <Link href="/login">Sign in / Sign up</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Statement guides">
          <h3>Guides</h3>
          <ul>
            <li>
              <Link href="/guides">All statement guides</Link>
            </li>
            <li>
              <Link href="/guides/find-upi-autopay-mandates">
                Find UPI AutoPay mandates
              </Link>
            </li>
            <li>
              <Link href="/guides/cancel-upi-autopay">
                Cancel UPI AutoPay
              </Link>
            </li>
            <li>
              <Link href="/guides/find-hidden-subscriptions">
                Find hidden subscriptions
              </Link>
            </li>
            <li>
              <Link href="/guides/identify-nach-emandate">
                Identify NACH &amp; eMandates
              </Link>
            </li>
            <li>
              <Link href="/guides/recurring-card-payments">
                Recurring card payments
              </Link>
            </li>
            <li>
              <Link href="/guides/read-bank-statements">
                Read bank statements
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Company and legal">
          <h3>Info &amp; Legal</h3>
          <ul>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link href="/refund">Refund Policy</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
