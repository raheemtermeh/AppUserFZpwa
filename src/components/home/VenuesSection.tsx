import { useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import SocialHubCard from "../SocialHubCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { useStore } from "../../state/apiStore";
import type { SocialHub } from "../../services/api";
import Icon from "../Icon";
import { formatPersianNumber, formatNumber } from "../../utils/persianNumbers";

interface VenuesSectionProps {
  title: string;
  venues: SocialHub[];
  icon?: string;
  seeMoreLink: string;
  variant?: "default" | "compact";
}

export default function VenuesSection({
  title,
  venues,
  icon = "star",
  seeMoreLink,
  variant = "default",
}: VenuesSectionProps) {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const { state } = useStore();
  const [sortBy, setSortBy] = useState<"rating" | "events" | "popular">(
    "rating"
  );

  // Calculate stats for each venue
  const venuesWithStats = useMemo(() => {
    const allEvents = state.events || [];
    const activeEvents = allEvents.filter(
      (event) =>
        event &&
        event.social_hub &&
        event.event_status !== "completed" &&
        event.event_status !== "cancelled"
    );

    return venues.map((venue) => {
      const venueEvents = activeEvents.filter(
        (event) => event.social_hub?.id === venue.id
      );
      const eventCount = venueEvents.length;
      const rating = venue.average_rating || 0;
      const isPopular = eventCount > 3 && rating >= 4.0;

      return {
        ...venue,
        eventCount,
        rating,
        isPopular,
      };
    });
  }, [venues, state.events]);

  // Sort venues based on selected criteria
  const sortedVenues = useMemo(() => {
    const sorted = [...venuesWithStats];

    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "events":
        return sorted.sort((a, b) => b.eventCount - a.eventCount);
      case "popular":
        return sorted.sort((a, b) => {
          if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
          return b.rating - a.rating;
        });
      default:
        return sorted;
    }
  }, [venuesWithStats, sortBy]);

  if (venues.length === 0) return null;

  const topVenues = sortedVenues.slice(0, 6);

  return (
    <section className="relative space-y-6 md:space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 via-violet-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
              {title}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            {formatPersianNumber(
              venuesWithStats.reduce((sum, v) => sum + v.eventCount, 0)
            )}{" "}
            {t("common.events")} در {formatPersianNumber(venues.length)}{" "}
            {t("common.venues")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 backdrop-blur-md">
              <Icon name="filter" className="w-4 h-4 text-cyan-300" />
              <span className="text-xs md:text-sm font-semibold text-slate-300">
                {sortBy === "rating"
                  ? t("common.topRated") || "برترین امتیاز"
                  : sortBy === "events"
                  ? t("common.mostEvents") || "بیشترین رویداد"
                  : t("common.popular") || "محبوب"}
              </span>
              <Icon
                name="chevron-right"
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isRTL ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute bottom-full mb-2 right-0 w-48 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="py-2">
                <button
                  onClick={() => setSortBy("rating")}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    sortBy === "rating"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span>{t("common.topRated") || "برترین امتیاز"}</span>
                </button>
                <button
                  onClick={() => setSortBy("events")}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    sortBy === "events"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{t("common.mostEvents") || "بیشترین رویداد"}</span>
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    sortBy === "popular"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span>{t("common.popular") || "محبوب"}</span>
                </button>
              </div>
            </div>
          </div>

          <NavLink
            to={seeMoreLink}
            className="px-5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg flex items-center gap-2 backdrop-blur-md group"
          >
            <span className="text-sm font-semibold text-slate-300">
              {t("common.seeMore")}
            </span>
          </NavLink>
        </div>
      </div>

      {/* Venues Grid/Scroll */}
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-pink-500/5 rounded-3xl blur-2xl opacity-50"></div>

        {/* Venues Container */}
        <div
          className={`relative ${
            variant === "compact"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
              : "flex gap-4 md:gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth"
          }`}
        >
          {topVenues.map((venue, index) => (
            <div
              key={venue.id}
              className={`${
                variant === "compact"
                  ? ""
                  : "snap-start flex-shrink-0 min-w-[300px] sm:min-w-[340px] md:min-w-[380px]"
              } relative group`}
            >
              {/* Popular Badge */}
              {/* {venue.isPopular && (
                <div className="absolute -top-2 -right-2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-xl flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>{t("common.popular") || "محبوب"}</span>
                </div>
              )} */}

              {/* Stats Overlay */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {venue.rating > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <Icon
                      name="star"
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                    <span className="text-xs font-bold text-white">
                      {formatNumber(venue.rating, language, 1)}
                    </span>
                  </div>
                )}
                {venue.eventCount > 0 && (
                  <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <Icon name="ticket" className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {formatPersianNumber(venue.eventCount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                <SocialHubCard hub={venue} variant={variant} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
