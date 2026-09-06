"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

/**
 * The clock where I am. Renders nothing until it knows the time, because a
 * server-rendered clock is wrong the moment it arrives and React would
 * rightly complain about it.
 */
export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: profile.timezone,
      }).format(new Date());

    setNow(format());
    const id = setInterval(() => setNow(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span suppressHydrationWarning>
      {now ? `Lahore ${now}` : "Lahore"}
    </span>
  );
}
