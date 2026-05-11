import Screen from '../components/Screen'
import Header from '../components/Header'

export default function Terms() {
  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="TERMS" />

      <div className="pt-2">
        <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
          Terms of Service
        </h1>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-6">
          Beta v0.2 · last updated May 2026
        </p>

        <div className="space-y-5 font-body text-[14px] leading-[1.55] text-ink-soft pb-10">
          <Section title="1. Who we are">
            Sorted is an Australian mobile-first payment service operated by [Company name TBC]
            (ABN [TBC]), registered in [State/Territory], Australia. By using Sorted, you agree
            to these Terms.
          </Section>

          <Section title="2. Beta program">
            You are using a beta release of Sorted. Features may change, break, or be removed
            without notice. Money in your wallet during the beta is simulated and has no real
            financial value. Real money handling begins in v0.3.
          </Section>

          <Section title="3. Eligibility">
            You must be at least 18 years old, an Australian resident with a valid Australian
            mobile number, and able to provide identity documents that satisfy AUSTRAC&apos;s
            Know-Your-Customer (KYC) requirements.
          </Section>

          <Section title="4. Your wallet">
            Your wallet is held in a non-custodial Solana account managed via Privy. Sorted
            does not hold your private keys. We provide the interface; you control the funds.
          </Section>

          <Section title="5. Acceptable use">
            You agree not to use Sorted for money laundering, terrorism financing, fraud, or
            any other unlawful activity. We may suspend accounts that violate these terms or
            applicable Australian law.
          </Section>

          <Section title="6. Fees">
            Sorted does not charge a transaction fee on standard sends in v0.2. Network fees
            on Solana are paid by Sorted on your behalf. This may change with notice in
            future versions.
          </Section>

          <Section title="7. Limitation of liability">
            Sorted is provided &ldquo;as is&rdquo; during the beta. To the extent permitted by
            Australian Consumer Law, we are not liable for indirect or consequential losses
            arising from use of the service.
          </Section>

          <Section title="8. Contact">
            Questions? Email{' '}
            <a href="mailto:hello@paymentsorted.com" className="underline text-ink">
              hello@paymentsorted.com
            </a>
            .
          </Section>

          <p className="font-body text-[12px] text-ink-muted pt-4 border-t border-line">
            This is a placeholder terms document for the beta. A full, legally-reviewed
            Terms of Service will be published before v1.0.
          </p>
        </div>
      </div>
    </Screen>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display font-bold text-[15px] tracking-tight text-ink mb-1.5">
        {title}
      </h2>
      <p className="font-body text-[13px] leading-[1.55] text-ink-soft">{children}</p>
    </div>
  )
}
