import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Pricing — DataPulse AI',
  description: 'Choose the plan that fits your content needs. Start free, scale as you grow.',
}

export default function PricingPage() {
  return (
    <>
      <div className="pt-16">
        <Pricing />
      </div>
      <FAQ />
      <Footer />
    </>
  )
}
