import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../state/apiStore";
import { useLanguage } from "../contexts/LanguageContext";
import { formatPersianNumber, formatNumber } from "../utils/persianNumbers";
import { toggleFavoriteWithBackend } from "../utils/favoriteUtils";
import { handleImageErrorWithRetry } from "../utils/imageRetry";
import Icon from "./Icon";
import SignInPopup from "./SignInPopup";
import type { SocialHub } from "../services/api";

interface SocialHubCardProps {
  hub: SocialHub;
  variant?: "default" | "compact" | "featured";
}

export default function SocialHubCard({
  hub,
  variant = "default",
}: SocialHubCardProps) {
  const { state, dispatch } = useStore();
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Add null check for hub
  if (!hub || !hub.id) {
    return null;
  }

  const isFavorite = state.favorites.includes(hub.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!state.auth.user || !state.auth.isLoggedIn) {
      setShowSignInPopup(true);
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    await toggleFavoriteWithBackend({
      socialHubId: hub.id,
      userId: state.auth.user?.id || "",
      accessToken,
      dispatch,
      navigate,
      state,
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // استایل‌های سبک و بهینه
  const lightStyles = {
    card: "group relative block bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-lg",
    imageContainer: "relative overflow-hidden",
    image:
      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
    favoriteButton: `absolute top-3 right-3 z-20 p-1.5 rounded-lg transition-all duration-200 ${
      isFavorite
        ? "bg-red-500 text-white shadow"
        : "bg-black/50 text-white/70 hover:bg-black/70"
    }`,
    gradientOverlay:
      "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent",
  };

  if (variant === "compact") {
    return (
      <>
        <NavLink
          to={`/venue/${hub.id}`}
          className="flex gap-4 p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl hover:bg-slate-800/30 transition-colors duration-200"
        >
          {/* Image */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 bg-slate-700 animate-pulse" />
            )}

            <img
              src={
                hub.image_url ||
                hub.gallery_images?.[0] ||
                "/placeholder-venue.jpg"
              }
              className="w-full h-full object-cover"
              alt={hub.name}
              onLoad={handleImageLoad}
              onError={(e) => handleImageErrorWithRetry(e, 2, 500)}
            />

            <button
              onClick={handleToggleFavorite}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-md hover:bg-black/70 transition-colors"
            >
              <Icon
                name="heart"
                className={`w-3 h-3 ${
                  isFavorite ? "text-red-400 fill-current" : "text-white/70"
                }`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-2">
              <h3 className="font-semibold text-white line-clamp-1 text-sm sm:text-base">
                {hub.name}
              </h3>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                <Icon name="location" className="w-3 h-3" />
                <span className="line-clamp-1">{hub.address}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Icon
                  name="star"
                  className="w-3 h-3 text-yellow-400 fill-current"
                />
                <span className="text-xs text-slate-300 font-medium">
                  {hub.average_rating
                    ? formatNumber(hub.average_rating, language, 1)
                    : "N/A"}
                </span>
              </div>

              <div className="text-xs text-cyan-400 font-medium">
                {hub.owner.name}
              </div>
            </div>

            {/* Events Count */}
            <div className="text-xs text-slate-400">
              {formatNumber(hub.events_count, language)} {t("common.events")}
            </div>
          </div>
        </NavLink>

        <SignInPopup
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          redirectUrl={window.location.pathname + window.location.search}
        />
      </>
    );
  }

  if (variant === "featured") {
    return (
      <>
        <NavLink
          to={`/venue/${hub.id}`}
          className="group block bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors duration-200"
        >
          {/* Image */}
          <div className="relative h-64 sm:h-72">
            {imageLoading && (
              <div className="absolute inset-0 bg-slate-700 animate-pulse" />
            )}

            <img
              src={
                hub.image_url ||
                hub.gallery_images?.[0] ||
                "/placeholder-venue.jpg"
              }
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={hub.name}
              onLoad={handleImageLoad}
              onError={(e) => handleImageErrorWithRetry(e, 2, 500)}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="px-3 py-1 bg-amber-500/90 text-white text-sm font-semibold rounded-lg flex items-center gap-1">
                <Icon name="star" className="w-3 h-3 fill-current" />
                <span>
                  {hub.average_rating && hub.average_rating > 0
                    ? formatNumber(hub.average_rating, language, 1)
                    : "New"}
                </span>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
            >
              <Icon
                name="heart"
                className={`w-4 h-4 ${
                  isFavorite ? "text-red-400 fill-current" : "text-white/70"
                }`}
              />
            </button>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white mb-2">{hub.name}</h3>
              <div className="flex items-center gap-2 text-white/90">
                <Icon name="location" className="w-4 h-4 text-cyan-400" />
                <span className="line-clamp-1">{hub.address}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Owner & Events */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-cyan-300 font-medium">{hub.owner.name}</div>
              <div className="text-slate-300 text-sm">
                {formatNumber(hub.events_count, language)} {t("common.events")}
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
              {hub.description || t("common.noDescription")}
            </p>

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {t("common.updatedRecently")}
              </div>
              <div className="inline-flex items-center gap-1 text-violet-300 group-hover:text-violet-200 transition-colors">
                <span className="text-sm font-medium">
                  {t("common.viewDetail")}
                </span>
                <Icon
                  name="arrow-right"
                  className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`}
                />
              </div>
            </div>
          </div>
        </NavLink>

        <SignInPopup
          isOpen={showSignInPopup}
          onClose={() => setShowSignInPopup(false)}
          redirectUrl={window.location.pathname + window.location.search}
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <NavLink
        to={`/venue/${hub.id}`}
        className="group block bg-slate-800/20 border border-slate-700/30 rounded-xl overflow-hidden hover:bg-slate-800/30 hover:border-slate-600 transition-all duration-200"
      >
        {/* Image */}
        <div className="relative h-48">
          {imageLoading && (
            <div className="absolute inset-0 bg-slate-700 animate-pulse" />
          )}

          <img
            src={
              hub.image_url ||
              hub.gallery_images?.[0] ||
              "/placeholder-venue.jpg"
            }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={hub.name}
            onLoad={handleImageLoad}
            onError={(e) => handleImageErrorWithRetry(e, 2, 500)}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-md hover:bg-black/70 transition-colors"
          >
            <Icon
              name="heart"
              className={`w-4 h-4 ${
                isFavorite ? "text-red-400 fill-current" : "text-white/70"
              }`}
            />
          </button>

          {/* Rating Badge */}
          {hub.average_rating && hub.average_rating > 0 && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-md text-white text-xs font-medium flex items-center gap-1">
              <Icon
                name="star"
                className="w-3 h-3 text-yellow-400 fill-current"
              />
              <span>{formatNumber(hub.average_rating, language, 1)}</span>
            </div>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">
              {hub.name}
            </h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Icon name="location" className="w-3.5 h-3.5 text-cyan-400" />
              <span className="line-clamp-1">{hub.address}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Owner & Events */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-cyan-300 text-sm font-medium">
              {hub.owner.name}
            </div>
            <div className="text-slate-400 text-xs">
              {formatNumber(hub.events_count, language)} {t("common.events")}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm line-clamp-2 mb-4">
            {hub.description || t("common.noDescription")}
          </p>

          {/* Action */}
          <div className="flex items-center justify-between">
            <span
              className="
  inline-flex items-center gap-2
  px-5 py-2.5
  text-sm font-semibold
  bg-gradient-to-r from-cyan-500/20 to-blue-500/20
  hover:from-cyan-500/30 hover:to-blue-500/30
  backdrop-blur-sm
  border border-cyan-400/40 hover:border-cyan-400/60
  rounded-xl
  text-cyan-200 hover:text-white
  shadow-lg shadow-cyan-500/10
  hover:shadow-xl hover:shadow-cyan-500/20
  transition-all duration-300
  hover:scale-[1.03]
  group
  relative
  overflow-hidden
  rtl:flex-row-reverse
"
            >
              {/* For RTL layout */}
              <svg
                className="
      w-4 h-4
      transition-transform duration-300
      group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[4px]
      rtl:rotate-180
    "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>

              {t("common.viewDetail")}
            </span>
            {/* <div className="inline-flex items-center gap-1 text-violet-300 text-sm">
              <span>{t("common.explore")||"مشاهده جزییات"}</span>
              <Icon 
                name="arrow-right" 
                className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} 
              />
            </div> */}
          </div>
        </div>
      </NavLink>

      <SignInPopup
        isOpen={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
        redirectUrl={window.location.pathname + window.location.search}
      />
    </>
  );
}
