import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    n: '1',
    title: 'Fill in your details',
    body: 'Enter your business name, logo, contact details, and client info. Your details are auto-saved so you never have to retype them.',
  },
  {
    n: '2',
    title: 'Add your invoice items',
    body: 'List your products or services with quantity and rate. Add tax, discount, and delivery charges — totals are calculated automatically.',
  },
  {
    n: '3',
    title: 'Download for free',
    body: 'Download as a PDF document, Word file (.docx), or PNG image. On mobile, save directly to your Files app or photo gallery.',
  },
]

export default function HowItWorksPage() {
  return (
    <PageLayout
      title="How it works"
      description="Create a professional invoice in under a minute — no account needed."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-3 gap-10 mb-16">
          {STEPS.map(({ n, title, body }) => (
            <div key={n}>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center mb-4">{n}</div>
              <h2 className="font-semibold text-lg mb-2">{title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="border rounded-2xl bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to create your invoice?</h2>
          <p className="text-muted-foreground text-sm mb-6">Free, instant, no sign-up required.</p>
          <Button asChild size="lg">
            <Link to="/">Create Invoice Now</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
