import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useStore } from '../../state/apiStore'
import Icon from '../Icon'
import { formatPersianNumber } from '../../utils/persianNumbers'

interface CategoriesSectionProps {
  categories: Array<{
    id: string
    name: string
    icon: string
  }>
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()
  const { state } = useStore()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/events?category=${categoryId}`)
  }

  const categoriesWithStats = useMemo(() => {
    const allEvents = state.events || []
    const activeEvents = allEvents.filter(event =>
      event &&
      event.category &&
      event.event_status !== 'completed' &&
      event.event_status !== 'cancelled'
    )

    return categories.map(category => {
      const categoryEvents = activeEvents.filter(event => event.category?.id === category.id)
      const eventCount = categoryEvents.length

      const emojiMap: Record<string, string> = {
        'مافیا': '🕵️',
        'تماشای فیلم': '🎬',
        'تماشای مسابقات ورزشی': '⚽',
        'بازی‌های گروهی': '🎮',
        'بازی‌های رومیزی': '🎲',
        'موسیقی زنده': '🎵',
        'کتابخوانی': '📚',
        'ادایی': '✨',
      }

      return {
        ...category,
        eventCount,
        emoji: emojiMap[category.name] || '🎯',
        isPopular: eventCount > 5,
      }
    }).sort((a, b) => (a.isPopular !== b.isPopular ? (a.isPopular ? -1 : 1) : b.eventCount - a.eventCount))
  }, [categories, state.events])

  const getCategoryColors = (index: number) => {
    const schemes = [
      { glow: 'shadow-cyan-400/40', text: 'text-cyan-300' },
      { glow: 'shadow-purple-400/40', text: 'text-purple-300' },
      { glow: 'shadow-pink-400/40', text: 'text-pink-300' },
      { glow: 'shadow-emerald-400/40', text: 'text-emerald-300' },
      { glow: 'shadow-amber-400/40', text: 'text-amber-300' },
      { glow: 'shadow-indigo-400/40', text: 'text-indigo-300' },
    ]
    return schemes[index % schemes.length]
  }

  if (categories.length === 0) {
    return (
      <section className="p-6 md:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/40">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/70 border border-slate-600/50 mb-4 animate-pulse">
            <span className="text-4xl">📂</span>
          </div>
          <p className="text-slate-400 text-lg">{t('common.loadingCategories')}</p>
        </div>
      </section>
    )
  }

  const totalEvents = categoriesWithStats.reduce((sum, cat) => sum + cat.eventCount, 0)

  return (
    <section className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
            {t('common.eventCategories')}
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            {formatPersianNumber(totalEvents)} {t('common.events')} — {categoriesWithStats.length} {t('common.categories')}
          </p>
        </div>

        <NavLink
          to="/categories"
          className="px-5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg flex items-center gap-2 backdrop-blur-md"
        >
          <span className="text-sm font-semibold text-slate-300">{t('common.seeMore')}</span>
          <Icon
            name="arrow-right"
            className={`w-4 h-4 text-cyan-300 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1`}
          />
        </NavLink>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 relative">
        {categoriesWithStats.map((category, index) => {
          const colors = getCategoryColors(index)
          const isHovered = hoveredCategory === category.id
          const hasEvents = category.eventCount > 0

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              disabled={!hasEvents}
              className={`
                relative flex flex-col items-center p-4 md:p-5 rounded-2xl 
                bg-slate-900/70 border border-slate-700/40 backdrop-blur-xl
                transition-all duration-300 
                ${isHovered ? `-translate-y-2 shadow-2xl ${colors.glow}` : 'shadow-lg'}
                ${!hasEvents ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >

              {category.isPopular && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-xl">
                  🔥 محبوب
                </div>
              )}

              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-slate-800/60 rounded-xl border border-slate-700/50 shadow-inner">
                <span className={`text-4xl transition-all ${isHovered ? 'scale-110' : ''}`}>
                  {category.emoji}
                </span>
              </div>

              <div className="mt-3 text-center">
                <span className={`block text-xs md:text-sm font-bold transition-all ${isHovered ? colors.text : 'text-slate-300'}`}>
                  {t(`common.categoryNames.${category.name}`) || category.name}
                </span>

                <div className="
                  mt-2 inline-flex items-center gap-2 px-3 py-1 
                  rounded-full bg-slate-800/60 border border-slate-600/40 
                  text-xs text-slate-400
                ">
                  <Icon name="ticket" className="w-3 h-3" />
                  {formatPersianNumber(category.eventCount)}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
