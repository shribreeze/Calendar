import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useCalendarData } from '../hooks/useCalendarData';
import { CalendarMonth } from './CalendarMonth';
import { JournalCard } from './JournalCard';
import { JournalEntry } from '../types';

export const InfiniteCalendar = () => {
  const { months, currentDate, setCurrentDate, getMonthsRange, generateMonth } = useCalendarData();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [headerMonth, setHeaderMonth] = useState(format(new Date(), 'MMMM yyyy'));
  const [allMonths, setAllMonths] = useState(months);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsCardOpen(true);
  };

  const handleCloseCard = () => {
    setIsCardOpen(false);
    setSelectedEntry(null);
  };

  const loadMoreMonths = useCallback((direction: 'up' | 'down') => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setAllMonths(prevMonths => {
      const firstMonth = prevMonths[0];
      const lastMonth = prevMonths[prevMonths.length - 1];
      
      if (direction === 'up') {
        // Load previous months
        const newMonths = [];
        for (let i = 6; i >= 1; i--) {
          const targetDate = new Date(firstMonth.year, firstMonth.month - i);
          newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()));
        }
        return [...newMonths, ...prevMonths];
      } else {
        // Load next months
        const newMonths = [];
        for (let i = 1; i <= 6; i++) {
          const targetDate = new Date(lastMonth.year, lastMonth.month + i);
          newMonths.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()));
        }
        return [...prevMonths, ...newMonths];
      }
    });

    setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);
  }, [generateMonth]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Load more months when near top or bottom
    if (scrollTop < 200) {
      loadMoreMonths('up');
    } else if (scrollTop > scrollHeight - clientHeight - 200) {
      loadMoreMonths('down');
    }

    // Update header based on scroll position
    const monthElements = container.querySelectorAll('[data-month]');
    let visibleMonth = '';
    
    monthElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (rect.top <= containerRect.top + 100 && rect.bottom >= containerRect.top + 100) {
        visibleMonth = element.getAttribute('data-month') || '';
      }
    });

    if (visibleMonth && visibleMonth !== headerMonth) {
      setHeaderMonth(visibleMonth);
    }
  }, [headerMonth, loadMoreMonths]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setAllMonths(months);
  }, [months]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 z-30 sticky top-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">{headerMonth}</h1>
          <p className="text-sm text-gray-600">Journal Calendar</p>
        </div>
      </motion.header>

      {/* Scrollable Calendar */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {allMonths.map((month, index) => (
            <div
              key={`${month.year}-${month.month}-${index}`}
              data-month={format(new Date(month.year, month.month), 'MMMM yyyy')}
            >
              <CalendarMonth
                month={month}
                onEntryClick={handleEntryClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Journal Card Modal */}
      <JournalCard
        entry={selectedEntry}
        isOpen={isCardOpen}
        onClose={handleCloseCard}
        hasPrevious={false}
        hasNext={false}
      />
    </div>
  );
};