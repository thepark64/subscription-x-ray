import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("cancel-credit-card-subscriptions")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: {
    canonical: guide.href,
  },
  openGraph: {
    title: guide.title,
    siteName: "Subscription X-Ray",
    description: guide.description,
    type: "article",
    url: guide.href,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: guide.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: guide.title,
    description: guide.description,
    images: ["/twitter-image.png"],
  },
};

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Where do I cancel recurring credit card mandates in India?",
    a: "Under RBI e-mandate rules, Indian card issuers provide an SI Hub (Standing Instructions Hub) or recurring e-mandate dashboard in NetBanking or mobile banking alongside merchant account cancellation.",
  },
  {
    q: "Is cancelling inside the merchant website enough?",
    a: "You should cancel both with the merchant and verify your bank's SI Hub. Cancelling at the merchant ends your commercial subscription; revoking the bank SI mandate prevents any unexpected automatic retries.",
  },
  {
    q: "Why did an international SaaS charge go through without OTP or SI Hub entry?",
    a: "Some overseas merchants bill stored card credentials outside India's domestic RBI AFA / SI Hub rail. For those charges, cancel directly inside the merchant billing portal and contact your card issuer if unauthorized billing continues.",
  },
  {
    q: "Will replacing my credit card automatically cancel subscriptions?",
    a: "Not reliably. Card network tokenization and account-updater features can sometimes carry recurring authorizations over to a reissued card unless you cancel with the merchant and revoke active standing instructions.",
  },
];

export default function CancelCreditCardSubscriptionsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why credit card subscriptions behave differently in India</h2>
      <p>
        Credit card recurring charges fall into two main buckets: domestic
        subscriptions governed by RBI e-mandate Standing Instructions (typically
        managed via your issuing bank&apos;s SI Hub), and international or
        card-on-file merchants that store tokenized card credentials for
        scheduled billing.
      </p>
      <p>
        Exact portals, menu labels, and verification steps vary by bank, payment
        network, and merchant, so always treat both the merchant portal and your
        card issuer&apos;s mandate dashboard as part of cancellation.
      </p>

      <h2>Step-by-step: how to cancel a credit card subscription</h2>
      <ol>
        <li>
          <strong>Confirm the merchant and billing cycle from your statement:</strong>{" "}
          Review 3 to 12 months of card statements (or{" "}
          <Link href="/scanner">scan your exported card CSV/PDF locally</Link>)
          to note the exact descriptor, billing amount, currency, and last
          charge date.
        </li>
        <li>
          <strong>Cancel inside the merchant account first:</strong> Sign in to
          the streaming, software, SaaS, gym, or news account, open Billing /
          Subscription / Membership settings, turn off auto-renew, and save
          your cancellation confirmation email.
        </li>
        <li>
          <strong>Check whether it is billed through Apple or Google Play:</strong>{" "}
          If your statement reads <code>APPLE.COM/BILL</code> or{" "}
          <code>GOOGLE PLAY</code>, cancel inside{" "}
          <Link href="/guides/cancel-apple-subscription">Apple Settings</Link>{" "}
          or{" "}
          <Link href="/guides/cancel-google-play-subscription">
            Google Play Subscriptions
          </Link>{" "}
          rather than only deleting the app.
        </li>
        <li>
          <strong>Revoke domestic e-mandates inside your bank&apos;s SI Hub:</strong>{" "}
          Log in to your issuing bank&apos;s NetBanking, mobile app, or official
          SI Hub portal (such as HDFC, ICICI, SBI Card, Axis, or Kotak recurring
          mandate sections), inspect active Standing Instructions, and revoke
          the mandate.
        </li>
        <li>
          <strong>Inspect your next credit card statement:</strong> Verify no
          post-cancellation renewal posted, and check that any pre-billed refund
          (if eligible under merchant terms) settled cleanly.
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>The subscription is active, but nothing shows in SI Hub:</strong>{" "}
          International SaaS tools, foreign media sites, or older stored-card
          agreements may not sit inside domestic SI Hub. Cancel directly inside
          the merchant portal or contact your card issuer&apos;s support desk to
          review merchant-initiated charges.
        </li>
        <li>
          <strong>You forgot which email was used to sign up:</strong> Check the
          date and amount on your card bill, search every personal and work inbox
          for that rupee or dollar total, and contact merchant billing support
          with the last four digits of the card and transaction date.
        </li>
        <li>
          <strong>Merchant makes online cancellation difficult or unresponsive:</strong>{" "}
          Document your cancellation email/ticket, revoke any active bank SI Hub
          mandate, and escalate unauthorized post-cancellation debits to your
          bank&apos;s card dispute team. For unresolved bank complaints in India,
          refer to the{" "}
          <a
            href="https://cms.rbi.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            RBI Complaint Management System (CMS)
          </a>
          .
        </li>
      </ul>

      <h2>Related card &amp; mandate guides</h2>
      <p>
        Need deeper help with debit cards or card-updater behavior? Read{" "}
        <Link href="/guides/stop-recurring-card-payments">
          how to stop recurring card payments permanently
        </Link>{" "}
        and{" "}
        <Link href="/guides/recurring-card-payments">
          how to identify recurring card payments
        </Link>
        .
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        {FAQ_ITEMS.map((item) => (
          <div className="guide-faq-item" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </GuideLayout>
  );
}
