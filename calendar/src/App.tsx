import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Star, Search, ArrowLeft, ArrowRight, Calendar, Filter } from 'lucide-react'
import { Card, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import journalData from './components/Journal.json'

interface JournalEntry {
  imgUrl: string
  rating: number
  categories: string[]
  date: string
  description: string
}

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

const formatDateKey = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

const journalEntries: JournalEntry[] = journalData as JournalEntry[]

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'bg-green-100 border-green-300 text-green-800'
  if (rating >= 4.0) return 'bg-blue-100 border-blue-300 text-blue-800'
  if (rating >= 3.5) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
  return 'bg-red-100 border-red-300 text-red-800'
}

function App() {
  const [months, setMonths] = useState<any[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0)
  const [currentMonth, setCurrentMonth] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(journalEntries)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [visibleMonthAreas, setVisibleMonthAreas] = useState<{[key: string]: number}>({})

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return months[month]
  }

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const generateMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)
    
    const days = []
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        isCurrentMonth: false,
        entries: filteredEntries.filter(entry => entry.date === dateKey)
      })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        isCurrentMonth: true,
        entries: filteredEntries.filter(entry => entry.date === dateKey)
      })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        isCurrentMonth: false,
        entries: filteredEntries.filter(entry => entry.date === dateKey)
      })
    }
    
    return { year, month, days, name: `${getMonthName(month)} ${year}` }
  }

  const loadMonths = useCallback((centerYear: number, centerMonth: number, range = 12) => {
    const newMonths = []
    for (let i = -range; i <= range; i++) {
      const targetDate = new Date(centerYear, centerMonth + i)
      newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
    }
    return newMonths
  }, [filteredEntries])

  useEffect(() => {
    const filtered = journalEntries.filter(entry => 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredEntries(filtered)
  }, [searchTerm])

  useEffect(() => {
    const now = new Date()
    const initialMonths = loadMonths(now.getFullYear(), now.getMonth(), 6)
    setMonths(initialMonths)
    setCurrentMonth(`${getMonthName(now.getMonth())} ${now.getFullYear()}`)
  }, [loadMonths])

  // Scroll to current month after months are loaded
  useEffect(() => {
    if (months.length > 0) {
      const scrollToCurrentMonth = () => {
        const now = new Date()
        const container = scrollRef.current
        if (container) {
          const currentMonthElement = container.querySelector(`[data-month="${getMonthName(now.getMonth())} ${now.getFullYear()}"]`)
          if (currentMonthElement) {
            // Calculate position to center the current month
            const containerHeight = container.clientHeight
            const elementTop = (currentMonthElement as HTMLElement).offsetTop
            const scrollPosition = elementTop - (containerHeight / 4) // Show current month in upper portion
            
            container.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'auto' // Use auto for initial load, smooth for user interactions
            })
          }
        }
      }
      
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(scrollToCurrentMonth, 50)
      })
    }
  }, [months])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    
    // Load more months when near top or bottom
    if (scrollTop < 300 && !isLoading) {
      setIsLoading(true)
      requestAnimationFrame(() => {
        setMonths(prev => {
          const firstMonth = prev[0]
          if (!firstMonth) return prev
          const newMonths = []
          for (let i = 3; i >= 1; i--) {
            const targetDate = new Date(firstMonth.year, firstMonth.month - i)
            newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
          }
          return [...newMonths, ...prev]
        })
        setIsLoading(false)
      })
    } else if (scrollTop > scrollHeight - clientHeight - 300 && !isLoading) {
      setIsLoading(true)
      requestAnimationFrame(() => {
        setMonths(prev => {
          const lastMonth = prev[prev.length - 1]
          if (!lastMonth) return prev
          const newMonths = []
          for (let i = 1; i <= 3; i++) {
            const targetDate = new Date(lastMonth.year, lastMonth.month + i)
            newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
          }
          return [...prev, ...newMonths]
        })
        setIsLoading(false)
      })
    }

    // Calculate visible area for each month
    const monthElements = container.querySelectorAll('[data-month]')
    const areas: {[key: string]: number} = {}
    let maxArea = 0
    let mostVisibleMonth = ''
    
    monthElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      const visibleTop = Math.max(rect.top, containerRect.top)
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      const visibleArea = visibleHeight * rect.width
      
      const monthName = element.getAttribute('data-month') || ''
      areas[monthName] = visibleArea
      
      if (visibleArea > maxArea) {
        maxArea = visibleArea
        mostVisibleMonth = monthName
      }
    })
    
    setVisibleMonthAreas(areas)
    if (mostVisibleMonth && mostVisibleMonth !== currentMonth) {
      setCurrentMonth(mostVisibleMonth)
    }
  }, [isLoading, currentMonth, generateMonth])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll)
    }

    container.addEventListener('scroll', throttledScroll, { passive: true })
    return () => container.removeEventListener('scroll', throttledScroll)
  }, [handleScroll])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const container = scrollRef.current
        if (!container) return
        
        const direction = e.key === 'ArrowLeft' ? -1 : 1
        const currentScroll = container.scrollTop
        const monthHeight = 400 // approximate month height
        container.scrollTo({
          top: currentScroll + (direction * monthHeight),
          behavior: 'smooth'
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleEntryClick = (entry: JournalEntry) => {
    const entryIndex = filteredEntries.findIndex(e => e.date === entry.date && e.description === entry.description)
    setSelectedEntry(entry)
    setSelectedEntryIndex(entryIndex)
  }

  const navigateEntry = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? selectedEntryIndex - 1 : selectedEntryIndex + 1
    if (newIndex >= 0 && newIndex < filteredEntries.length) {
      setSelectedEntry(filteredEntries[newIndex])
      setSelectedEntryIndex(newIndex)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDateKey(date) === formatDateKey(today)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <motion.header
        className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 px-4 py-3 md:py-4 z-30 sticky top-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.div
            key={currentMonth}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{currentMonth}</h1>
            <p className="text-xs md:text-sm text-gray-600">Hair Care Journal</p>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const now = new Date()
                const container = scrollRef.current
                if (container) {
                  const currentMonthElement = container.querySelector(`[data-month="${getMonthName(now.getMonth())} ${now.getFullYear()}"]`)
                  if (currentMonthElement) {
                    currentMonthElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
              className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Today</span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-40 md:w-56"
              />
            </div>
            <div className="hidden md:flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowLeft className="w-3 h-3" />
              <ArrowRight className="w-3 h-3" />
              <span>Navigate</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Scrollable Calendar */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 md:px-4 py-4 md:py-6"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {isLoading && (
            <motion.div 
              className="flex justify-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </motion.div>
          )}
          {months.map((month, monthIndex) => (
            <motion.div
              key={`${month.year}-${month.month}-${monthIndex}`}
              data-month={month.name}
              className="mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: monthIndex * 0.1 }}
            >
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{month.name}</h2>
              </div>

              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Week day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="bg-gray-100 p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-700 border-b border-gray-200"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {month.days.map((day: any, dayIndex: number) => (
                  <motion.div
                    key={`${formatDate(day.date)}-${dayIndex}`}
                    className={`min-h-16 md:min-h-24 p-1 md:p-2 border border-gray-200 ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: dayIndex * 0.01 }}
                  >
                    <div className={`text-xs md:text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday(day.date) ? 'text-blue-600' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {day.entries.map((entry: JournalEntry, idx: number) => (
                        <motion.button
                          key={`${entry.date}-${idx}`}
                          onClick={() => handleEntryClick(entry)}
                          className={`w-full text-left p-1 rounded text-xs border ${
                            getRatingColor(entry.rating)
                          } hover:shadow-sm transition-all duration-200 touch-manipulation group`}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="font-medium">{entry.rating}</span>
                            </div>
                            <img 
                              src={entry.imgUrl} 
                              alt="Entry" 
                              className="w-4 h-4 rounded object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="text-gray-700 truncate text-xs leading-tight">
                            {entry.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.categories.slice(0, 2).map((cat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs px-1 py-0 h-4">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Journal Card Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
            />
            <motion.div
              className="fixed inset-x-2 md:inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-lg mx-auto max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{selectedEntry.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {parseDate(selectedEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className="relative h-48 md:h-64">
                <img 
                  src={selectedEntry.imgUrl} 
                  alt="Journal entry" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-60">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedEntry.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEntry.categories.map((category, i) => (
                    <Badge key={i} variant="default" className="text-sm">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => navigateEntry('prev')}
                  disabled={selectedEntryIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, filteredEntries.length) }, (_, i) => {
                    const isActive = i === selectedEntryIndex % 5
                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    )
                  })}
                </div>

                <button
                  onClick={() => navigateEntry('next')}
                  disabled={selectedEntryIndex === filteredEntries.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
