import { useState, useRef } from 'react';
import type { ScheduleItem } from '../data';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  item?: ScheduleItem; // If undefined, we are creating new
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export const ScheduleItemEditor = ({ item, onSave, onCancel, onDelete }: Props) => {
  const [title, setTitle] = useState(item?.title || '');
  const [time, setTime] = useState(item?.time || '');
  const [description, setDescription] = useState(item?.description || '');
  const [location, setLocation] = useState(item?.location || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const storageRef = ref(storage, `schedule-images/${uuidv4()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setImageUrl(url);
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed!");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item?.id || uuidv4(),
      title,
      time,
      description,
      location,
      imageUrl
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{item ? 'Edytuj wydarzenie' : 'Dodaj wydarzenie'}</h3>
        <form onSubmit={handleSubmit} className="editor-form">
          <label>
            Godzina (np. 16:00–17:30)
            <input 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              placeholder="HH:MM lub HH:MM–HH:MM"
              required 
            />
          </label>
          
          <label>
            Tytuł
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Co robimy?"
              required 
            />
          </label>

          <label>
            Opis (opcjonalnie)
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Szczegóły..."
              rows={3}
            />
          </label>

          <label>
            Link do Mapy (opcjonalnie)
            <input 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="https://maps.google.com/..."
            />
          </label>

          <div className="image-upload">
            <label>Zdjęcie / Załącznik</label>
            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Preview" />
                <button type="button" onClick={() => setImageUrl('')}>Usuń</button>
              </div>
            )}
            {!imageUrl && (
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
            )}
            {uploading && <span>Wgrywanie... ⏳</span>}
          </div>

          <div className="modal-actions">
            {item && onDelete && (
              <button type="button" onClick={onDelete} className="btn-del">
                Usuń
              </button>
            )}
            <div className="grow" />
            <button type="button" onClick={onCancel} className="btn-cancel">
              Anuluj
            </button>
            <button type="submit" className="btn-save" disabled={uploading}>
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
