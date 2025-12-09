import { useState } from 'react'
import Icon from '../Icon'
import SearchResults from '../SearchResults'
import { useLanguage } from '../../contexts/LanguageContext'
import { useStore } from '../../state/apiStore'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export default function SearchBar({ searchQuery, onSearchChange, onSearch, onClear }: SearchBarProps) {
  const { t, isRTL } = useLanguage()
  const { dispatch } = useStore()
  const [showResults, setShowResults] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearchChange(value)
    setShowResults(value.trim().length > 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  const handleClear = () => {
    onClear()
    setShowResults(false)
    dispatch({ type: 'clear_filters' })
  }

  const handleCloseResults = () => {
    setShowResults(false)
    onClear()
  }

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
        <Icon name="search" className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={t('common.searchEvents')}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-400 text-base"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
            aria-label={t('common.clear')}
          >
            <Icon name="close" className="w-4 h-4 text-slate-400" />
          </button>
        )}
        <button
          onClick={onSearch}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          {t('common.search')}
        </button>
      </div>

      {showResults && searchQuery && (
        <SearchResults query={searchQuery} onClose={handleCloseResults} />
      )}
    </div>
  )
}

