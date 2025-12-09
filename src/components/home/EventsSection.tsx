import { NavLink, useNavigate } from 'react-router-dom'
import Icon from '../Icon'
import EventCard from '../EventCard'
import SectionHeader from '../SectionHeader'
import { useLanguage } from '../../contexts/LanguageContext'
import type { Event } from '../../services/api'

interface EventsSectionProps {
  title: string
  events: Event[]
  icon?: string
  seeMoreLink?: string
  seeMoreAction?: () => void
  emptyMessage?: string
  emptyDescription?: string
  layout?: 'horizontal' | 'grid'
}

export default function EventsSection({
  title,
  events,
  icon,
  seeMoreLink,
  seeMoreAction,
  emptyMessage,
  emptyDescription,
  layout = 'horizontal'
}: EventsSectionProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSeeMore = () => {
    if (seeMoreAction) {
      seeMoreAction()
    } else if (seeMoreLink) {
      navigate(seeMoreLink)
    }
  }

  if (events.length === 0 && emptyMessage) {
    return (
      <section className="space-y-6">
        <SectionHeader title={title} />
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-12 text-center">
          {icon && <Icon name={icon} className="w-16 h-16 text-slate-600 mx-auto mb-4" />}
          <h3 className="text-xl font-semibold text-slate-400 mb-2">{emptyMessage}</h3>
          {emptyDescription && (
            <p className="text-base text-slate-500">{emptyDescription}</p>
          )}
        </div>
      </section>
    )
  }

  if (events.length === 0) return null

  return (
    <section className="space-y-6">
      <SectionHeader
        title={title}
        actionLabel={t('common.seeAll')}
        onAction={handleSeeMore}
      />

      {layout === 'horizontal' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {events.map(event => (
            <div
              key={event.id}
              className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] snap-start flex-shrink-0"
            >
              <EventCard e={event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {events.map(event => (
            <EventCard key={event.id} e={event} />
          ))}
        </div>
      )}
    </section>
  )
}

