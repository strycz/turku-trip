import { useState, useEffect } from "react";
import { database } from "../firebase";
import { get, ref } from "firebase/database";
import type { DayPlan } from "../data";
import { Camera } from "lucide-react";
import { ImageViewer } from "./ImageViewer";

export const PhotoAlbum = () => {
  const [scheduleData, setScheduleData] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(database, "schedule-data");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        setScheduleData(snapshot.val());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-4">Ładowanie zdjęć...</div>;

  if (!scheduleData) return <div className="text-center p-4">Brak danych.</div>;

  // Flatten photos
  const daysWithPhotos = scheduleData.map(day => ({
    day: day.day,
    photos: day.items.flatMap(item => {
      const urls = item.images || (item.imageUrl ? [item.imageUrl] : []);
      return urls.map(url => ({ url, item }));
    })
  })).filter(day => day.photos.length > 0);

  if (daysWithPhotos.length === 0) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
            <Camera size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>Brak zdjęć</h3>
            <p>Dodaj zdjęcia do wydarzeń w planie, aby zobaczyć je tutaj.</p>
        </div>
    );
  }

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {daysWithPhotos.map(day => (
        <div key={day.day}>
          <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            {day.day}
          </h2>
          <div className="album-grid">
            {day.photos.map((photo, idx) => (
              <div 
                key={idx} 
                className="album-item" 
                onClick={() => setViewImage(photo.url)} 
                style={{ cursor: 'pointer' }}
              >
                <img src={photo.url} alt="Snap" loading="lazy" />
                <div className="photo-caption">
                    <strong>{photo.item.time}</strong> {photo.item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
};
