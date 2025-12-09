import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { formatPersianNumber } from '../utils/persianNumbers'
import BackButton from '../components/BackButton'
import { useLanguage } from '../contexts/LanguageContext'

interface Venue {
  id: string
  name: string
  image: string
  rating: number
  location: string
  category: string
  description: string
  events: Event[]
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  price: string
  image: string
  category: string
  attendees: number
  maxAttendees: number
}

export default function VenuePage() {
  const { t, isRTL } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigate = useNavigate()

  const venues: Venue[] = [
    // Cafe Venues
    {
      id: '1',
      name: 'The Grand Cafe',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      rating: 4.8,
      location: 'Downtown District',
      category: 'Cafe',
      description: 'Elegant cafe with premium coffee and cozy atmosphere',
      events: [
        {
          id: '1',
          title: 'Coffee Tasting Workshop',
          date: '2024-01-15',
          time: '14:00',
          price: '$25',
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
          category: 'Workshop',
          attendees: 12,
          maxAttendees: 20
        },
        {
          id: '2',
          title: 'Live Jazz Night',
          date: '2024-01-20',
          time: '19:00',
          price: '$15',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
          category: 'Music',
          attendees: 45,
          maxAttendees: 60
        }
      ]
    },
    {
      id: '2',
      name: 'Brew & Bean',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      rating: 4.6,
      location: 'Westside Quarter',
      category: 'Cafe',
      description: 'Artisanal coffee shop with specialty brews and pastries',
      events: [
        {
          id: '3',
          title: 'Latte Art Class',
          date: '2024-01-18',
          time: '16:00',
          price: '$30',
          image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop',
          category: 'Workshop',
          attendees: 8,
          maxAttendees: 15
        }
      ]
    },
    {
      id: '3',
      name: 'Urban Tea House',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
      rating: 4.7,
      location: 'Tea District',
      category: 'Cafe',
      description: 'Traditional tea ceremonies and modern tea culture',
      events: [
        {
          id: '4',
          title: 'Tea Ceremony Workshop',
          date: '2024-01-22',
          time: '15:00',
          price: '$40',
          image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
          category: 'Cultural',
          attendees: 6,
          maxAttendees: 10
        }
      ]
    },

    // Gaming Venues
    {
      id: '4',
      name: 'GameZone Arena',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      rating: 4.6,
      location: 'Gaming District',
      category: 'Gaming',
      description: 'Ultimate gaming destination with latest consoles and VR experiences',
      events: [
        {
          id: '5',
          title: 'Mafia Game Night',
          date: '2024-01-18',
          time: '18:00',
          price: '$20',
          image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
          category: 'Social',
          attendees: 8,
          maxAttendees: 12
        },
        {
          id: '6',
          title: 'Board Game Tournament',
          date: '2024-01-25',
          time: '15:00',
          price: '$30',
          image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300&h=200&fit=crop',
          category: 'Competition',
          attendees: 24,
          maxAttendees: 32
        }
      ]
    },
    {
      id: '5',
      name: 'Pixel Paradise',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      rating: 4.5,
      location: 'Tech Valley',
      category: 'Gaming',
      description: 'PC gaming center with high-end rigs and esports events',
      events: [
        {
          id: '7',
          title: 'CS:GO Tournament',
          date: '2024-01-19',
          time: '14:00',
          price: '$25',
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop',
          category: 'Esports',
          attendees: 32,
          maxAttendees: 64
        }
      ]
    },
    {
      id: '6',
      name: 'Retro Arcade',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      rating: 4.4,
      location: 'Nostalgia Lane',
      category: 'Gaming',
      description: 'Classic arcade games and pinball machines',
      events: [
        {
          id: '8',
          title: 'Pinball Championship',
          date: '2024-01-21',
          time: '17:00',
          price: '$15',
          image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
          category: 'Competition',
          attendees: 16,
          maxAttendees: 24
        }
      ]
    },

    // Cinema Venues
    {
      id: '7',
      name: 'Cinema Paradiso',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
      rating: 4.7,
      location: 'Entertainment Quarter',
      category: 'Cinema',
      description: 'Premium movie theater with luxury seating and gourmet snacks',
      events: [
        {
          id: '9',
          title: 'Indie Film Showcase',
          date: '2024-01-17',
          time: '19:30',
          price: '$22',
          image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=200&fit=crop',
          category: 'Cinema',
          attendees: 85,
          maxAttendees: 120
        }
      ]
    },
    {
      id: '8',
      name: 'Drive-In Deluxe',
      image: 'https://images.unsplash.com/photo-1534809027769-b017ea2ece99?w=400&h=300&fit=crop',
      rating: 4.3,
      location: 'Outdoor Park',
      category: 'Cinema',
      description: 'Classic drive-in movie experience under the stars',
      events: [
        {
          id: '10',
          title: '80s Movie Marathon',
          date: '2024-01-24',
          time: '20:00',
          price: '$18',
          image: 'https://images.unsplash.com/photo-1534809027769-b017ea2ece99?w=300&h=200&fit=crop',
          category: 'Cinema',
          attendees: 42,
          maxAttendees: 75
        }
      ]
    }
  ]

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(venues.map(v => v.category)))]

  // Filter venues by category
  const filteredVenues = selectedCategory === 'all' 
    ? venues 
    : venues.filter(venue => venue.category === selectedCategory)

  return (
    <div className={`space-y-7 md:space-y-9 max-w-7xl mx-auto px-5 sm:px-7 lg:px-9 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 pt-5">
        <BackButton fallbackPath="/" />
        <div>
          <h1 className="text-responsive-3xl font-extrabold text-gradient">{t('pages.venues.title')}</h1>
          <p className="text-responsive-base text-slate-400 mt-2">
            {t('pages.venues.subtitle')}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`chip px-4 py-2.5 text-base font-semibold transition-all duration-200 ${
              selectedCategory === category 
                ? 'chip-active shadow-glow' 
                : 'hover:bg-slate-700/60 hover:border-slate-600'
            }`}
          >
            {category === 'all' ? t('common.all') : category}
          </button>
        ))}
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="card p-8 text-center">
          <Icon name="map" className="w-16 h-16 text-slate-600 mx-auto mb-5" />
          <h3 className="text-xl font-semibold text-slate-400 mb-3">
            {t('common.noVenuesFound')}
          </h3>
          <p className="text-base text-slate-500 mb-5">
            {t('common.tryDifferentCategory')}
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="btn-primary px-6 py-3 text-lg"
          >
            {t('common.showAllVenues')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {filteredVenues.map(venue => (
            <div key={venue.id} className="card hover-lift">
              {/* Venue Image */}
              <div className="relative">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-venue.jpg'
                  }}
                />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full">
                  <Icon name="star" className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{venue.rating}</span>
                </div>
              </div>

              {/* Venue Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-slate-100 line-clamp-1">{venue.name}</h3>
                  <span className="chip text-xs">{venue.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Icon name="location" className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{venue.location}</span>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {venue.description}
                </p>

                {/* Events Summary */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-slate-300">
                      {formatPersianNumber(venue.events.length)} {t('common.events')}
                    </span>
                  </div>
                  <NavLink 
                    to={`/venue/${venue.id}`} 
                    className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                  >
                    {t('common.viewDetail')}
                  </NavLink>
                </div>

                {/* Upcoming Events Preview */}
                <div className="space-y-3">
                  {venue.events.slice(0, 2).map(event => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-200 text-sm line-clamp-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-emerald-400 font-semibold text-sm">{event.price}</span>
                          <span className="text-xs text-slate-400">
                            {formatPersianNumber(event.attendees)}/{formatPersianNumber(event.maxAttendees)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {venue.events.length > 2 && (
                    <div className="text-center pt-2">
                      <span className="text-slate-400 text-sm">
                        + {formatPersianNumber(venue.events.length - 2)} {t('common.moreEvents')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}