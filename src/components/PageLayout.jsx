import { Link } from 'react-router-dom'
import { FileText, ShieldCheck } from 'lucide-react'

export default function PageLayout({ children, title, description }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Invoice In Minute</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
            <Link to="/how-it-works" className="hidden sm:block hover:text-foreground transition-colors">How it works</Link>
            <Link to="/features"     className="hidden sm:block hover:text-foreground transition-colors">Features</Link>
            <Link to="/faq"          className="hidden sm:block hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/" className="ml-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
              Create Invoice
            </Link>
          </nav>
        </div>
      </header>

      {(title || description) && (
        <div className="border-b bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {title       && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-background py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Invoice In Minute</p>
                <p className="text-[10px] text-muted-foreground">Free online invoice generator</p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
              <Link to="/features"     className="hover:text-foreground transition-colors">Features</Link>
              <Link to="/faq"          className="hover:text-foreground transition-colors">FAQ</Link>
            </nav>
          </div>
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" />
              <span>Your data never leaves your device — nothing is stored or sent to any server.</span>
            </div>
            <span>© {new Date().getFullYear()} Invoice In Minute</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
