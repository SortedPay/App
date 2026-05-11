import Screen from '../components/Screen'
import Header from '../components/Header'

export default function Privacy() {
  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="PRIVACY" />

      <div className="pt-2">
        <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
          Privacy Policy
        </h1>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-6">
          Beta v0.2 · last updated May 2026
        </p>

        <div className="space-y-5 font-body text-[14px] leading-[1.55] text-ink-soft pb-10">
          <Section title="What we collect">
            We collect what we need to run Sorted: your name, mobile number, address, and the
            identity document data required for KYC under AUSTRAC. We also collect transaction
            data — who you sent to, when, and how much — as part of normal operation.
          </Section>

          <Section title="Where it lives">
            Identity verification is performed by FrankieOne. Wallet keys are managed by
            Privy in secure hardware enclaves. Transaction data is recorded on the Solana
            blockchain (a public ledger). Our own servers store profile data and operational
            logs in encrypted form.
          </Section>

          <Section title="What we don&apos;t do">
            We don&apos;t sell your data. We don&apos;t share it with advertisers. We don&apos;t
            use it to train AI models. We don&apos;t track you across other apps or websites.
          </Section>

          <Section title="Who sees your transactions">
            Solana is a public blockchain. Anyone can see that wallet X sent funds to wallet Y,
            including the amount. But your @handle is not on-chain — the link between your
            real-world identity and your wallet stays inside Sorted, unless you choose to
            share it.
          </Section>

          <Section title="Your rights">
            Under the Australian Privacy Principles, you can request a copy of your data,
            ask us to correct it, or ask us to delete it. Email{' '}
            <a href="mailto:privacy@paymentsorted.com" className="underline text-ink">
              privacy@paymentsorted.com
            </a>{' '}
            to make a request.
          </Section>

          <Section title="Beta-specific note">
            In v0.2 (this beta), all data is mocked locally on your device. Nothing is sent
            to our servers yet. When v0.3 ships with real services, this policy will update
            to reflect what actually leaves your device.
          </Section>

          <Section title="Updates">
            We&apos;ll let you know in-app if this policy changes meaningfully. The
            &ldquo;last updated&rdquo; date at the top of this page reflects when it was
            last revised.
          </Section>

          <p className="font-body text-[12px] text-ink-muted pt-4 border-t border-line">
            This is a placeholder privacy policy for the beta. A full, legally-reviewed
            Privacy Policy aligned with the Australian Privacy Principles will be published
            before v1.0.
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
