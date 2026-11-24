import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("recurring-card-payments")!;

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Why are my credit card subscriptions billed in USD changing slightly in rupees?",
    a: "Exchange rate movements and bank forex markups shift the final INR amount slightly each month even when the USD subscription price is unchanged.",
  },
  {
    q: "Does blocking or replacing my card always stop international subscriptions?",
    a: "Not reliably—card networks offer merchant account-updater services that can carry active recurring tokens to replacement cards. Always cancel directly with the merchant and revoke the Standing Instruction through your issuer.",
  },
];

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

export default function RecurringCardPaymentsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>How recurring card payments work in India</h2>
      <p>
        When you subscribe to a streaming service, cloud suite, software tool,
        or app using a credit card or debit card in India, the recurring charge
        is governed by the Reserve Bank of India&apos;s (RBI) e-Mandate
        framework for card-based Standing Instructions (SI). During initial
        signup, you complete an Additional Factor of Authentication (AFA)—usually
        an OTP—to register the e-mandate on the tokenized card.
      </p>
      <p>
        Once registered, subsequent recurring debits up to{" "}
        <strong>₹15,000 per transaction</strong> can execute automatically
        without asking for an OTP every billing cycle (or up to{" "}
        <strong>₹1,00,000</strong> for mutual fund SIPs, insurance premiums,
        and credit card bill payments on debit cards). Under RBI rules, your card
        issuer or merchant is also expected to send a pre-debit alert via SMS or
        email at least 24 hours before charging you.
      </p>

      <h2>What Standing Instructions and SI Hub portals are</h2>
      <p>
        A <strong>Standing Instruction (SI)</strong> on a card is an ongoing
        authorization allowing a merchant to bill your card periodically. To give
        cardholders a central place to manage these mandates as required by RBI
        transparency guidelines, major Indian card issuers provide an online{" "}
        <strong>SI Hub</strong> (or similar portal such as Mandate HQ) linked
        inside NetBanking, mobile banking, or the issuer&apos;s card portal.
      </p>
      <p>
        Inside your issuer&apos;s SI Hub, you can typically verify your card
        with OTP at no fee and inspect active e-mandates, modify transaction
        limits, pause upcoming debits, or cancel a standing instruction
        completely.
      </p>

      <h2>How subscription billing shows up on card statements</h2>
      <p>
        Card statements rarely mention the words <em>subscription</em> cleanly.
        Watch for these real-world descriptor quirks:
      </p>
      <ul>
        <li>
          <strong>Standing Instruction codes:</strong> Some banks append markers
          like <code>SI</code>, <code>STANDING INST</code>,{" "}
          <code>CARD SI</code>, or <code>RECURRING</code> next to the merchant
          name, while many card exports show only the merchant string and city or
          country code.
        </li>
        <li>
          <strong>App store and parent company descriptors:</strong> Mobile
          subscriptions often appear under <code>APPLE.COM/BILL</code>,{" "}
          <code>ITUNES</code>, or <code>GOOGLE PLAY</code> rather than the app
          you installed. Similarly, software tools may appear under an entity
          name like OpenAI, Anthropic, Microsoft, or Adobe Ireland.
        </li>
        <li>
          <strong>Foreign-currency subscriptions:</strong> International SaaS
          tools billed in USD fluctuate slightly in INR month to month because
          of currency conversion rates plus foreign-currency markup and GST on
          markup—two separate line items can belong to one monthly plan.
        </li>
      </ul>

      <h2>Distinguishing repeated purchases from true recurring mandates</h2>
      <p>
        Not every repeating charge on a credit card statement is an automated
        Standing Instruction. Ordering lunch from the same restaurant chain,
        topping up prepaid balances manually, or buying transit passes around the
        same date each month creates similar-looking rows without an active
        e-mandate.
      </p>
      <p>Look closely at three signals before cancelling anything:</p>
      <ol>
        <li>
          <strong>Exact day-of-month rhythm:</strong> True Standing Instructions
          almost always land on the same billing anchor day (plus 1–2 days for
          weekends/settlement), whereas manual purchases vary widely.
        </li>
        <li>
          <strong>Exact fixed price vs variable basket totals:</strong> Plan
          tiers stay identical (or vary within narrow FX limits), while repeated
          food/shopping orders change every time.
        </li>
        <li>
          <strong>Presence in your bank&apos;s SI Hub:</strong> If a merchant is
          an active RBI card e-mandate in India, your issuing bank&apos;s SI Hub
          lists the active mandate status directly.
        </li>
      </ol>

      <h2>How to verify and stop unwanted recurring card charges</h2>
      <p>
        If a card statement scan reveals a recurring merchant charge you no
        longer use:
      </p>
      <ul>
        <li>
          <strong>Cancel inside the merchant or app store first:</strong> End
          the plan on the service&apos;s billing settings page (or Apple/Google
          Play subscriptions) and keep the cancellation email.
        </li>
        <li>
          <strong>Revoke the card Standing Instruction via SI Hub:</strong> Log
          into your issuing bank&apos;s official NetBanking/card portal to open
          its SI Hub / Mandate management tool and cancel any domestic RBI
          e-mandate on the card.
        </li>
        <li>
          <strong>For unrecognized or international auto-debits:</strong>{" "}
          Check with family members first, then contact your card issuer
          immediately to investigate, disable international recurring billing if
          unwanted, or file a formal billing dispute under card-issuer rules.
        </li>
      </ul>

      <p>
        Want to scan a multi-month credit card CSV or password-protected PDF
        statement without uploading it to external servers? Run a local check in{" "}
        <Link href="/scanner">Subscription X-Ray</Link>, or read our guides on{" "}
        <Link href="/guides/find-hidden-subscriptions">
          finding hidden subscriptions
        </Link>{" "}
        and{" "}
        <Link href="/guides/read-bank-statements">
          reading Indian bank statement narrations
        </Link>
        .
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Why are my credit card subscriptions billed in USD changing slightly in rupees?</h3>
          <p>
            Exchange rate movements and bank forex markups shift the final INR
            amount slightly each month even when the USD subscription price is
            unchanged.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Does blocking or replacing my card always stop international subscriptions?</h3>
          <p>
            Not reliably—card networks offer merchant account-updater services
            that can carry active recurring tokens to replacement cards. Always
            cancel directly with the merchant and revoke the Standing
            Instruction through your issuer.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
