import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import Timer from './Timer'
import { useLanguage } from '../contexts/LanguageContext'
import { formatPersianCurrency, formatPersianNumber, formatPersianTimeRange, formatNumber, formatDate, formatTimeRange, formatCurrency, formatTimeRange24 } from '../utils/persianNumbers'
import { formatEventDate } from '../utils/solarHijriCalendar'
import { isTicketSalesClosed, shouldShowEventAsCompleted, shouldShowEventAsCancelled, getCorrectEventStatus, isEventSoldOut } from '../utils/eventStatusUpdater'
import type { Event } from '../services/api'

// Helper function to format time range in 24-hour format
function formatTimeRangeHelper(startTime: string, endTime: string, language: Language): string {
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    // Extract time parts from ISO strings
    const startTimeStr = start.toTimeString().slice(0, 5) // HH:MM format
    const endTimeStr = end.toTimeString().slice(0, 5) // HH:MM format
    
    return formatTimeRange24(startTimeStr, endTimeStr, language)
  } catch (error) {
    console.error('Error formatting time range:', error)
    return startTime // fallback to original time
  }
}

// Helper component to check if timer should be visible
function TimerWithSeparator({ startTime, closingTimeHours, className }: { startTime: string, closingTimeHours: number, className?: string }) {
  const now = new Date()
  const eventStart = new Date(startTime)
  const closingTime = new Date(eventStart.getTime() - (closingTimeHours * 60 * 60 * 1000))
  const difference = closingTime.getTime() - now.getTime()
  const hoursLeft = Math.floor(difference / (1000 * 60 * 60))
  
  // Only show timer if there are less than 24 hours left and tickets aren't closed
  if (difference <= 0 || hoursLeft >= 24) {
    return null
  }
  
  return (
    <>
      <span className="text-slate-500">/</span>
      <Timer 
        startTime={startTime} 
        closingTimeHours={closingTimeHours}
        className={className}
      />
    </>
  )
}

export default function EventCard({ e }: { e: Event }) {
  const { t, language } = useLanguage()
  
  // Check if event is past (completed or cancelled)
  const isPastEvent = e.event_status === 'completed' || e.event_status === 'cancelled'
  
  // Check if ticket sales are closed
  const hasClosedTicketSales = isTicketSalesClosed(e)
  
  // Check if event is sold out
  const isSoldOut = isEventSoldOut(e)
  
  // Check if event should be non-clickable (past events, closed ticket sales, or sold out)
  const isNonClickable = isPastEvent || hasClosedTicketSales || isSoldOut
  
  // Map category names to icons from public folder
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      'مافیا': '/مافیا.svg',
      'تماشای فیلم': '/تماشای فیلم.svg',
      'تماشای مسابقات ورزشی': '/تماشای مسابقات ورزشی.svg',
      'بازی های گروهی': '/بازی های گروهی.svg',
      'بازی‌های گروهی': '/بازی های گروهی.svg',
      'بازی های رومیزی': '/بازی های رومیزی.svg',
      'بازی‌های رومیزی': '/بازی های رومیزی.svg',
      'موسیقی زنده': '/موسیقی زنده.svg',
      'کتابخوانی': '/کتابخوانی.svg',
      'ادایی': '/ادایی.svg'
    }
    return iconMap[categoryName] || '/مافیا.svg'
  }
  
  // Get status display text and styling using centralized logic
  const getStatusDisplay = () => {
    const correctEventStatus = getCorrectEventStatus(e)
    
    if (correctEventStatus === 'completed') {
      return {
        text: 'تکمیل شده',
        className: 'text-green-400 bg-green-400/10 border border-green-400/30',
        icon: 'check-circle'
      }
    } else if (correctEventStatus === 'cancelled') {
      return {
        text: 'لغو شده',
        className: 'text-red-400 bg-red-400/10 border border-red-400/30',
        icon: 'x-circle'
      }
    }
    
    // For events with ticket sales still open, check if they're closed but not yet determined
    if (hasClosedTicketSales && correctEventStatus === 'upcoming') {
      return {
        text: 'بلیت فروخته شد',
        className: 'text-orange-400 bg-orange-400/10 border border-orange-400/30',
        icon: 'ticket'
      }
    }
    
    // For sold-out events
    if (isSoldOut && correctEventStatus === 'upcoming') {
      return {
        text: 'فروخته شد',
        className: 'text-red-400 bg-red-400/10 border border-red-400/30',
        icon: 'x-circle'
      }
    }
    
    return null
  }
  
  const statusDisplay = getStatusDisplay()
  
  return (
    <div className={`block card-compact my-5 transition-all duration-300 group ${isNonClickable ? 'opacity-75 cursor-not-allowed' : 'hover-lift cursor-pointer'}`}>
      {isNonClickable ? (
        // Non-clickable event (past or closed ticket sales)
        <div className="flex gap-3 md:gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src={e.image_url || e.social_hub.image_url || e.social_hub.gallery_images?.[0] || '/placeholder-event.jpg'} 
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-xl transition-transform duration-200" 
              alt={e.name}
              onError={(e) => {
                // Handle broken images
                e.currentTarget.src = '/placeholder-event.jpg'
              }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              {getCategoryIcon(e.category.name).startsWith('/') ? (
                <img 
                  src={getCategoryIcon(e.category.name)} 
                  alt={t(`common.categoryNames.${e.category.name}`) || e.category.name}
                  className="w-24 h-24 object-contain"
                />
              ) : (
                <span className="text-2xl sm:text-3xl md:text-4xl">{getCategoryIcon(e.category.name)}</span>
              )}
            </div>
            {/* Status overlay */}
            {statusDisplay && (
              <div className={`absolute top-1.5 right-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusDisplay.className}`}>
                <div className="flex items-center gap-1.5">
                  <Icon name={statusDisplay.icon} className="w-3.5 h-3.5" />
                  <span>{statusDisplay.text}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-2 text-slate-300">
                {e.name}
              </h3>
            </div>
            <div className="text-slate-400 text-sm space-y-1 md:space-y-1.5">
              {/* Event Date */}
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-4 h-4 text-violet-400 flex-shrink-0" /> 
                <span className="truncate">{formatDate(e.date, language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="clock" className="w-4 h-4 text-cyan-400 flex-shrink-0" /> 
                <span className="truncate">{formatTimeRangeHelper(e.start_time, e.end_time, language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="map" className="w-4 h-4 text-teal-400 flex-shrink-0" /> 
                <span className="line-clamp-1 text-sm">{e.social_hub.name}</span>
                {e.social_hub.average_rating && 
                 Number(e.social_hub.average_rating) > 0 && (
                  <div className="flex items-center gap-1 text-sm text-yellow-400">
                    <Icon name="star" className="w-4 h-4 fill-current" />
                    <span>{formatPersianNumber(e.social_hub.average_rating, 1)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Icon name="location" className="w-4 h-4 text-blue-400 flex-shrink-0" /> 
                <span className="line-clamp-1 text-sm">{e.social_hub.address}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="font-bold text-sm text-slate-400">
                {formatNumber(e.price, language)} {t('common.currency')}
              </span>
              <span className="text-sm text-slate-500">
                {statusDisplay ? (
                  statusDisplay.text === 'تکمیل شده' ? 'رویداد برگزار شد' :
                  statusDisplay.text === 'لغو شده' ? 'رویداد لغو شد' :
                  statusDisplay.text === 'بلیت فروخته شد' ? 'فروش بلیت بسته شد' :
                  statusDisplay.text === 'فروخته شد' ? 'بلیت تمام شد' : ''
                ) : ''}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Clickable future event
        <NavLink 
          to={`/event/${e.id}`} 
          className="block"
        >
          <div className="flex gap-3 md:gap-4">
            <div className="relative flex-shrink-0">
              <img 
                src={e.image_url || e.social_hub.image_url || '/placeholder-event.jpg'} 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-xl transition-transform duration-200 group-hover:scale-105" 
                alt={e.name} 
              />
              <div className="absolute inset-0 flex items-end justify-center pb-2">
                {getCategoryIcon(e.category.name).startsWith('/') ? (
                  <img 
                    src={getCategoryIcon(e.category.name)} 
                    alt={e.category.name}
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl md:text-4xl">{getCategoryIcon(e.category.name)}</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base sm:text-lg md:text-xl line-clamp-2 group-hover:text-violet-300 transition-colors">
                  {e.name}
                </h3>
              </div>
              <div className="text-slate-300 text-sm space-y-1 md:space-y-1.5">
                {/* Event Date */}
                <div className="flex items-center gap-2">
                  <Icon name="calendar" className="w-4 h-4 text-violet-400 flex-shrink-0" /> 
                  <span className="truncate">{formatDate(e.date, language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="clock" className="w-4 h-4 text-cyan-400 flex-shrink-0" /> 
                  <span className="truncate">{formatTimeRangeHelper(e.start_time, e.end_time, language)}</span>
                  {/* Ticket Closing Timer - only show if timer is visible (less than 24 hours) */}
                  {e.ticket_closing_timer && (
                    <TimerWithSeparator 
                      startTime={e.start_time} 
                      closingTimeHours={e.ticket_closing_timer}
                      className="text-xs"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="map" className="w-4 h-4 text-teal-400 flex-shrink-0" /> 
                  <span className="line-clamp-1 text-sm">{e.social_hub.name}</span>
                  {e.social_hub.average_rating && 
                   Number(e.social_hub.average_rating) > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-400">
                      <Icon name="star" className="w-4 h-4 fill-current" />
                      <span>{formatNumber(e.social_hub.average_rating, language, 1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="location" className="w-4 h-4 text-blue-400 flex-shrink-0" /> 
                  <span className="line-clamp-1 text-sm">{e.social_hub.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="user" className="w-4 h-4 text-orange-400 flex-shrink-0" /> 
                  <span className="text-sm">
                    {formatNumber(e.capacity - (e.total_reserved_people || 0), language)} {t('common.freeSeats')} / {formatNumber(e.capacity, language)} {t('common.totalSeats')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="star" className="w-4 h-4 text-red-400 flex-shrink-0" /> 
                  <span className="text-sm">
                    حداقل تعداد تیم: {formatNumber(e.minimum_group_size || 1, language)} {t('common.people')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="font-bold text-sm text-emerald-400">
                  {formatNumber(e.price, language)} {t('common.currency')}
                </span>
                <div className="chip chip-active text-xs">
                  جزئیات
                </div>
              </div>
            </div>
          </div>
        </NavLink>
      )}
    </div>
  )
}