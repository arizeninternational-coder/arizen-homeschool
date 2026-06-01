"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Flame, BookOpen, Heart } from "lucide-react";

const C = {
  page: "#F7FBF7", teal: "#047A70", dark: "#0F172A", body: "#64748B",
  white: "#FFFFFF", border: "#E2E8F0", cream: "#FFFBEB", mint: "#ECFDF5",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarEvent {
  date: string;
  type: "assignment" | "lesson" | "checkin" | "streak";
  title: string;
}

export default function StudentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/learner/calendar?year=${year}&month=${month + 1}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (e) { console.error("[CALENDAR] Load error:", e); }
      setLoading(false);
    };
    load();
  }, [year, month]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  // Build calendar grid
  const cells: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, isToday: isToday(d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isToday: false });
  }

  const todayEvents = getEventsForDay(today.getDate());

  return (
    <div style={{ padding: "28px 32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: "0 0 4px" }}>
          <Calendar size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: 10, color: C.teal }} />
          Calendar
        </h1>
        <p style={{ color: C.body, fontSize: "0.9375rem", margin: 0 }}>Track your learning schedule, assignments, and streak days.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Calendar grid */}
        <div style={{
          background: C.white, borderRadius: 20, border: "1px solid " + C.border,
          padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={prevMonth} style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid " + C.border,
              background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}><ChevronLeft size={18} style={{ color: C.dark }} /></button>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.dark, margin: 0 }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid " + C.border,
              background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}><ChevronRight size={18} style={{ color: C.dark }} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: C.muted, padding: "6px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((cell, i) => {
              const dayEvents = cell.isCurrentMonth ? getEventsForDay(cell.day) : [];
              const hasLesson = dayEvents.some(e => e.type === "lesson");
              const hasAssignment = dayEvents.some(e => e.type === "assignment");
              const hasCheckin = dayEvents.some(e => e.type === "checkin");
              const hasStreak = dayEvents.some(e => e.type === "streak");
              return (
                <div key={i} style={{
                  minHeight: 52, padding: "4px", borderRadius: 10,
                  background: cell.isToday ? "#ECFDF5" : "transparent",
                  border: cell.isToday ? "2px solid #6EE7B7" : "1px solid transparent",
                  opacity: cell.isCurrentMonth ? 1 : 0.3,
                }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: cell.isToday ? 800 : 500,
                    color: cell.isToday ? C.teal : C.dark,
                  }}>{cell.day}</span>
                  {dayEvents.length > 0 && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
                      {hasStreak && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E11D48", display: "block" }} />}
                      {hasLesson && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "block" }} />}
                      {hasAssignment && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706", display: "block" }} />}
                      {hasCheckin && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6D28D9", display: "block" }} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Today's events */}
        <div>
          <div style={{
            background: C.white, borderRadius: 20, border: "1px solid " + C.border,
            padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", marginBottom: 16,
          }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.dark, margin: "0 0 4px" }}>Today</h3>
            <p style={{ fontSize: "0.75rem", color: C.body, margin: "0 0 12px" }}>
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {todayEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <Flame size={24} style={{ color: C.muted, margin: "0 auto 8px", opacity: 0.4 }} />
                <p style={{ fontSize: "0.75rem", color: C.body }}>No events today. Keep your streak going!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {todayEvents.map((e, i) => (
                  <div key={i} style={{
                    padding: "8px 12px", borderRadius: 10,
                    background: e.type === "streak" ? "#FFF1F2" : e.type === "assignment" ? C.cream : e.type === "checkin" ? "#EDE9FE" : C.mint,
                    border: `1px solid ${e.type === "streak" ? "#FECDD3" : e.type === "assignment" ? "#FDE68A" : e.type === "checkin" ? "#C4B5FD" : "#A7F3D0"}`,
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.dark }}>{e.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{
            background: C.white, borderRadius: 20, border: "1px solid " + C.border,
            padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: C.dark, margin: "0 0 10px" }}>Legend</h3>
            {[
              { color: "#E11D48", label: "Streak day" },
              { color: C.teal, label: "Lesson" },
              { color: "#D97706", label: "Assignment due" },
              { color: "#6D28D9", label: "EQ check-in" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: C.body }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
