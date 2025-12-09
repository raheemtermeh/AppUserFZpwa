import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/apiStore'
import { useAuth } from '../hooks/useApi'
import Icon from '../components/Icon'
import BackButton from '../components/BackButton'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../contexts/LanguageContext'
import { toPersianNumbers, toEnglishNumbers } from '../utils/persianNumbers'
import { getErrorMessage } from '../utils/errorTranslator'

export default function LoginPage() {
  const { state, dispatch } = useStore()
  const { sendVerificationCode, verifyPhoneAndLogin, completeProfile } = useAuth()
  const { t, isRTL, language } = useLanguage()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone')
  const [showRatePopup, setShowRatePopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authData, setAuthData] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [userExists, setUserExists] = useState(false)
  const navigate = useNavigate()

  // Format phone number to +98 format
  const formatPhoneNumber = (phoneNumber: string): string => {
    const phone = phoneNumber.replace(/[^\d]/g, '')
    
    if (phone.startsWith('+98')) {
      return phone
    }
    
    if (phone.startsWith('98')) {
      return `+${phone}`
    }
    
    if (phone.startsWith('0')) {
      return `+98${phone.slice(1)}`
    }
    
    if (phone.length === 10 && phone.startsWith('9')) {
      return `+98${phone}`
    }
    
    return phone
  }

  async function sendCode() {
    if (phone.length >= 10) {
      setLoading(true)
      setError('')
      try {
        const formattedPhone = formatPhoneNumber(phone)
        const response = await sendVerificationCode(formattedPhone)
        // Check if response contains user_exists information
        if (response && typeof response.user_exists === 'boolean') {
          setUserExists(response.user_exists)
        }
        setStep('code')
        // Reset terms acceptance when moving to code step
        setAcceptTerms(false)
      } catch (error: any) {
        const translatedError = getErrorMessage(error, language)
        setError(translatedError || t('common.failedToSendCode'))
      } finally {
        setLoading(false)
      }
    }
  }

  async function verifyCode() {
    if (code.length === 4) {
      // Check if terms are accepted for new users
      if (!userExists && !acceptTerms) {
        setError(t('common.acceptTermsRequired'))
        return
      }
      
      setLoading(true)
      setError('')
      try {
        const formattedPhone = formatPhoneNumber(phone)
        const result = await verifyPhoneAndLogin(formattedPhone, code)
        
        if (result && result.is_first_time) {
          setAuthData(result)
          setStep('profile')
        } else {
          // Check if there's a redirect URL stored
          if (state.redirectUrl) {
            navigate(state.redirectUrl)
            // Clear the redirect URL after using it
            dispatch({ type: 'set_redirect_url', url: null })
          } else {
            navigate('/')
          }
          setTimeout(() => setShowRatePopup(true), 1000)
        }
      } catch (error: any) {
        const translatedError = getErrorMessage(error, language)
        setError(translatedError || t('common.loginFailed'))
      } finally {
        setLoading(false)
      }
    }
  }

  async function completeUserProfile() {
    if (!profileData.firstName || !profileData.lastName || !profileData.username) {
      setError(t('common.fillAllFields'))
      return
    }

    setLoading(true)
    setError('')
    try {
      await completeProfile(
        authData?.customer_id,
        profileData.firstName,
        profileData.lastName,
        profileData.username
      )
      // Check if there's a redirect URL stored
      if (state.redirectUrl) {
        navigate(state.redirectUrl)
        // Clear the redirect URL after using it
        dispatch({ type: 'set_redirect_url', url: null })
      } else {
        navigate('/')
      }
      setTimeout(() => setShowRatePopup(true), 1000)
    } catch (error: any) {
      const translatedError = getErrorMessage(error, language)
      setError(translatedError || t('common.failedToCompleteProfile'))
    } finally {
      setLoading(false)
    }
  }

  function skipAsGuest() {
    navigate('/')
  }

  if (state.auth.user) {
    return (
      <div className={`container-responsive p-responsive space-responsive-compact ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center space-y-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 mx-auto grid place-items-center text-3xl sm:text-4xl font-bold shadow-glow">
            {state.auth.user?.f_name?.[0] || '👤'}
          </div>
          <div className="font-bold text-responsive-xl">{state.auth.user?.f_name || ''} {state.auth.user?.l_name || ''}</div>
          <div className="text-slate-400 text-responsive-base">{t('common.alreadyLoggedIn')}</div>
        </div>
        <button 
          className="btn-ghost w-full hover-scale py-3.5" 
          onClick={() => dispatch({ type: 'logout' })}
        >
          {t('common.logout')}
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="hero-gradient p-7 sm:p-9 text-center relative overflow-hidden">
        <div className="absolute top-5 left-5 z-20">
          <BackButton fallbackPath="/" />
        </div>
        <div className={`absolute top-5 z-20 ${isRTL ? 'left-20 sm:left-24' : 'right-5'}`}>
          <LanguageSwitcher />
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-15 z-0">
          <div className="absolute top-12 left-12 w-24 h-24 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full blur-xl"></div>
          <div className="absolute top-24 right-24 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg"></div>
          <div className="absolute bottom-12 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-md"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-7 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-glow-pink">
            {step === 'phone' && <img src="/logo.png" alt="Funzone" className="w-14 h-14 sm:w-18 sm:h-18 object-contain" />}
            {step === 'code' && <img src="/logo.png" alt="Funzone" className="w-14 h-14 sm:w-18 sm:h-18 object-contain" />}
            {step === 'profile' && <img src="/logo.png" alt="Funzone" className="w-14 h-14 sm:w-18 sm:h-18 object-contain" />}
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient mb-3 sm:mb-4">
            {t('pages.login.title')}
          </h1>
          <p className="text-responsive-lg text-slate-300">{t('pages.login.subtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-5 sm:p-7 md:p-9 space-y-7 md:space-y-9">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 sm:p-5 text-red-400 text-responsive-base text-center">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <label className="text-responsive-base font-semibold text-slate-200 flex items-center gap-3">
                <span className="text-violet-400 text-xl">📱</span>
                {t('common.phoneNumber')}
              </label>
              <div className="search-bar hover:shadow-responsive-lg transition-all duration-300 hover:scale-[1.02]" dir="ltr">
                <div className="flex items-center gap-3 text-violet-400">
                  <span className="text-xl">📱</span>
                  <span className="text-slate-300 text-base font-semibold">{language === 'fa' ? '+۹۸' : '+98'}</span>
                </div>
                <input
                  type="tel"
                  placeholder={language === 'fa' ? '۹۳۰۴۰۴۱۵۳۳' : '9304041533'}
                  value={language === 'fa' ? toPersianNumbers(phone) : phone}
                  onChange={(e) => setPhone(toEnglishNumbers(e.target.value).replace(/[^\d]/g, '').slice(0, 10))}
                  className="bg-transparent flex-1 outline-none text-slate-100 placeholder-slate-400 text-responsive-lg focus-ring"
                  dir="ltr"
                />
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span>ℹ️</span>
                {t('common.enterIranianMobile')}
              </p>
            </div>
            
            <button
              onClick={sendCode}
              disabled={phone.length < 10 || loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed hover-scale py-3.5 text-lg"
            >
              {loading ? t('common.sending') : t('common.sendCode')}
            </button>
          </div>
        ) : step === 'code' ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <label className="text-responsive-base font-semibold text-slate-200 flex items-center gap-3">
                <span className="text-cyan-400 text-xl">🔐</span>
                {t('common.verificationCode')}
              </label>
              <div className="search-bar hover:shadow-responsive-lg transition-all duration-300 hover:scale-[1.02]" dir="ltr">
                <div className="flex items-center gap-3 text-cyan-400">
                  <span className="text-xl">🎫</span>
                </div>
                <input
                  type="text"
                  placeholder={language === 'fa' ? '۱۲۳۴' : '1234'}
                  value={language === 'fa' ? toPersianNumbers(code) : code}
                  onChange={(e) => setCode(toEnglishNumbers(e.target.value).replace(/[^\d]/g, '').slice(0, 4))}
                  className="bg-transparent flex-1 outline-none text-slate-100 placeholder-slate-400 text-center text-xl sm:text-2xl md:text-3xl tracking-widest focus-ring"
                  dir="ltr"
                />
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <span>📨</span>
                {language === 'fa' 
                  ? t('common.codeSentTo').replace('+98{phone}', `۹۸${toPersianNumbers(phone)}+`)
                  : t('common.codeSentTo').replace('{phone}', phone)
                }
              </p>
            </div>
            
            {/* Terms and Conditions Checkbox - Only show if user doesn't exist */}
            {!userExists && (
              <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1.5 w-5 h-5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                />
                <label htmlFor="terms-checkbox" className="text-base text-slate-200 cursor-pointer">
                  {t('common.acceptTerms')}
                </label>
              </div>
            )}
            
            <button
              onClick={verifyCode}
              disabled={code.length !== 4 || loading || (!userExists && !acceptTerms)}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed hover-scale py-3.5 text-lg"
            >
              {loading ? t('common.verifying') : t('common.continue')}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="btn-ghost w-full hover-scale py-3.5 text-lg"
            >
              {t('common.back')} {t('common.to')} {t('common.phone')}
            </button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shadow-glow mb-5">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-responsive-2xl font-extrabold text-slate-100 flex items-center justify-center gap-3">
                <span className="text-blue-400">👤</span>
                {t('common.completeProfile')}
              </h2>
              <p className="text-responsive-base text-slate-400 flex items-center justify-center gap-2">
                <span>ℹ️</span>
                {t('common.provideInformation')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-3">
                <label className="text-responsive-base font-semibold text-slate-200 flex items-center gap-3">
                  <span className="text-blue-400 text-xl">👤</span>
                  {t('common.firstName')}
                </label>
                <div className="search-bar hover:shadow-responsive-lg transition-all duration-300 hover:scale-[1.01]">
                  <span className="text-blue-400 text-xl">👤</span>
                  <input
                    type="text"
                    placeholder={t('common.enterFirstName')}
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="bg-transparent flex-1 outline-none text-slate-100 placeholder-slate-400 text-responsive-base focus-ring"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-responsive-base font-semibold text-slate-200 flex items-center gap-3">
                  <span className="text-green-400 text-xl">👤</span>
                  {t('common.lastName')}
                </label>
                <div className="search-bar hover:shadow-responsive-lg transition-all duration-300 hover:scale-[1.01]">
                  <span className="text-green-400 text-xl">👤</span>
                  <input
                    type="text"
                    placeholder={t('common.enterLastName')}
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="bg-transparent flex-1 outline-none text-slate-100 placeholder-slate-400 text-responsive-base focus-ring"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-responsive-base font-semibold text-slate-200 flex items-center gap-3">
                <span className="text-violet-400 text-xl">🏷️</span>
                {t('common.username')}
              </label>
              <div className="search-bar hover:shadow-responsive-lg transition-all duration-300 hover:scale-[1.01]">
                <span className="text-violet-400 text-xl">🏷️</span>
                <input
                  type="text"
                  placeholder={t('common.enterUsername')}
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="bg-transparent flex-1 outline-none text-slate-100 placeholder-slate-400 text-responsive-base focus-ring"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
            
            <button
              onClick={completeUserProfile}
              disabled={!profileData.firstName || !profileData.lastName || !profileData.username || loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed hover-scale py-3.5 text-lg"
            >
              {loading ? t('common.completing') : t('common.completeProfile')}
            </button>
            
            <button
              onClick={() => setStep('code')}
              className="btn-ghost w-full hover-scale py-3.5 text-lg"
            >
              {t('common.back')} {t('common.to')} {t('common.verificationCode')}
            </button>
          </div>
        )}

        <div className="text-center pt-5">
          <button 
            onClick={skipAsGuest} 
            className="text-slate-400 hover:text-slate-300 text-responsive-base transition-colors"
          >
            {t('common.skipAsGuest')}
          </button>
        </div>
      </div>

      {/* Rate Popup */}
      {showRatePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-5 sm:p-7 z-50">
          <div className="glass-card p-5 sm:p-7 max-w-md w-full text-center space-y-5 sm:space-y-6 animate-scale-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 mx-auto grid place-items-center shadow-glow-pink">
              <Icon name="star" className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-responsive-2xl font-extrabold">{t('common.rateOurApp')}</h3>
            <p className="text-responsive-base text-slate-300">{t('common.enjoyingExperience')}</p>
            <div className="flex gap-4 sm:gap-5">
              <button
                onClick={() => setShowRatePopup(false)}
                className="btn-ghost flex-1 hover-scale py-3.5"
              >
                {t('common.later')}
              </button>
              <button
                onClick={() => setShowRatePopup(false)}
                className="btn-secondary flex-1 hover-scale py-3.5"
              >
                {t('common.rateNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}