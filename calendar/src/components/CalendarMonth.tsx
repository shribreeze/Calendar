import { motion } from 'framer-motion';
import type { CalendarMonth as CalendarMonthType, JournalEntry } from '../types';
import { CalendarDay } from './CalendarDay';

interface CalendarMonthProps {
  month: CalendarMonthType;
  onEntryClick: (entry: JournalEntry) => void;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarMonth = ({ month, onEntryClick }: CalendarMonthProps) => {
  const getMonthName = (monthNum: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum];
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {getMonthName(month.month)} {month.year}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {month.days.map((day, index) => (
          <CalendarDay
            key={`${day.date.toISOString().split('T')[0]}-${index}`}
            day={day}
            onEntryClick={onEntryClick}
          />
        ))}
      </div>
    </motion.div>
  );
};