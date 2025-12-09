import { useState, useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../state/apiStore'
import EventCard from './EventCard'
import SocialHubCard from './SocialHubCard'
import Icon from './Icon'
import { useLanguage } from '../contexts/LanguageContext'
import type { Event, SocialHub, EventCategory } from '../services/api'

interface SearchResultsProps {
  query: string
  onClose: () => void
}

interface SearchData {
  events: Event[]
  venues: SocialHub[]
  categories: EventCategory[]
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const { t, isRTL } = useLanguage()
  const { state } = useStore()
  const [hasSearched, setHasSearched] = useState(false)

  // Client-side search function
  const searchData = useMemo(() => {
    if (!query.trim()) {
      return { events: [], venues: [], categories: [] }
    }

    const searchTerm = query.toLowerCase().trim()
    
    // Search events by name and venue name
    const filteredEvents = (state.events || []).filter(event => {
      if (!event) return false
      return (
        event.name?.toLowerCase().includes(searchTerm) ||
        event.social_hub?.name?.toLowerCase().includes(searchTerm) ||
        event.category?.name?.toLowerCase().includes(searchTerm)
      )
    })

    // Search venues by name and address
    const filteredVenues = (state.socialHubs || []).filter(venue => {
      if (!venue) return false
      return (
        venue.name?.toLowerCase().includes(searchTerm) ||
        venue.address?.toLowerCase().includes(searchTerm)
      )
    })

    // Search categories by name
    const filteredCategories = (state.eventCategories || []).filter(category => {
      if (!category) return false
      return category.name?.toLowerCase().includes(searchTerm)
    })

    return {
      events: filteredEvents,
      venues: filteredVenues,
      categories: filteredCategories
    }
  }, [query, state.events, state.socialHubs, state.eventCategories])

  useEffect(() => {
    if (query.trim()) {
      setHasSearched(true)
    } else {
      setHasSearched(false)
    }
  }, [query])

  if (!hasSearched && !query.trim()) {
    return null
  }

  const hasResults = searchData.events.length > 0 || searchData.venues.length > 0 || searchData.categories.length > 0

  if (!hasResults) {
    return (
      <div className="space-y-6">
        <div className="card p-6 text-center">
          <Icon name="search" className="w-14 h-14 text-slate-600 mx-auto mb-5" />
          <h3 className="text-xl font-semibold text-slate-400 mb-3">{t('common.noResultsFound')}</h3>
          <p className="text-base text-slate-500">{t('common.tryDifferentKeywords')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Events Results */}
      {searchData.events.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-200">
              {t('common.events')} ({searchData.events.length})
            </h3>
            <NavLink 
              to={`/events?search=${encodeURIComponent(query)}`}
              className="flex items-center gap-2 text-base text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>{t('common.seeMore')}</span>
              <Icon name="arrow-right" className="w-5 h-5" />
            </NavLink>
          </div>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {searchData.events.slice(0, 5).map(event => (
              <div key={event.id} className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] snap-start flex-shrink-0">
                <EventCard e={event} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Venues Results */}
      {searchData.venues.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-200">
              {t('common.venues')} ({searchData.venues.length})
            </h3>
            <NavLink 
              to={`/venues?search=${encodeURIComponent(query)}`}
              className="flex items-center gap-2 text-base text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>{t('common.seeMore')}</span>
              <Icon name="arrow-right" className="w-5 h-5" />
            </NavLink>
          </div>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {searchData.venues.slice(0, 5).map(venue => (
              <div key={venue.id} className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] snap-start flex-shrink-0">
                <SocialHubCard hub={venue} variant="default" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Results */}
      {searchData.categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-200">
              {t('common.categories')} ({searchData.categories.length})
            </h3>
            <NavLink 
              to={`/categories?search=${encodeURIComponent(query)}`}
              className="flex items-center gap-2 text-base text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>{t('common.seeMore')}</span>
              <Icon name="arrow-right" className="w-5 h-5" />
            </NavLink>
          </div>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {searchData.categories.slice(0, 5).map(category => (
              <NavLink
                key={category.id}
                to={`/events?category=${category.id}`}
                className="min-w-[140px] sm:min-w-[160px] md:min-w-[180px] text-center space-y-4 snap-start flex-shrink-0 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 mx-auto grid place-items-center text-3xl sm:text-4xl shadow-glow hover:shadow-glow-lg transition-all duration-200">
                  🎯
                </div>
                <span className="text-base sm:text-lg font-semibold text-slate-300 hover:text-white transition-colors duration-200">
                  {category.name}
                </span>
              </NavLink>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}