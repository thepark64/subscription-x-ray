import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader mode="content" />
      <main id="main-content" className="gate-wrap">
        <div className="surface-card gate-card">
          <p className="eyebrow caption-3">404</p>
          <h1 className="heading-4">Page not found</h1>
          <p className="lede body-3">
            The route you opened does not exist or moved during a site update.
            Return to the homepage, open the statement scanner, or browse our
            Indian banking guides.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary button-md" href="/">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to home</span>
            </Link>
            <Link className="btn btn-ghost button-md" href="/scanner">
              <span>Open scanner</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <nav className="legal-related-links" aria-label="Helpful routes">
            <Link href="/guides">Statement guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
