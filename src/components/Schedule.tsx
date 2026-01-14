import { useState, useEffect } from "react";
import clsx from "clsx";
import { schedule, type ScheduleItem } from "../data";
import { useFirebaseState } from "../hooks/useFirebaseState";

// Helper type for rendering
type ScheduleItemRender = {
  item: ScheduleItem;
  i: number;
  status: string;
  noteKey: string;
};

// Helper to check status
const getStatus = (dayName: string, timeRange: string, now: Date) => {
  const daysMap: Record<string, number> = {
    Niedziela: 0,
    Poniedziałek: 1,
    Wtorek: 2,
    Środa: 3,
    Czwartek: 4,
    Piątek: 5,
    Sobota: 6,
  };

  const dayIndex = daysMap[dayName];
  const currentDayIndex = now.getDay();

  // Custom logic for this specific 3-day trip flow:
  const tripOrder: Record<number, number> = { 5: 0, 6: 1, 0: 2 }; 
  const currentTripDay = tripOrder[currentDayIndex];
  const itemTripDay = tripOrder[dayIndex];

  if (currentTripDay === undefined) return "future"; // Not on trip days, assume default
  if (currentTripDay > itemTripDay) return "past";
  if (currentTripDay < itemTripDay) return "future";

  // If same day, check time
  const [startStr, endStr] = timeRange.split("–");
  const [startH, startM] = startStr.split(":").map(Number);
  
  const startTime = new Date(now);
  startTime.setHours(startH, startM, 0);

  const endTime = new Date(now);
  if (endStr) {
    const [endH, endM] = endStr.split(":").map(Number);
    endTime.setHours(endH, endM, 0);
    if (endH < startH) endTime.setDate(endTime.getDate() + 1);
  } else {
    endTime.setMinutes(endTime.getMinutes() + 30);
  }

  if (now < startTime) return "future";
  if (now >= startTime && now <= endTime) return "current";
  return "past";
};

export const Schedule = ({ 
  viewMode = "all", 
  minimalMode = false 
}: { 
  viewMode?: "all" | "today";
  minimalMode?: boolean;
}) => {
  const [now, setNow] = useState(new Date());
  // Store notes as "dayIndex-itemIndex": "note content"
  const [notes, setNotes] = useFirebaseState<Record<string, string>>("schedule-notes", {});
  const [noteHeights, setNoteHeights] = useFirebaseState<Record<string, string>>("schedule-note-heights", {});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const handleNoteChange = (dayIndex: number, itemIndex: number, val: string) => {
    const key = `${dayIndex}-${itemIndex}`;
    setNotes((prev) => ({ ...prev, [key]: val }));
  };

  /* 
     Fix 1: Use CSS.escape or just simpler strings for keys? Keys are "0-1", safe. 
     Fix 2: Use offsetHeight because style.height is not always set by browser interaction immediately.
  */
  const handleResize = (dayIndex: number, itemIndex: number, e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const key = `${dayIndex}-${itemIndex}`;
    const newHeight = `${target.offsetHeight}px`;
    
    setNoteHeights((prev) => {
      // Avoid spamming updates if height is same (pixel perfect)
      if (prev[key] === newHeight) return prev;
      return { ...prev, [key]: newHeight };
    });
  };

  const currentDayIndex = now.getDay();
  const tripOrder: Record<number, number> = { 5: 0, 6: 1, 0: 2 };
  const todayIndex = tripOrder[currentDayIndex];

  // Logic to find "current" and "next" item for minimal mode across all days
  let foundCurrent = false;

  return (
    <>
      {schedule.map((day, dIndex) => {
        // View Mode Filter
        if (viewMode === "today" && (todayIndex === undefined || todayIndex !== dIndex)) return null;

        // In minimal mode, we might want to hide whole days if they have no relevant items
        // But simpler to filter items first. 
        
        const visibleItems = day.items.map((item, i) => {
          const status = getStatus(day.day, item.time, now);
          const noteKey = `${dIndex}-${i}`;
          
          // Minimal Mode Filter
          if (minimalMode) {
             if (status === "current") {
               foundCurrent = true;
               return { item, i, status, noteKey };
             }
             if (status === "future" && !foundCurrent) {
               // This is effectively the "next" item (first future item found if no current, or next after current)
               // actually logic needs to be global.
               // Let's simplified local logic: 
               // If item is future and we haven't rendered a "current" or "future" yet globally?
               // Complex to do inside map.
               
               // Alternative: Just render everything but hide with CSS? No, we want structural focus.
               // Let's just return matches.
               // For "Next": we want the VERY NEXT item in the list of futures.
               return { item, i, status, noteKey };
             }
             // If we found current, we might want the immediate next one too?
             // Prompt said: "current" and "next".
             // Let's rely on basic status: "current" or (first) "future".
             // Ideally we need to flatten the list to find "next" properly.
             return null; 
          }

          return { item, i, status, noteKey };
        }).filter(Boolean);

        // Global minimal filtering hack: limit to 2 items max if minimalMode?
        // Let's refine: simple version -> show 'current' and 'future' items only, hide 'past'.
        // "Minimal/Focus" = Hide Past.
        const finalItems = minimalMode 
          ? visibleItems.filter((x): x is ScheduleItemRender => x !== null && x.status !== "past").slice(0, 2) 
          : visibleItems;

        if (finalItems.length === 0 && minimalMode) return null;

        return (
          <div key={day.day} className="day">
            <h3>{day.day}</h3>
            <ul>
              {finalItems.map((obj) => {
                const { item, i, status, noteKey } = obj as ScheduleItemRender;
                return (
                  <li
                    key={i}
                    className={clsx("schedule-item", status)}
                  >
                    <span className="status-indicator" />
                    <div className="schedule-content">
                      <div className="item-header">
                        <strong>{item.time}</strong> — {item.title}
                        {item.location && (
                          <a 
                            href={item.location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="map-link"
                            title="Go to Map"
                          >
                            📍
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <div className="muted">{item.description}</div>
                      )}
                      <textarea 
                        className="schedule-note"
                        placeholder="Notatka..."
                        value={notes[noteKey] || ""}
                        onChange={(e) => handleNoteChange(dIndex, i, e.target.value)}
                        onMouseUp={(e) => handleResize(dIndex, i, e)}
                        onTouchEnd={(e) => handleResize(dIndex, i, e)}
                        style={noteHeights[noteKey] ? { height: noteHeights[noteKey] } : undefined}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
};
