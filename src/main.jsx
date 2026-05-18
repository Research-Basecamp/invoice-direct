import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import FeaturesPage   from './pages/FeaturesPage.jsx'
import FaqPage        from './pages/FaqPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<App />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/features"     element={<FeaturesPage />} />
        <Route path="/faq"          element={<FaqPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
