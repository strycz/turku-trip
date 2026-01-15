import { useState, useEffect } from "react";
import clsx from "clsx";
import { schedule as staticSchedule, type ScheduleItem, type DayPlan } from "../data";
import { useFirebaseState } from "../hooks/useFirebaseState";
import { get, ref, set } from "firebase/database";
import { database } from "../firebase";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScheduleItemEditor } from "./ScheduleItemEditor";
import { EventPhotosModal } from "./EventPhotosModal";
import { Edit2, PlusCircle, GripVertical, MapPin, Camera } from "lucide-react";

// --- Sortable Item Wrapper ---
const SortableScheduleItem = ({ 
  item, 
  status, 
  noteKey, 
  notes, 
  noteHeights, 
  handleNoteChange, 
  handleResize, 
  editMode,
  onEdit,
  onOpenPhotos 
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const,
  };

  const hasPhotos = (item.images?.length || 0) > 0 || !!item.imageUrl;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx("schedule-item", status, isDragging && "dragging")}
    >
      {/* Timeline / Status Indicator */}
      <span className="status-indicator" />
      
      <div className="schedule-content">
        <div className="item-header" style={{ display: 'flex', alignItems: 'flex-start' }}>
            {editMode && (
                <div {...attributes} {...listeners} className="drag-handle" title="Przeciągnij, aby zmienić kolejność">
                    <GripVertical size={20} />
                </div>
            )}
            
            <div style={{ flex: 1, paddingRight: '4rem' }}>
                <strong>{item.time}</strong> — {item.title}
            </div>
            
            {/* Actions Container */}
            <div className="item-actions">
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenPhotos(item); }}
                    className={clsx("action-btn", hasPhotos && "active")}
                    title="Zdjęcia"
                >
                    <Camera size={16} />
                </button>

                {item.location && (
                <a 
                    href={item.location} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn map-link"
                    title="Link do Mapy"
                >
                    <MapPin size={16} />
                </a>
                )}

                {editMode && (
                    <button 
                    onClick={() => onEdit(item)} 
                    className="action-btn"
                    style={{ color: 'var(--accent)' }}
                    title="Edytuj"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
            </div>
        </div>

        {item.description && (
          <div className="muted">{item.description}</div>
        )}
        
        <textarea 
          className="schedule-note"
          placeholder="Notatka..."
          value={notes[noteKey] || ""}
          onChange={(e) => handleNoteChange(e.target.value)}
          onMouseUp={(e) => handleResize(e)}
          onTouchEnd={(e) => handleResize(e)}
          style={noteHeights[noteKey] ? { height: noteHeights[noteKey] } : undefined}
        />
      </div>
    </li>
  );
};

// ... getStatus helper ...
const getStatus = (dayName: string, timeRange: string, now: Date) => {
    // ... preserved logic ...
    const daysMap: Record<string, number> = {
        Niedziela: 0, Poniedziałek: 1, Wtorek: 2, Środa: 3, Czwartek: 4, Piątek: 5, Sobota: 6,
    };
    const dayIndex = daysMap[dayName];
    const currentDayIndex = now.getDay();
    const tripOrder: Record<number, number> = { 5: 0, 6: 1, 0: 2 }; 
    const currentTripDay = tripOrder[currentDayIndex];
    const itemTripDay = tripOrder[dayIndex];

    if (currentTripDay === undefined) return "future"; 
    if (currentTripDay > itemTripDay) return "past";
    if (currentTripDay < itemTripDay) return "future";

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

export const Schedule = ({ viewMode = "all", minimalMode = false }: { viewMode?: "all" | "today"; minimalMode?: boolean; }) => {
  const [now, setNow] = useState(new Date());
  
  // State
  const [notes, setNotes] = useFirebaseState<Record<string, string>>("schedule-notes-v2", {});
  const [noteHeights, setNoteHeights] = useFirebaseState<Record<string, string>>("schedule-note-heights-v2", {});
  const [scheduleData, setScheduleData] = useFirebaseState<DayPlan[] | null>("schedule-data", null);
  
  // UI State
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item?: ScheduleItem, dayIndex: number, insertIndex?: number } | null>(null);
  const [photoItem, setPhotoItem] = useState<{ item: ScheduleItem, dayIndex: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  // Data Migration Logic preserved...
  useEffect(() => {
    const scheduleRef = ref(database, "schedule-data");
    get(scheduleRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(scheduleRef, staticSchedule);
        }
    });

    const notesV2Ref = ref(database, "schedule-notes-v2");
    get(notesV2Ref).then(async (snapV2) => {
        if (!snapV2.exists()) {
             // ... migration logic ...
             const notesV1Snap = await get(ref(database, "schedule-notes"));
             const heightsV1Snap = await get(ref(database, "schedule-note-heights"));
             
             const schedSnap = await get(ref(database, "schedule-data"));
             const currentSchedule = schedSnap.exists() ? schedSnap.val() as DayPlan[] : staticSchedule;

             const notesV1 = notesV1Snap.val() || {};
             const heightsV1 = heightsV1Snap.val() || {};
             
             const newNotes: Record<string, string> = {};
             const newHeights: Record<string, string> = {};

             currentSchedule.forEach((day, dIndex) => {
                 day.items.forEach((item, i) => {
                     const oldKey = `${dIndex}-${i}`;
                     if (notesV1[oldKey]) newNotes[item.id] = notesV1[oldKey];
                     if (heightsV1[oldKey]) newHeights[item.id] = heightsV1[oldKey];
                 });
             });

             if (Object.keys(newNotes).length > 0) await set(notesV2Ref, newNotes);
             if (Object.keys(newHeights).length > 0) await set(ref(database, "schedule-note-heights-v2"), newHeights);
        }
    });
  }, []);

  const displaySchedule = scheduleData || staticSchedule;

  const handleNoteChange = (itemId: string, val: string) => {
    setNotes((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleResize = (itemId: string, e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const newHeight = `${target.offsetHeight}px`;
    setNoteHeights((prev) => {
      if (prev[itemId] === newHeight) return prev;
      return { ...prev, [itemId]: newHeight };
    });
  };

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent, dayIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !scheduleData) return;

    const dayItems = scheduleData[dayIndex].items;
    const oldIndex = dayItems.findIndex(i => i.id === active.id);
    const newIndex = dayItems.findIndex(i => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(dayItems, oldIndex, newIndex);
        const newSchedule = [...scheduleData];
        newSchedule[dayIndex] = { ...newSchedule[dayIndex], items: newItems };
        setScheduleData(newSchedule);
    }
  };

  const saveItem = (item: ScheduleItem) => {
    if (!editingItem || !scheduleData) return;
    const { dayIndex, insertIndex } = editingItem;
    
    const newSchedule = [...scheduleData];
    const dayItems = [...newSchedule[dayIndex].items];
    
    // Check if update or create
    const existingIdx = dayItems.findIndex(i => i.id === item.id);
    if (existingIdx !== -1) {
        // Update
        dayItems[existingIdx] = item;
    } else {
        // Create
        if (insertIndex !== undefined) {
            dayItems.splice(insertIndex, 0, item);
        } else {
            dayItems.push(item);
        }
    }
    
    newSchedule[dayIndex].items = dayItems;
    setScheduleData(newSchedule);
    setEditingItem(null);
  };
  
  const deleteItem = () => {
      if (!editingItem || !editingItem.item || !scheduleData) return;
      if (!confirm("Na pewno usunąć?")) return;

      const { dayIndex } = editingItem;
      const newSchedule = [...scheduleData];
      newSchedule[dayIndex].items = newSchedule[dayIndex].items.filter(i => i.id !== editingItem.item!.id);
      
      setScheduleData(newSchedule);
      setEditingItem(null);
  }

  const savePhotos = (images: string[]) => {
      if (!photoItem || !scheduleData) return;
      
      const { dayIndex, item } = photoItem;
      const newSchedule = [...scheduleData];
      const dayItems = newSchedule[dayIndex].items;
      const idx = dayItems.findIndex(i => i.id === item.id);
      
      if (idx !== -1) {
          dayItems[idx] = { ...dayItems[idx], images }; // Save new array
          setScheduleData(newSchedule);
          // Update local state to reflect changes instantly if needed
          setPhotoItem({ ...photoItem, item: { ...item, images } });
      }
  };

  const currentDayIndex = now.getDay();
  const tripOrder: Record<number, number> = { 5: 0, 6: 1, 0: 2 };
  const todayIndex = tripOrder[currentDayIndex];

  return (
    <>
      <div style={{ textAlign: 'right', marginBottom: '0.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
        {editMode && <span className="muted" style={{fontSize: '0.8rem'}}>Tryb edycji włączony</span>}
        <button 
            className={clsx("edit-toggle", editMode && "active")} 
            onClick={() => setEditMode(m => !m)}
            title="Włącz/Wyłącz tryb edycji"
        >
            <Edit2 size={16} style={{ marginRight: editMode ? '0' : '0.5rem', display: 'inline-block', verticalAlign: 'text-bottom' }} />
            {!editMode && "Edytuj"}
        </button>
      </div>

      {displaySchedule.map((day, dIndex) => {
        if (viewMode === "today" && (todayIndex === undefined || todayIndex !== dIndex)) return null;

        return (
          <div key={day.day} className="day">
            <h3>{day.day}</h3>
            
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, dIndex)}
            >
                <SortableContext 
                    items={day.items.map(i => i.id)} 
                    strategy={verticalListSortingStrategy}
                    disabled={!editMode}
                >
                    <ul style={{ position: 'relative' }}>
                    
                    {editMode && day.items.length === 0 && (
                         <div className="insert-zone" onClick={() => setEditingItem({ dayIndex: dIndex, insertIndex: 0 })}>
                            <div className="line" />
                            <button className="btn-insert" title="Wstaw tutaj"><PlusCircle size={20} /></button>
                         </div>
                    )}

                    {day.items.map((item, i) => {
                        const status = getStatus(day.day, item.time, now);
                        const noteKey = item.id;
                        
                        if (minimalMode && status === 'past') return null;

                        return (
                            <div key={item.id} style={{ position: 'relative' }}>
                                {editMode && (
                                    <div className="insert-zone" onClick={() => setEditingItem({ dayIndex: dIndex, insertIndex: i })}>
                                        <div className="line" />
                                        <button className="btn-insert" title="Wstaw tutaj"><PlusCircle size={16} /></button>
                                    </div>
                                )}

                                <SortableScheduleItem 
                                    item={item}
                                    status={status}
                                    noteKey={noteKey}
                                    notes={notes}
                                    noteHeights={noteHeights}
                                    handleNoteChange={(v: string) => handleNoteChange(item.id, v)}
                                    handleResize={(e: any) => handleResize(item.id, e)}
                                    editMode={editMode}
                                    onEdit={() => setEditingItem({ item, dayIndex: dIndex })}
                                    onOpenPhotos={() => setPhotoItem({ item, dayIndex: dIndex })}
                                />
                                
                                {editMode && i === day.items.length - 1 && (
                                     <div className="insert-zone" onClick={() => setEditingItem({ dayIndex: dIndex, insertIndex: i + 1 })}>
                                        <div className="line" />
                                        <button className="btn-insert" title="Wstaw na końcu"><PlusCircle size={16} /></button>
                                     </div>
                                )}
                            </div>
                        );
                    })}
                    </ul>
                </SortableContext>
            </DndContext>
          </div>
        );
      })}
      
      {editingItem && (
          <ScheduleItemEditor 
            item={editingItem.item} 
            onSave={saveItem}
            onCancel={() => setEditingItem(null)}
            onDelete={editingItem.item ? deleteItem : undefined}
          />
      )}

      {photoItem && (
          <EventPhotosModal 
            item={photoItem.item}
            onSave={savePhotos}
            onClose={() => setPhotoItem(null)}
          />
      )}
    </>
  );
};
