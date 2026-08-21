import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, ArrowUpRight, CheckCircle2, ChevronRight, Loader2, X, Sparkles, Video } from 'lucide-react';

export interface SlotItem {
  date: string;
  time_utc: string;
  formatted_time: string;
  raw_time?: string;
}

export interface CalEventTypeInfo {
  id: number;
  title: string;
  slug: string;
  duration: number;
  description: string;
  badge: string;
  bookingUrl: string;
}

export const CAL_EVENT_TYPES: CalEventTypeInfo[] = [
  {
    id: 6740664,
    title: '15 min meeting',
    slug: '15min',
    duration: 15,
    description: 'Quick Catch-up / Recruiter Intro',
    badge: '⚡ 15 Min Intro',
    bookingUrl: 'https://cal.com/ankitsarkar/15min'
  },
  {
    id: 6740666,
    title: '30 min meeting',
    slug: '30min',
    duration: 30,
    description: 'Technical Screening / Architecture',
    badge: '🎯 30 Min Screening',
    bookingUrl: 'https://cal.com/ankitsarkar/30min'
  },
  {
    id: 6752977,
    title: '60 min meeting',
    slug: '60min',
    duration: 60,
    description: 'System Design / Deep Dive',
    badge: '💻 60 Min Deep-Dive',
    bookingUrl: 'https://cal.com/ankitsarkar/60min'
  }
];

export interface LiveSlotPickerProps {
  slots?: SlotItem[];
  timeZone?: string;
  duration?: number;
  bookingUrl?: string;
  isBooking?: boolean;
  onSelectSlot?: (slot: SlotItem, duration: number) => void;
  onDurationChange?: (duration: number) => void;
}

/**
 * Cleanly format slot time label without assuming a fixed UTC offset string.
 */
export const formatSlotTime = (slot: SlotItem, targetTimeZone: string): string => {
  if (slot.formatted_time && slot.formatted_time.includes('@')) {
    const afterAt = slot.formatted_time.split('@')[1]?.trim() || '';
    const cleaned = afterAt.replace(/\s*\([^)]*\)$/, '').trim();
    if (cleaned) return cleaned;
  }

  const raw = slot.raw_time || slot.time_utc;
  if (raw) {
    try {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: targetTimeZone
        });
      }
    } catch {
      // ignore
    }
  }

  return slot.formatted_time || slot.time_utc;
};

/**
 * Generates schedule-based slots for any chosen duration on working days (Mon-Fri 09:30 - 17:00 London time).
 */
const generateSlotsForDuration = (durationMinutes: number, targetTz: string): SlotItem[] => {
  const slots: SlotItem[] = [];
  const baseDate = new Date();
  
  const dayOffsets = [1, 2, 3, 4, 5, 6, 7];
  const timeOffsets = durationMinutes <= 15
    ? ['09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
    : durationMinutes <= 45
    ? ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00']
    : ['10:00', '11:30', '14:00', '15:30'];

  for (const offset of dayOffsets) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);

    // Monday (1) to Friday (5) only
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });

    for (const timeStr of timeOffsets) {
      const [hours, mins] = timeStr.split(':').map(Number);
      const slotDate = new Date(d);
      slotDate.setHours(hours, mins, 0, 0);

      const timeUtc = slotDate.toISOString();
      const timeDisplay = slotDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

      slots.push({
        date: dateStr,
        time_utc: timeUtc,
        formatted_time: `${dayName} @ ${timeDisplay} (${targetTz})`,
        raw_time: timeUtc
      });
    }
  }

  return slots;
};

export const LiveSlotPicker: React.FC<LiveSlotPickerProps> = ({
  slots: initialSlots = [],
  timeZone = 'Europe/London',
  duration: initialDuration = 30,
  bookingUrl = 'https://cal.com/ankitsarkar/30min',
  isBooking = false,
  onSelectSlot,
  onDurationChange
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(initialDuration || 30);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Sync initialDuration if prop updates
  useEffect(() => {
    if (initialDuration && initialDuration !== selectedDuration) {
      setSelectedDuration(initialDuration);
    }
  }, [initialDuration]);

  // Compute active event type info
  const activeEventType = useMemo(() => {
    const found = CAL_EVENT_TYPES.find(t => t.duration === selectedDuration);
    if (found) return found;
    return {
      id: 6740666,
      title: `${selectedDuration} min meeting`,
      slug: `${selectedDuration}min`,
      duration: selectedDuration,
      description: 'Interview Discussion',
      badge: `⚡ ${selectedDuration} Min`,
      bookingUrl: bookingUrl || `https://cal.com/ankitsarkar/${selectedDuration}min`
    };
  }, [selectedDuration, bookingUrl]);

  // Compute active slots based on duration
  const activeSlotsList = useMemo(() => {
    if (selectedDuration === (initialDuration || 30) && initialSlots && initialSlots.length > 0) {
      return initialSlots;
    }
    return generateSlotsForDuration(selectedDuration, timeZone);
  }, [selectedDuration, initialDuration, initialSlots, timeZone]);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const groups: Record<string, SlotItem[]> = {};
    for (const slot of activeSlotsList) {
      const dateKey = slot.date || 'Upcoming';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    }
    return groups;
  }, [activeSlotsList]);

  const dates = Object.keys(groupedSlots);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  // Keep selected date valid
  useEffect(() => {
    if ((!selectedDate || !groupedSlots[selectedDate]) && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate, groupedSlots]);

  const activeDateSlots = selectedDate ? (groupedSlots[selectedDate] || []) : [];

  const handleDurationClick = useCallback((dur: number) => {
    setSelectedDuration(dur);
    setSelectedSlot(null);
    if (onDurationChange) {
      onDurationChange(dur);
    }
  }, [onDurationChange]);

  const handleSlotClick = (slot: SlotItem) => {
    setSelectedSlot(slot);
    if (onSelectSlot) {
      onSelectSlot(slot, selectedDuration);
    } else {
      const directUrl = `${activeEventType.bookingUrl}?date=${slot.date}`;
      window.open(directUrl, '_blank');
    }
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSlot(null);
  };

  const formatTabHeader = (dateStr: string) => {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return {
          dayName: parsed.toLocaleDateString('en-GB', { weekday: 'short' }),
          dayNum: parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        };
      }
    } catch {
      // fallback
    }
    return { dayName: 'Date', dayNum: dateStr };
  };

  return (
    <div style={{
      margin: '0.75rem 0',
      background: '#FFFFFF',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.15rem 1.25rem',
      boxShadow: 'var(--shadow-xs)',
      fontFamily: 'var(--font-sans)',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border-hairline)',
        marginBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'var(--accent-slate)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
          }}>
            <Calendar size={17} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Ankit Sarkar's Live Calendar
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
              <Clock size={11} />
              {activeEventType.description} ({selectedDuration}m)
            </span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--accent-emerald-subtle)',
          border: '1px solid var(--accent-emerald-border)',
          color: 'var(--accent-emerald)',
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.7rem',
          fontWeight: 600
        }}>
          <span className="status-dot"></span>
          <span>{activeSlotsList.length} Open Slots ({timeZone})</span>
        </div>
      </div>

      {/* Duration Selector Tabs */}
      <div style={{
        background: 'var(--bg-surface-subtle)',
        padding: '0.45rem 0.55rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <Sparkles size={12} color="var(--accent-slate)" />
          <span>Select Format:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {CAL_EVENT_TYPES.map((type) => {
            const isSelected = selectedDuration === type.duration;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleDurationClick(type.duration)}
                style={{
                  padding: '0.28rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--accent-slate)' : '1px solid var(--border-hairline)',
                  background: isSelected ? 'var(--accent-slate)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.12s ease',
                  boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.12)' : 'var(--shadow-xs)'
                }}
                title={type.description}
              >
                <span>{type.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSlotsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            No slots found for this exact window. You can view all upcoming availability directly on Cal.com.
          </p>
          <a
            href={activeEventType.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>Open Cal.com ({activeEventType.title})</span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      ) : (
        <>
          {/* Date Selector Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.45rem',
            marginBottom: '0.75rem',
            scrollbarWidth: 'thin'
          }}>
            {dates.map((dateKey) => {
              const isSelected = selectedDate === dateKey;
              const { dayName, dayNum } = formatTabHeader(dateKey);
              const count = groupedSlots[dateKey]?.length || 0;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  style={{
                    flexShrink: 0,
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-slate)' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'var(--accent-slate)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.1rem',
                    minWidth: '72px',
                    transition: 'all 0.12s ease',
                    boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.12)' : 'var(--shadow-xs)'
                  }}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: isSelected ? 0.8 : 0.6 }}>
                    {dayName}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    {dayNum}
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 500,
                    opacity: isSelected ? 0.9 : 1
                  }}>
                    {count} slots
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-hairline)',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.55rem',
              flexWrap: 'wrap',
              gap: '0.3rem'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select a Time for {selectedDate} ({selectedDuration} min):
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                All times in {timeZone}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '0.45rem',
              maxHeight: '190px',
              overflowY: 'auto',
              padding: '4px 4px 4px 2px'
            }}>
              {activeDateSlots.map((slot, idx) => {
                const timeDisplay = formatSlotTime(slot, timeZone);
                const isSelected = selectedSlot?.time_utc === slot.time_utc;
                const isCurrentBooking = isSelected && isBooking;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      background: isSelected ? 'var(--accent-emerald-subtle)' : '#FFFFFF',
                      color: isSelected ? '#065F46' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent-emerald-border)' : '1px solid var(--border-hairline)',
                      padding: '0.42rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 1px 3px rgba(5, 150, 105, 0.15)' : 'var(--shadow-xs)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--accent-slate)';
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(29, 78, 216, 0.12)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-hairline)';
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                      }
                    }}
                    title={`Select ${slot.formatted_time || timeDisplay} (${selectedDuration} min)`}
                  >
                    {isCurrentBooking ? (
                      <Loader2 size={11} className="spin" color="var(--accent-emerald)" />
                    ) : isSelected ? (
                      <CheckCircle2 size={11} color="var(--accent-emerald)" />
                    ) : (
                      <Clock size={11} color="var(--text-muted)" />
                    )}
                    <span>{timeDisplay}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Slot Confirmation / Status Banner */}
          {selectedSlot && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'var(--accent-emerald-subtle)',
              border: '1px solid var(--accent-emerald-border)',
              borderRadius: 'var(--radius-md)',
              color: '#065F46',
              fontSize: '0.78125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.65rem',
              animation: 'slideUpFade 0.15s ease-in-out',
              flexWrap: 'wrap',
              gap: '0.45rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
                <CheckCircle2 size={14} color="var(--accent-emerald)" />
                <span>
                  Selected: <strong>{selectedSlot.formatted_time || formatSlotTime(selectedSlot, timeZone)}</strong>
                  <span style={{ marginLeft: '0.35rem', opacity: 0.85, fontSize: '0.72rem' }}>({selectedDuration} min)</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  disabled={isBooking}
                  onClick={() => handleSlotClick(selectedSlot)}
                  style={{
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'var(--accent-slate)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: isBooking ? 'default' : 'pointer',
                    padding: '0.32rem 0.7rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {isBooking ? (
                    <>
                      <Loader2 size={11} className="spin" />
                      <span>Booking via Digital Twin...</span>
                    </>
                  ) : (
                    <>
                      <Video size={11} />
                      <span>Book {selectedDuration}m Call</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#065F46',
                    cursor: 'pointer',
                    padding: '0.15rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.75
                  }}
                  title="Clear selection"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Direct Event Type Links Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Direct Cal.com:
              </span>
              {CAL_EVENT_TYPES.map(t => (
                <a
                  key={t.id}
                  href={t.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: t.duration === selectedDuration ? 'var(--accent-slate)' : 'var(--text-secondary)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px'
                  }}
                >
                  {t.slug}
                </a>
              ))}
            </div>

            <a
              href={activeEventType.bookingUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                textDecoration: 'none'
              }}
            >
              <span>Open {activeEventType.title} on Cal.com</span>
              <ChevronRight size={13} />
            </a>
          </div>
        </>
      )}
    </div>
  );
};
