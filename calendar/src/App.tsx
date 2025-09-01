import './App.css'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Smile, Meh, Frown, Zap } from 'lucide-react'

interface JournalEntry {
  id: string
  date: Date
  title: string
  content: string
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious'
  tags?: string[]
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(2025, 0, 15),
    title: 'Great day at work',
    content: 'Had an amazing presentation today. The team loved the new features we built.',
    mood: 'happy',
    tags: ['work', 'success']
  },
  {
    id: '2',
    date: new Date(2025, 0, 20),
    title: 'Weekend vibes',
    content: 'Spent the day hiking with friends. The weather was perfect and the views were incredible.',
    mood: 'excited',
    tags: ['nature', 'friends']
  },
  {
    id: '3',
    date: new Date(2025, 1, 5),
    title: 'Reflection time',
    content: 'Taking some time to think about my goals for the next quarter. Feeling optimistic about the future.',
    mood: 'neutral',
    tags: ['reflection', 'goals']
  },
  {
    id: '4',
    date: new Date(2024, 11, 25),
    title: 'Christmas celebration',
    content: 'Wonderful time with family. The kids loved their presents and we had a great dinner together.',
    mood: 'happy',
    tags: ['family', 'holiday']
  },
  {
    id: '5',
    date: new Date(2025, 0, 1),
    title: 'New Year resolutions',
    content: 'Starting the year with clear goals: exercise more, read 24 books, and learn a new skill.',
    mood: 'excited',
    tags: ['goals', 'new-year']
  },
  {
    id: '6',
    date: new Date(2025, 0, 8),
    title: 'Challenging day',
    content: 'Had some difficult conversations at work today. Feeling a bit overwhelmed but trying to stay positive.',
    mood: 'anxious',
    tags: ['work', 'stress']
  },
  {
    id: '7',
    date: new Date(2025, 1, 14),
    title: 'Valentine\'s Day',
    content: 'Lovely dinner with my partner. We talked about our future plans and dreams.',
    mood: 'happy',
    tags: ['love', 'relationship']
  },
  {
    id: '8',
    date: new Date(2025, 2, 10),
    title: 'Spring is coming',
    content: 'First warm day of the year! Took a long walk in the park and saw the first flowers blooming.',
    mood: 'excited',
    tags: ['nature', 'spring']
  }
]

const moodColors = {
  happy: 'bg-green-100 border-green-300 text-green-800',
  sad: 'bg-blue-100 border-blue-300 text-blue-800',
  neutral: 'bg-gray-100 border-gray-300 text-gray-800',
  excited: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  anxious: 'bg-red-100 border-red-300 text-red-800'
}

const moodIcons = {
  happy: <Smile className="w-4 h-4" />,
  sad: <Frown className="w-4 h-4" />,
  neutral: <Meh className="w-4 h-4" />,
  excited: <Zap className="w-4 h-4" />,
  anxious: <Heart className="w-4 h-4" />
}

function App() {
  const [months, setMonths] = useState<any[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [currentMonth, setCurrentMonth] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      days.push({
        date,
        isCurrentMonth: false,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      })
    }
    
    return { year, month, days, name: `${getMonthName(month)} ${year}` }
  }

  const loadMonths = (centerYear: number, centerMonth: number, range = 12) => {
    const newMonths = []
    for (let i = -range; i <= range; i++) {
      const targetDate = new Date(centerYear, centerMonth + i)
      newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()))
    }
    return newMonths
  }

  useEffect(() => {
    const now = new Date()
    const initialMonths = loadMonths(now.getFullYear(), now.getMonth(), 6)
    setMonths(initialMonths)
    setCurrentMonth(`${getMonthName(now.getMonth())} ${now.getFullYear()}`)
  }, [])

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container || isLoading) return

    const { scrollTop, scrollHeight, clientHeight } = container
    
    // Load more months when near top or bottom
    if (scrollTop < 300) {
      setIsLoading(true)
      setTimeout(() => {
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
      }, 50)
    } else if (scrollTop > scrollHeight - clientHeight - 300) {
      setIsLoading(true)
      setTimeout(() => {
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
      }, 50)
    }

    // Update header based on visible month (throttled)
    if (!isLoading) {
      const monthElements = container.querySelectorAll('[data-month]')
      monthElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        if (rect.top <= containerRect.top + 100 && rect.bottom >= containerRect.top + 100) {
          const monthName = element.getAttribute('data-month')
          if (monthName && monthName !== currentMonth) {
            setCurrentMonth(monthName)
          }
        }
      })
    }
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentMonth, isLoading])

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:py-4 z-30 sticky top-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{currentMonth}</h1>
          <p className="text-xs md:text-sm text-gray-600">Journal Calendar</p>
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
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
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
                      {day.entries.map((entry: JournalEntry) => (
                        <motion.button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          className={`w-full text-left p-1 rounded text-xs border ${
                            moodColors[entry.mood || 'neutral']
                          } hover:shadow-sm transition-shadow touch-manipulation`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="font-medium truncate">{entry.title}</div>
                          <div className="text-gray-600 truncate hidden md:block">{entry.content}</div>
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
              className="fixed inset-x-2 md:inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-md mx-auto max-h-[85vh] md:max-h-[80vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  {selectedEntry.mood && moodIcons[selectedEntry.mood]}
                  <span className="text-sm text-gray-600">
                    {selectedEntry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto max-h-80 md:max-h-96">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  {selectedEntry.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                  {selectedEntry.content}
                </p>
                
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
