import { useState, useEffect } from "react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { useStore } from "../state/apiStore";
import Icon from "../components/Icon";
import SocialHubCard from "../components/SocialHubCard";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../utils/persianNumbers";

export default function SocialHubsPage() {
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useStore();
  const { t, isRTL, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "events">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const searchParam = searchParams.get("search");

  // Initialize search query from URL parameter
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  // Filter and sort social hubs
  const filteredHubs = state.socialHubs
    .filter((hub) => hub && hub.id)
    .filter(
      (hub) =>
        hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "events":
          return b.events_count - a.events_count;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const navigate = useNavigate();

  // انتخاب کافه واقعی ترجیحاً با واژه 'کافه' یا 'Cafe' در نام، در غیر اینصورت بهترین امتیاز
  const featuredHub = (() => {
    if (!filteredHubs || filteredHubs.length === 0) return null;
    const realCafe = filteredHubs.find((h) =>
      /کافه|Cafe|cafe|کافی/i.test(h.name)
    );
    if (realCafe) return realCafe;
    return filteredHubs.reduce(
      (best, hub) =>
        hub.average_rating > (best?.average_rating || 0) ? hub : best,
      filteredHubs[0]
    );
  })();

  // Quick-reserve: if logged in, navigate to reservation creation, otherwise save redirect and go to login
  const handleQuickReserve = () => {
    if (!featuredHub) return;
    if (state.auth?.isLoggedIn) {
      navigate(`/reservations/new?hub=${featuredHub.id}`);
    } else {
      dispatch({
        type: "set_redirect_url",
        url: `/reservations/new?hub=${featuredHub.id}`,
      });
      navigate("/login");
    }
  };

  // Toggle favorite for featured hub
  const isFavorite = featuredHub
    ? state.favorites.includes(featuredHub.id)
    : false;

  const handleToggleFavorite = () => {
    if (!featuredHub) return;

    // If user is not logged in, set redirect to venue detail with favorite intent and go to login
    if (!state.auth?.isLoggedIn) {
      dispatch({
        type: "set_redirect_url",
        url: `/venues/${featuredHub.id}?do=favorite`,
      });
      navigate("/login");
      return;
    }

    if (isFavorite) {
      dispatch({ type: "remove_favorite", socialHubId: featuredHub.id });
      dispatch({
        type: "show_notification",
        message: "از علاقه‌مندی‌ها حذف شد",
        notificationType: "info",
      });
    } else {
      dispatch({ type: "add_favorite", socialHubId: featuredHub.id });
      dispatch({
        type: "show_notification",
        message: "به علاقه‌مندی‌ها اضافه شد",
        notificationType: "success",
      });
    }
  };

  // View upcoming events for this hub
  const handleViewUpcomingEvents = () => {
    if (!featuredHub) return;

    // Try to find the next upcoming event for this hub and navigate to its detail page
    const hubEvents = (state.events || [])
      .filter((e) => e && e.social_hub?.id === featuredHub.id)
      .filter(
        (e) =>
          e.event_status !== "completed" &&
          e.event_status !== "cancelled" &&
          e.start_time
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    const nextEvent =
      hubEvents.find((e) => new Date(e.start_time).getTime() > Date.now()) ||
      hubEvents[0];
    if (nextEvent && nextEvent.id) {
      navigate(`/events/${nextEvent.id}`);
    } else {
      navigate(`/events?hub=${featuredHub.id}`);
    }
  };

  return (
    <div
      className={`space-y-8 md:space-y-12 px-2 md:px-8 max-w-7xl mx-auto ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Featured Cafe of the Day */}
      {featuredHub && (
        <div className="relative rounded-3xl bg-gradient-to-br from-pink-500/30 via-cyan-500/20 to-purple-500/30 shadow-2xl p-6 md:p-10 mb-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
          <div className="flex-1 flex flex-col items-start gap-3">
            <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg mb-2 animate-pulse">
              کافه پیشنهادی امروز
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-lg">
              {featuredHub.name}
            </h2>
            <p className="text-slate-300 text-base md:text-lg font-medium mb-2">
              {featuredHub.address}
            </p>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-2 text-lg font-bold text-yellow-400">
                <Icon name="star" className="w-5 h-5" />
                {featuredHub.average_rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-2 text-base font-semibold text-cyan-400">
                <Icon name="calendar" className="w-5 h-5" />
                {featuredHub.events_count} رویداد فعال
              </span>
              <span className="flex items-center gap-2 text-base font-medium text-slate-300">
                <Icon name="location" className="w-5 h-5" />
                {featuredHub.address?.split(",")[0]}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleQuickReserve}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              >
                <Icon name="bolt" className="w-4 h-4" />
                رزرو سریع
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-2 rounded-lg font-semibold border ${
                  isFavorite
                    ? "bg-rose-500 text-white border-rose-400"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                } transition-colors duration-200 flex items-center gap-2`}
              >
                <Icon
                  name={isFavorite ? "heart-fill" : "heart"}
                  className="w-4 h-4 text-pink-400"
                />
                {isFavorite ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
              </button>

              <button
                onClick={handleViewUpcomingEvents}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Icon name="calendar" className="w-4 h-4 text-cyan-300" />
                رویدادهای پیش رو
              </button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src={featuredHub.image_url || "/public/cafe-default.jpg"}
              alt={featuredHub.name}
              className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-2xl shadow-xl border-4 border-white/20"
            />
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 py-6 md:py-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              {t("pages.venues.title")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-700/30 to-cyan-700/30 px-4 py-2 rounded-xl shadow-lg">
          <Icon
            name="location"
            className="w-7 h-7 text-purple-400 animate-bounce"
          />
          <span className="text-lg md:text-xl font-bold text-slate-300">
            {t("pages.venues.venuesCount").replace(
              "{count}",
              formatNumber(state.socialHubs.length, language)
            )}
          </span>
        </div>
      </div>
      {/* Subtitle */}
      <div className="text-left">
        <p className="text-base md:text-lg text-slate-400 mt-1 font-medium">
          {t("pages.venues.subtitle")}
        </p>
      </div>
      {/* Search and Controls */}
      <div className="card p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="search"
                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              />
              <input
                type="text"
                placeholder={t("pages.venues.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3 bg-slate-800 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all duration-300 shadow-inner ${
                  isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                }`}
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "rating" | "events")
              }
              className="px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 font-semibold shadow-md"
            >
              <option value="name">{t("pages.venues.sortByName")}</option>
              <option value="rating">{t("pages.venues.sortByRating")}</option>
              <option value="events">{t("pages.venues.sortByEvents")}</option>
            </select>
            <div className="flex border border-cyan-500/30 rounded-xl overflow-hidden shadow-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon name="grid" className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon name="list" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gradient bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {filteredHubs.length === 1
              ? t("pages.venues.venueFound").replace(
                  "{count}",
                  formatNumber(filteredHubs.length, language)
                )
              : t("pages.venues.venuesFound").replace(
                  "{count}",
                  formatNumber(filteredHubs.length, language)
                )}
          </h2>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="btn-ghost text-sm text-cyan-400 hover:text-pink-400 transition-colors duration-200"
            >
              {t("pages.venues.clearSearch")}
            </button>
          )}
        </div>
        {filteredHubs.length === 0 ? (
          <div className="card p-10 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl">
            <Icon
              name="location"
              className="w-16 h-16 text-pink-400 mx-auto mb-6 animate-bounce"
            />
            <h3 className="text-2xl font-bold text-slate-300 mb-3">
              {t("pages.venues.noVenuesFound")}
            </h3>
            <p className="text-slate-400 mb-6 text-lg">
              {searchQuery
                ? t("pages.venues.tryAdjustingSearch")
                : t("pages.venues.noVenuesMessage")}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="btn-primary px-6 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg hover:scale-105 transition-transform duration-200"
              >
                {t("pages.venues.clearSearch")}
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-6"
            }
          >
            {filteredHubs.map((hub) => (
              <SocialHubCard
                key={hub.id}
                hub={hub}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
