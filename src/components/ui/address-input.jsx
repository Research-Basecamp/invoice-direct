import { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea } from './textarea'
import { MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatAddress(item) {
  const a = item.address || {}
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  const city = a.city || a.town || a.village || a.municipality || a.county || ''
  const cityLine = [city, a.state, a.postcode].filter(Boolean).join(', ')
  const country = a.country || ''
  return [street, cityLine, country].filter(Boolean).join('\n')
}

export function AddressInput({ value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = useCallback((query) => {
    clearTimeout(debounceRef.current)
    if (query.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'invoiceinminute/1.0' } }
        )
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [])

  const handleChange = (e) => {
    onChange(e.target.value)
    // Only search using the first line so manual multi-line edits don't retrigger
    const firstLine = e.target.value.split('\n')[0].trim()
    fetchSuggestions(firstLine)
  }

  const handleSelect = (item) => {
    onChange(formatAddress(item))
    setSuggestions([])
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        {loading && (
          <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground animate-spin pointer-events-none" />
        )}
        <Textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          rows={3}
          className="pl-8 resize-none text-sm"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-background border rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((item, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(item)}
              className={cn(
                'flex items-start gap-2 px-3 py-2 text-xs cursor-pointer transition-colors',
                i === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              )}
            >
              <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="leading-relaxed">{item.display_name}</span>
            </li>
          ))}
          <li className="px-3 py-1.5 text-[10px] text-muted-foreground border-t bg-muted/40">
            Suggestions via OpenStreetMap — or just type your own address
          </li>
        </ul>
      )}
    </div>
  )
}
