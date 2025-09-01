import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Star, Search} from 'lucide-react'
import { Card } from './components/ui/card'
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
  if (rating >= 4.5) return 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-400 text-white'
  if (rating >= 4.0) return 'bg-gradient-to-r from-blue-400 to-cyan-500 border-blue-400 text-white'
  if (rating >= 3.5) return 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 text-white'
  return 'bg-gradient-to-r from-red-400 to-pink-500 border-red-400 text-white'
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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const lastScrollUpdate = useRef<number>(0)

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
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        isCurrentMonth: false,
        entries: filteredEntries.filter(entry => entry.date === dateKey)
      })
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        isCurrentMonth: true,
        entries: filteredEntries.filter(entry => entry.date === dateKey)
      })
    }
    
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

  const loadMonths = useCallback((centerYear: number, centerMonth: number, range = 24) => {
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
    
    // Auto scroll to first search result
    if (searchTerm && filtered.length > 0) {
      const firstEntry = filtered[0]
      const firstEntryDate = parseDate(firstEntry.date)
      const container = scrollRef.current
      if (container) {
        const monthElement = container.querySelector(`[data-month*="${getMonthName(firstEntryDate.getMonth())} ${firstEntryDate.getFullYear()}"]`)
        if (monthElement) {
          const containerHeight = container.clientHeight
          const elementTop = (monthElement as HTMLElement).offsetTop
          const scrollPosition = elementTop - (containerHeight / 4)
          
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
          })
        }
      }
    }
  }, [searchTerm])

  useEffect(() => {
    const now = new Date()
    const initialMonths = loadMonths(now.getFullYear(), now.getMonth(), 24)
    setMonths(initialMonths)
    setCurrentMonth(`${getMonthName(now.getMonth())} ${now.getFullYear()}`)
  }, [loadMonths])

  
  useEffect(() => {
    if (months.length > 0 && !searchTerm) {
      const scrollToCurrentMonth = () => {
        const now = new Date()
        const container = scrollRef.current
        if (container) {
          const currentMonthElement = container.querySelector(`[data-month="${getMonthName(now.getMonth())} ${now.getFullYear()}"]`)
          if (currentMonthElement) {
            const containerHeight = container.clientHeight
            const elementTop = (currentMonthElement as HTMLElement).offsetTop
            const scrollPosition = elementTop - (containerHeight / 4)
            
            container.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'auto'
            })
          }
        }
      }
      
      requestAnimationFrame(() => {
        setTimeout(scrollToCurrentMonth, 50)
      })
    }
  }, [months, searchTerm])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    
    // Load more months when near top or bottom
    if (scrollTop < 1000 && !isLoading) {
      setIsLoading(true)
      requestAnimationFrame(() => {
        setMonths(prev => {
          const firstMonth = prev[0]
          if (!firstMonth) return prev
          const newMonths = []
          for (let i = 24; i >= 1; i--) {
            const targetDate = new Date(firstMonth.year, firstMonth.month - i)
            newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
          }
          return [...newMonths, ...prev]
        })
        setIsLoading(false)
      })
    } else if (scrollTop > scrollHeight - clientHeight - 1000 && !isLoading) {
      setIsLoading(true)
      requestAnimationFrame(() => {
        setMonths(prev => {
          const lastMonth = prev[prev.length - 1]
          if (!lastMonth) return prev
          const newMonths = []
          for (let i = 1; i <= 24; i++) {
            const targetDate = new Date(lastMonth.year, lastMonth.month + i)
            newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
          }
          return [...prev, ...newMonths]
        })
        setIsLoading(false)
      })
    }

    // Throttled month detection
    const now = Date.now()
    if (now - lastScrollUpdate.current > 150) {
      lastScrollUpdate.current = now
      
      const monthElements = container.querySelectorAll('[data-month]')
      let mostVisibleMonth = ''
      let maxVisibleHeight = 0
      
      for (const element of monthElements) {
        const rect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        const visibleTop = Math.max(rect.top, containerRect.top)
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        
        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight
          mostVisibleMonth = element.getAttribute('data-month') || ''
        }
      }
      
      if (mostVisibleMonth && mostVisibleMonth !== currentMonth) {
        setCurrentMonth(mostVisibleMonth)
      }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const container = scrollRef.current
        if (!container) return
        
        const direction = e.key === 'ArrowLeft' ? -1 : 1
        const currentScroll = container.scrollTop
        const monthHeight = 400
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedEntryIndex < filteredEntries.length - 1) {
      navigateEntry('next')
    }
    if (isRightSwipe && selectedEntryIndex > 0) {
      navigateEntry('prev')
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDateKey(date) === formatDateKey(today)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      
      <motion.header
        className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-purple-200 px-4 py-3 md:py-4 z-30 sticky top-0"
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
            className="min-w-0 flex-1 mr-4"
          >
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">{currentMonth}</p>
            <p className="text-xs md:text-sm text-purple-600">Hair Care Journal</p>
          </motion.div>
          
          <div className="md:block flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-28 md:w-48 border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Scrollable Calendar */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-0 md:px-4 py-4 md:py-6"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}
          {months.map((month, monthIndex) => (
            <div
              key={`${month.year}-${month.month}-${monthIndex}`}
              data-month={month.name}
              className="mb-8"
            >
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">{month.name}</h2>
              </div>

              <Card className="overflow-hidden shadow-lg border-purple-200">
                <div className="grid grid-cols-7 gap-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="bg-gradient-to-r from-purple-100 to-blue-100 p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-purple-700 border-b border-purple-200"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {month.days.map((day: any, dayIndex: number) => (
                    <div
                      key={`${formatDate(day.date)}-${dayIndex}`}
                      className={`h-24 md:h-28 md:p-1 border border-purple-200 flex flex-col ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-purple-50/50'
                      } ${isToday(day.date) ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                    >
                      <div className={`text-xs md:text-sm font-semibold mb-1 px-1 ${
                        day.isCurrentMonth ? 'text-gray-800' : 'text-gray-500'
                      } ${isToday(day.date) ? 'text-purple-700' : ''}`}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                        {day.entries.map((entry: JournalEntry, idx: number) => (
                          <div
                            key={`${entry.date}-${idx}`}
                            onClick={() => handleEntryClick(entry)}
                            className={`group flex flex-col md:flex-row h-48 items-center p-0.5 md:p-1 ${getRatingColor(
                              entry.rating
                            )} bg-white/80 hover:bg-white rounded-md shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-95`}
                          >
                            
                            <div className="w-10 h-10 pt-1 md:pt-0 flex-shrink-0 overflow-hidden rounded md:rounded-l-md">
                              <img
                                src={entry.imgUrl}
                                alt="Entry"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>

                            <div className="flex-1 flex flex-col px-2 py-1 leading-tight">
                              <div className="flex items-center mb-0.5">
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-[1px]">
                                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                  {entry.rating}
                                </span>
                              </div>

                              <div className="hidden md:block flex flex-wrap gap-1">
                                {entry.categories.slice(0, 2).map((cat, i) => {
                                  const firstWord = cat.split(' ').map(word => word.slice(0, 2))[0]
                                  return (
                                    <span
                                      key={i}
                                      className="text-[10px] px-1.5 py-[1px] border border-gray-300 rounded-full text-gray-600 bg-gray-50 group-hover:bg-gray-100"
                                    >
                                      {firstWord}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Card Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/75 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
            />
            
            {/* Mobile */}
            <motion.div
              className="md:hidden fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-between p-3 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-purple-700">{selectedEntry.rating}</span>
                  <span className="text-xs text-purple-600">
                    {parseDate(selectedEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              <div className="h-56">
                <img 
                  src={selectedEntry.imgUrl} 
                  alt="Journal entry" 
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <div className="p-3 max-h-40 overflow-y-auto">
                <p className="text-gray-800 text-sm leading-relaxed mb-3">
                  {selectedEntry.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.categories.map((category, i) => (
                    <Badge key={i} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 flex justify-center items-center text-sm text-purple-600 border-t border-purple-200">
                <a href="#">View Full Post</a>
              </div>

              <div className="flex items-center justify-between p-3 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <button
                  onClick={() => navigateEntry('prev')}
                  disabled={selectedEntryIndex === 0}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white rounded-lg hover:bg-purple-50"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev</span>
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(3, filteredEntries.length) }, (_, i) => {
                    const isActive = i === selectedEntryIndex % 3
                    return (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isActive ? 'bg-purple-500' : 'bg-purple-300'
                        }`}
                      />
                    )
                  })}
                </div>
                <button
                  onClick={() => navigateEntry('next')}
                  disabled={selectedEntryIndex === filteredEntries.length - 1}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white rounded-lg hover:bg-purple-50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>

            {/* Desktop */}
            <motion.div
              className="hidden md:block fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-lg mx-auto max-h-[90vh] overflow-hidden border border-purple-200"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-purple-700 text-lg">{selectedEntry.rating}</span>
                  <span className="text-sm text-purple-600 font-medium">
                    {parseDate(selectedEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-purple-600" />
                </button>
              </div>
              <div className="h-72">
                <img 
                  src={selectedEntry.imgUrl} 
                  alt="Journal entry" 
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <div className="p-6 overflow-y-auto max-h-60">
                <p className="text-gray-800 leading-relaxed mb-4">
                  {selectedEntry.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.categories.map((category, i) => (
                    <Badge key={i} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-3 flex justify-center items-center text-sm text-purple-600 border-t border-purple-200">
                <a href="#">View Full Post</a>
              </div>

              <div className="flex items-center justify-between p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <button
                  onClick={() => navigateEntry('prev')}
                  disabled={selectedEntryIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white rounded-lg hover:bg-purple-50"
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
                          isActive ? 'bg-purple-500' : 'bg-purple-300'
                        }`}
                      />
                    )
                  })}
                </div>
                <button
                  onClick={() => navigateEntry('next')}
                  disabled={selectedEntryIndex === filteredEntries.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white rounded-lg hover:bg-purple-50"
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