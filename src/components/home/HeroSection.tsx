import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatPersianNumber } from '../../utils/persianNumbers'
import Icon from '../Icon'
import SearchResults from '../SearchResults'

interface HeroSectionProps {
  eventsCount: number
  venuesCount: number
  favoritesCount: number
}

export default function HeroSection({ eventsCount, venuesCount, favoritesCount }: HeroSectionProps) {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()
  const [activeStat, setActiveStat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.trim().length > 0)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const handleCloseResults = () => {
    setShowSearchResults(false)
    handleClearSearch()
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 p-6 md:p-10 lg:p-12">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-r from-violet-500/5 to-pink-500/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
        {/* Left content */}
        <div className="flex-1 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 backdrop-blur-sm">
                <span className="text-sm font-medium text-cyan-200">
                  {t('common.welcomeBadge') || 'تجربه جدید رویدادهای گروهی'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                  {t('pages.home.title')}
                </span>
              </h1>
            </div>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {t('pages.home.subtitle')}
            </p>
          </div>

          {/* Stats with interactive cards */}
          <div className="flex flex-wrap gap-4">
            <div
              className={`flex flex-col p-5 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${activeStat === 'events'
                ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-400/40 transform -translate-y-1 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/30 border-slate-700/50'
                }`}
              onMouseEnter={() => setActiveStat('events')}
              onMouseLeave={() => setActiveStat(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-slate-400">{t('common.events')}</span>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 text-base md:text-lg">🎭</span>
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {formatPersianNumber(eventsCount)}
              </div>
              <div className="h-1 w-full bg-slate-700/50 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                  style={{ width: `${Math.min(eventsCount, 100)}%` }}
                ></div>
              </div>
            </div>

            {venuesCount > 0 && (
              <div
                className={`flex flex-col p-5 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${activeStat === 'venues'
                  ? 'bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-400/40 transform -translate-y-1 shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                onMouseEnter={() => setActiveStat('venues')}
                onMouseLeave={() => setActiveStat(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-slate-400">{t('common.venues')}</span>
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <span className="text-violet-400 text-base md:text-lg">📍</span>
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatPersianNumber(venuesCount)}
                </div>
                <div className="h-1 w-full bg-slate-700/50 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                    style={{ width: `${Math.min(venuesCount * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {favoritesCount > 0 && (
              <div
                className={`flex flex-col p-5 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${activeStat === 'favorites'
                  ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-400/40 transform -translate-y-1 shadow-lg shadow-pink-500/20'
                  : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                onMouseEnter={() => setActiveStat('favorites')}
                onMouseLeave={() => setActiveStat(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-slate-400">{t('common.favorites')}</span>
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <span className="text-pink-400 text-base md:text-lg">❤️</span>
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatPersianNumber(favoritesCount)}
                </div>
                <div className="h-1 w-full bg-slate-700/50 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
                    style={{ width: `${Math.min(favoritesCount * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right illustration */}
        <div className="flex-shrink-0 lg:w-1/3">
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden">
            {/* Abstract geometric design */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10">
              {/* Floating shapes */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/30 to-transparent animate-float"></div>
              <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-gradient-to-r from-violet-500/30 to-transparent animate-float delay-1000"></div>
              <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-lg bg-gradient-to-r from-pink-500/20 to-transparent rotate-45 animate-float delay-500"></div>

              {/* Central decorative element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-spin-slow"></div>

                  {/* Inner ring */}
                  <div className="absolute inset-8 rounded-full border-2 border-violet-400/20 animate-spin-slow-reverse"></div>

                  {/* Center content */}
                  <div className="absolute inset-12 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 backdrop-blur-sm border border-cyan-400/30 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-3xl">✨</div>
                      <div className="text-sm font-medium text-white">Join Now</div>
                    </div>
                  </div>

                  {/* Floating tags */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/30 to-cyan-400/20 border border-cyan-400/30 backdrop-blur-sm">
                    <span className="text-xs text-cyan-200">🎭 {t('common.mafia')}</span>
                  </div>
                  <div className="absolute top-1/4 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/30 to-violet-400/20 border border-violet-400/30 backdrop-blur-sm">
                    <span className="text-xs text-violet-200">🎬 {t('common.movieWatching') || 'فیلم'}</span>
                  </div>
                  <div className="absolute bottom-1/4 -left-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/30 to-pink-400/20 border border-pink-400/30 backdrop-blur-sm">
                    <span className="text-xs text-pink-200">🎮 {t('common.gamingGroup')}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/30 to-violet-500/20 border border-cyan-400/30 backdrop-blur-sm">
                    <span className="text-xs text-slate-200">🎵 {t('common.music')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero Search Section */}
      <div className="relative z-20 mt-8 md:mt-12 lg:mt-16">
        <div className="relative">
          {/* Search Container with Glassmorphism */}
          <div
            className={`relative w-full transition-all duration-500 ${isSearchFocused
              ? 'scale-[1.02]'
              : 'scale-100'
              }`}
          >
            {/* Glowing background effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>

            {/* Main search box */}
            <div
              className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border transition-all duration-300 ${isSearchFocused
                ? 'border-cyan-400/60 shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-400/30'
                : 'border-slate-700/50 shadow-lg shadow-slate-900/50'
                }`}
            >
              {/* Search Icon */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-xl blur-md"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-400/30">
                  <Icon name="search" className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                </div>
              </div>

              {/* Input Container */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={t('common.searchEvents') || 'جستجوی رویدادها، مکان‌ها و دسته‌بندی‌ها...'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="w-full px-4 py-3 sm:py-4 md:py-5 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                />

                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group"
                    aria-label={t('common.clear') || 'پاک کردن'}
                  >
                    <Icon name="close" className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className={`relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 transform ${searchQuery.trim()
                  ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white hover:from-cyan-400 hover:via-violet-400 hover:to-pink-400 hover:scale-105 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>{t('common.search') || 'جستجو'}</span>
                  <Icon name="arrow-right" className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </span>
                {searchQuery.trim() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-xl opacity-0 hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                )}
              </button>
            </div>

            {/* Quick Search Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {t('common.quickSearch') || 'جستجوی سریع:'}
              </span>
              {['🎭 مافیا', '🎬 فیلم', '🎮 بازی', '🎵 موزیک'].map((tag, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(tag.split(' ')[1])
                    setShowSearchResults(true)
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {showSearchResults && searchQuery && (
            <div className="mt-4 animate-slide-up">
              <SearchResults query={searchQuery} onClose={handleCloseResults} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}