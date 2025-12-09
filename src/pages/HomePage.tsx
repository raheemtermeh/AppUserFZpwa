import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUnfilteredEvents, useStore, useFavoriteSocialHubs } from '../state/apiStore'
import { apiUtils } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import { filterEventsWithOpenTicketSales, filterEventsNotSoldOut } from '../utils/eventStatusUpdater'

// Home page components
import HeroSection from '../components/home/HeroSection'
import SearchBar from '../components/home/SearchBar'
import CategoriesSection from '../components/home/CategoriesSection'
import VenuesSection from '../components/home/VenuesSection'
import EventsSection from '../components/home/EventsSection'

export default function HomePage() {
  const events = useUnfilteredEvents()
  const favoriteHubs = useFavoriteSocialHubs()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Refresh data when navigating to home page
  useEffect(() => {
    if (location.pathname !== '/') return

    const refreshData = async (forceRefresh: boolean = true) => {
      try {
        dispatch({ type: 'set_loading', key: 'events', value: true })
        const events = await apiUtils.getAllEvents(undefined, forceRefresh)
        dispatch({ type: 'set_events', events: events })
        dispatch({ type: 'set_loading', key: 'events', value: false })
      } catch (error) {
        dispatch({ type: 'set_loading', key: 'events', value: false })
      }

      try {
        dispatch({ type: 'set_loading', key: 'socialHubs', value: true })
        const socialHubs = await apiUtils.getAllSocialHubs(undefined, forceRefresh)
        const sortedSocialHubs = socialHubs.sort((a, b) => {
          const ratingA = a.average_rating || 0
          const ratingB = b.average_rating || 0
          return ratingB - ratingA
        })
        dispatch({ type: 'set_social_hubs', socialHubs: sortedSocialHubs })
        dispatch({ type: 'set_loading', key: 'socialHubs', value: false })
      } catch (error) {
        dispatch({ type: 'set_loading', key: 'socialHubs', value: false })
      }
    }

    refreshData(true)
  }, [location.pathname, dispatch])

  // Default categories order
  const defaultCategoriesOrder = [
    'مافیا',
    'تماشای مسابقات ورزشی',
    'تماشای فیلم',
    'کتابخوانی',
    'موسیقی زنده',
    'ادایی',
    'بازی های رومیزی',
    'بازی های گروهی'
  ]

  // Map categories to display format
  const categoriesData = (state.eventCategories || [])
    .map(category => {
      const iconMap: Record<string, string> = {
        'مافیا': '/مافیا.svg',
        'تماشای فیلم': '/تماشای فیلم.svg',
        'تماشای مسابقات ورزشی': '/تماشای مسابقات ورزشی.svg',
        'تماشای ورزش': '/تماشای مسابقات ورزشی.svg',
        'بازی های گروهی': '/بازی های گروهی.svg',
        'بازی‌های گروهی': '/بازی های گروهی.svg',
        'گیمینگ گروهی': '/بازی های گروهی.svg',
        'بازی های رومیزی': '/بازی های رومیزی.svg',
        'بازی‌های رومیزی': '/بازی های رومیزی.svg',
        'موسیقی زنده': '/موسیقی زنده.svg',
        'کتابخوانی': '/کتابخوانی.svg',
        'مطالعه کتاب': '/کتابخوانی.svg',
        'ادایی': '/ادایی.svg',
        'تظاهر': '/ادایی.svg'
      }

      return {
        id: category.id,
        name: category.name,
        icon: iconMap[category.name] || '🎯',
        order: defaultCategoriesOrder.indexOf(category.name)
      }
    })
    .sort((a, b) => {
      if (a.order !== -1 && b.order !== -1) {
        return a.order - b.order
      } else if (a.order !== -1) {
        return -1
      } else if (b.order !== -1) {
        return 1
      } else {
        return a.name.localeCompare(b.name)
      }
    })

  // Filter events
  const filteredEvents = (events || []).filter(event => {
    if (!event) return false
    if (event.event_status === 'completed' || event.event_status === 'cancelled') return false
    if (searchQuery &&
      !event.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.social_hub?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const eventsWithOpenTicketSales = filterEventsWithOpenTicketSales(filteredEvents)
  const eventsNotSoldOut = filterEventsNotSoldOut(eventsWithOpenTicketSales)

  // Separate past events
  const pastEvents = (events || []).filter(event => {
    if (!event) return false
    return event.event_status === 'completed' || event.event_status === 'cancelled'
  })

  // Get recent events (within 7 days)
  const recentEvents = (eventsNotSoldOut || [])
    .filter(event => {
      if (!event || !event.start_time) return false
      const eventDate = new Date(event.start_time)
      const now = new Date()
      const timeDiff = eventDate.getTime() - now.getTime()
      return timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000
    })
    .sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })
    .slice(0, 5)

  // Get random category events
  const categoriesWithEvents = (state.eventCategories || []).filter(category => {
    return (eventsNotSoldOut || []).some(event => event.category?.id === category.id)
  })

  const randomCategory = categoriesWithEvents.length > 0
    ? categoriesWithEvents[Math.floor(Math.random() * categoriesWithEvents.length)]
    : null

  const randomCategoryEvents = randomCategory
    ? (eventsNotSoldOut || []).filter(event => {
      if (!event) return false
      return event.category?.id === randomCategory.id
    }).slice(0, 5)
    : []

  // Handlers
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      return
    }
    setShowSearchResults(true)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim()) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setShowSearchResults(false)
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section */}
      <HeroSection
        eventsCount={eventsNotSoldOut.length}
        venuesCount={state.socialHubs?.length || 0}
        favoritesCount={favoriteHubs?.length || 0}
      />

      {/* Search Bar */}
      {/* <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClear={handleClear}
      /> */}

      {/* Show content only when not searching */}
      {!showSearchResults && (
        <>
          {/* Categories */}
          <CategoriesSection categories={categoriesData} />

          {/* Popular Venues */}
          {state.socialHubs && state.socialHubs.length > 0 && (
            <VenuesSection
              title={`${t('common.popular')} ${t('common.venues')}`}
              venues={state.socialHubs}
              icon="star"
              seeMoreLink="/venues"
              variant="default"
            />
          )}

          {/* Favorite Venues */}
          {(favoriteHubs || []).length > 0 && (
            <VenuesSection
              title={t('common.yourFavoriteVenues')}
              venues={favoriteHubs}
              icon="heart"
              seeMoreLink="/profile#favorites"
              variant="compact"
            />
          )}

          {/* Near You */}
          <EventsSection
            title={t('common.nearYou')}
            events={(eventsNotSoldOut || []).slice(0, 3)}
            seeMoreLink="/events?sort=near-you"
          />

          {/* Last Second Offers */}
          <EventsSection
            title={t('common.lastSecondOffers')}
            events={recentEvents}
            icon="calendar"
            seeMoreAction={() => navigate('/events?sort=last-second')}
            emptyMessage={t('pages.lastSecondOffers.noRecentEvents')}
            emptyDescription={t('pages.lastSecondOffers.checkBackSoon')}
          />

          {/* Random Category Events */}
          {randomCategory && randomCategoryEvents.length > 0 && (
            <EventsSection
              title={randomCategory.name}
              events={randomCategoryEvents}
              seeMoreLink={`/events?category=${randomCategory.id}`}
            />
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <EventsSection
              title={t('common.pastEvents')}
              events={pastEvents.slice(0, 6)}
              icon="calendar"
              seeMoreAction={() => navigate('/events?filter=past')}
              layout="grid"
            />
          )}
        </>
      )}
    </div>
  )
}
