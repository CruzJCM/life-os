import { Header, MainLayout } from '../components/layout';
import { CalendarGrid } from '../components/calendar';
import { useCalendar } from '../hooks';
import { Calendar as CalendarIcon } from 'lucide-react';

export function Calendar() {
  const {
    events,
    loading,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
  } = useCalendar();

  return (
    <MainLayout>
      <Header title="Calendario" />
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                <CalendarIcon className="w-10 h-10 text-[var(--text-tertiary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Sin eventos próximos
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md">
                Crea tarjetas de tipo "Contador de evento" para verlas en el calendario
              </p>
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={events}
              onMonthChange={setCurrentMonth}
              onDateSelect={setSelectedDate}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}