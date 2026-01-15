import { useState, useRef } from 'react';
import type { ScheduleItem } from '../data';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, X } from 'lucide-react';
import { ImageViewer } from './ImageViewer';

type Props = {
  item: ScheduleItem;
  onSave: (images: string[]) => void;
  onClose: () => void;
};

export const EventPhotosModal = ({ item, onSave, onClose }: Props) => {
  // Initialize with item.images, falling back to legacy item.imageUrl if needed
  const [images, setImages] = useState<string[]>(
    item.images || (item.imageUrl ? [item.imageUrl] : [])
  );
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const storageRef = ref(storage, `schedule-images/${uuidv4()}-${file.name}`);
        const result = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(result.ref);
        
        const newImages = [...images, url];
        setImages(newImages);
        onSave(newImages); // Save immediately
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed!");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (urlToDelete: string) => {
    if (!confirm("Usunąć to zdjęcie?")) return;
    
    // We update state first for UI responsiveness
    const newImages = images.filter(url => url !== urlToDelete);
    setImages(newImages);
    onSave(newImages);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal photo-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Zdjęcia: {item.title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={24} />
            </button>
        </div>

        <div className="gallery-grid">
            {images.map((url, index) => (
                <div 
                    key={url + index} 
                    className="gallery-item" 
                    onClick={() => setViewImage(url)} 
                    style={{ cursor: 'pointer' }}
                >
                    <img src={url} alt="Event photo" loading="lazy" />
                    <button 
                        className="btn-delete-photo" 
                        onClick={(e) => { e.stopPropagation(); handleDelete(url); }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            
            <div className="gallery-item add-photo" onClick={() => fileInputRef.current?.click()}>
                {uploading ? (
                    <div className="spinner">⏳</div>
                ) : (
                    <>
                        <Plus size={32} color="var(--accent)" />
                        <span>Dodaj</span>
                    </>
                )}
            </div>
        </div>

        <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
        />
      </div>

      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
};
