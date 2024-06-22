import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LuHome,
  LuLineChart,
  LuPackage,
  LuPackage2,
  LuSettings,
  LuShoppingCart,
  LuUsers2,
  LuGlobe2,
  LuGlobe,
  LuCalendar,
  LuCalendarPlus,
} from "react-icons/lu";

export default function useRoutes() {
  const pathname = usePathname();
  const routes = useMemo(
    () => ({
      sidebar: {
        routes: [
          {
            label: "Home",
            href: "/home",
            icon: LuHome,
            active: pathname === "/home",
          },
          {
            label: "Locations",
            href: "/locations",
            icon: LuGlobe,
            active: pathname?.startsWith("/locations"),
          },
          {
            label: "Calendars",
            href: "/calendars",
            icon: LuCalendar,
            active: pathname === "/calendars",
          },
          {
            label: "Feed",
            href: "/feed",
            icon: LuUsers2,
            active: pathname === "/feed",
          },
          {
            label: "Create Event",
            href: "/create-event",
            icon: LuCalendarPlus,
            active: pathname === "/create-event",
          },
        ],
      },
      settings: {
        routes: [
          {
            label: "Settings",
            href: "/settings",
            icon: LuSettings,
            active: pathname === "/settings",
          },
        ],
      },
    }),
    [pathname],
  );
  return routes;
}
