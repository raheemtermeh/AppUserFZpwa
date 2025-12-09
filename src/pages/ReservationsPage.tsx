import { useState, useEffect } from 'react'
import { useSearchParams, NavLink } from 'react-router-dom'
import { useStore, useUserReservations, useCart } from '../state/apiStore'
import { useEnrichedReservations } from '../hooks/useEnrichedReservations'
import Icon from '../components/Icon'
import BackButton from '../components/BackButton'
import { useLanguage } from '../contexts/LanguageContext'
import { formatNumber, formatDate } from '../utils/persianNumbers'
import { apiClient } from '../services/apiClient'
import { apiService } from '../services/api'
import { getCorrectEventStatus } from '../utils/eventStatusUpdater'

export default function ReservationsPage() {
  const { state, dispatch } = useStore()
  const { t, isRTL, language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const userReservations = useUserReservations()
  const cartItems = useCart()
  const { enrichedReservations, loading: enriching } = useEnrichedReservations()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Get status from URL params
  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      setSelectedStatus(status)
    }
  }, [searchParams])

  // Filter out pending reservations - they should not be shown
  const nonPendingReservations = enrichedReservations.filter(r => r.status !== 'pending')
  
  // Helper function to determine effective status for a reservation
  // Reservations with completed events should be treated as completed
  const getEffectiveStatus = (reservation: any): string => {
    const event = reservation.event
    if (event) {
      const correctEventStatus = getCorrectEventStatus(event)
      // If event is completed, treat reservation as completed regardless of reservation status
      if (correctEventStatus === 'completed') {
        return 'completed'
      }
      // If event is cancelled or deleted, treat reservation as cancelled
      if (correctEventStatus === 'cancelled' || event.isDeleted) {
        return 'cancelled'
      }
    }
    // Otherwise use the reservation's actual status
    return reservation.status
  }
  
  // Filter reservations by status
  const filteredReservations = nonPendingReservations.filter(reservation => {
    if (selectedStatus === 'all') return true
    
    const effectiveStatus = getEffectiveStatus(reservation)
    return effectiveStatus === selectedStatus
  })

  // Calculate statistics (excluding pending)
  // Count reservations with completed events as completed, not confirmed
  const stats = {
    confirmed: nonPendingReservations.filter(r => {
      const effectiveStatus = getEffectiveStatus(r)
      return effectiveStatus === 'confirmed'
    }).length,
    completed: nonPendingReservations.filter(r => {
      const effectiveStatus = getEffectiveStatus(r)
      return effectiveStatus === 'completed'
    }).length,
    cancelled: nonPendingReservations.filter(r => {
      const effectiveStatus = getEffectiveStatus(r)
      return effectiveStatus === 'cancelled'
    }).length,
    all: nonPendingReservations.length
  }

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setSearchParams({ status })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green'
      case 'completed': return 'violet'
      case 'cancelled': return 'red'
      case 'all': return 'blue'
      default: return 'slate'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('common.confirmed')
      case 'completed': return t('common.completed')
      case 'cancelled': return t('common.cancelled')
      case 'all': return t('common.all')
      default: return status
    }
  }

  if (!state.auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className={`card p-7 md:p-9 max-w-md w-full text-center space-y-7 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 mx-auto grid place-items-center shadow-glow">
            <Icon name="calendar" className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-responsive-2xl font-extrabold text-gradient">{t('common.signInRequired')}</h1>
            <p className="text-responsive-base text-slate-400">{t('common.signInToViewReservations')}</p>
          </div>
          <NavLink to="/login" className="btn-primary w-full py-3.5 text-lg">
            {t('common.signIn')}
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-7 md:space-y-9 lg:space-y-11 max-w-7xl mx-auto px-5 sm:px-7 lg:px-9 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pt-5">
        <div className="flex items-center gap-4">
          <BackButton fallbackPath="/" />
          <div>
            <h1 className="text-responsive-3xl font-extrabold text-gradient">{t('common.myReservations')}</h1>
            <p className="text-responsive-base text-slate-400 mt-2">
              {t('common.manageYourReservations')}
            </p>
          </div>
        </div>
        <NavLink to="/profile" className="btn-ghost p-3.5 rounded-full hover-scale">
          <Icon name="user" className="w-6 h-6" />
        </NavLink>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {[
          { status: 'all', icon: 'calendar' as const, label: t('common.all') },
          { status: 'confirmed', icon: 'check' as const, label: t('common.confirmed') },
          { status: 'completed', icon: 'star' as const, label: t('common.completed') },
          { status: 'cancelled', icon: 'close' as const, label: t('common.cancelled') }
        ].map(({ status, icon, label }) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={`card p-4 sm:p-5 text-center transition-all duration-200 hover-scale ${
              selectedStatus === status ? 'ring-2 ring-violet-500/50 shadow-glow' : ''
            }`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-${getStatusColor(status)}-500/20 mx-auto mb-3 sm:mb-4 flex items-center justify-center`}>
              <Icon name={icon} className={`w-6 h-6 sm:w-7 sm:h-7 text-${getStatusColor(status)}-400`} />
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl">{formatNumber(stats[status as keyof typeof stats], language)}</h3>
            <p className="text-sm sm:text-base text-slate-400">{label}</p>
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-7">
        {enriching ? (
          <div className="card p-7 md:p-9 text-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-slate-400 text-lg">{t('common.loading')}</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="card p-7 md:p-9 text-center">
            <Icon name="calendar" className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600 mx-auto mb-5" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-400 mb-3">
              {selectedStatus === 'all' 
                ? t('common.noReservationsYet')
                : t('common.noReservationsForStatus', { status: getStatusText(selectedStatus) })
              }
            </h3>
            <p className="text-base sm:text-lg text-slate-500 mb-7">
              {selectedStatus === 'all'
                ? t('common.startExploringEventsAndMakeFirstReservation')
                : t('common.tryDifferentStatus')
              }
            </p>
            <NavLink to="/events" className="btn-primary px-7 py-3.5 text-lg">
              {t('common.browseEvents')}
            </NavLink>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="card p-4 sm:p-5 md:p-6">
                {/* Mobile Layout */}
                <div className="flex flex-col md:hidden gap-4">
                  {/* Event Image */}
                  <div className="w-full h-36 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden">
                    {reservation.event?.image_url || reservation.event?.gallery_image_urls?.[0] || reservation.event?.social_hub?.image_url ? (
                      <img
                        src={reservation.event?.image_url || reservation.event?.gallery_image_urls?.[0] || reservation.event?.social_hub?.image_url}
                        alt={reservation.event?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-event.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Icon name="calendar" className="w-10 h-10 text-slate-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2 text-slate-200">
                        {reservation.event?.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {reservation.event?.social_hub?.name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">{t('common.date')}</p>
                        <p className="font-semibold text-slate-200">
                          {reservation.event?.date ? formatDate(reservation.event.date, language) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">{t('common.time')}</p>
                        <p className="font-semibold text-slate-200">
                          {reservation.event?.start_time ? new Date(reservation.event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">{t('common.seats')}</p>
                        <p className="font-semibold text-slate-200">
                          {formatNumber(reservation.seats, language)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">{t('common.totalPrice')}</p>
                        <p className="font-semibold text-slate-200">
                          {formatNumber(reservation.total_price, language)} {t('common.currency')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        reservation.status === 'completed' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {t(`common.reservationStatus.${reservation.status}`)}
                      </span>
                      <span className="text-slate-400 text-sm">
                        #{reservation.id}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  {/* Event Image */}
                  <div className="col-span-2">
                    <div className="w-full aspect-square rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden">
                      {reservation.event?.image_url || reservation.event?.gallery_image_urls?.[0] || reservation.event?.social_hub?.image_url ? (
                        <img
                          src={reservation.event?.image_url || reservation.event?.gallery_image_urls?.[0] || reservation.event?.social_hub?.image_url}
                          alt={reservation.event?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-event.jpg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Icon name="calendar" className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Event Name and Venue */}
                  <div className="col-span-3">
                    <h3 className="font-bold text-lg line-clamp-2 text-slate-200">
                      {reservation.event?.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {reservation.event?.social_hub?.name}
                    </p>
                  </div>
                  
                  {/* Date and Time */}
                  <div className="col-span-2">
                    <p className="text-slate-500 text-sm">{t('common.date')}</p>
                    <p className="font-semibold text-slate-200">
                      {reservation.event?.date ? formatDate(reservation.event.date, language) : '-'}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">{t('common.time')}</p>
                    <p className="font-semibold text-slate-200">
                      {reservation.event?.start_time ? new Date(reservation.event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                  
                  {/* Seats and Price */}
                  <div className="col-span-2">
                    <p className="text-slate-500 text-sm">{t('common.seats')}</p>
                    <p className="font-semibold text-slate-200">
                      {formatNumber(reservation.seats, language)}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">{t('common.totalPrice')}</p>
                    <p className="font-semibold text-slate-200">
                      {formatNumber(reservation.total_price, language)} {t('common.currency')}
                    </p>
                  </div>
                  
                  {/* Status and ID */}
                  <div className="col-span-3 flex flex-col items-end justify-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold mb-2 ${
                      reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      reservation.status === 'completed' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {t(`common.reservationStatus.${reservation.status}`)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      #{reservation.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}