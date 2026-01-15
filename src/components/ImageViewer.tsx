import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  src: string;
  onClose: () => void;
};

export const ImageViewer = ({ src, onClose }: Props) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <button className="btn-close-viewer">
        <X size={32} />
      </button>
      <img src={src} alt="Fullscreen" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};
