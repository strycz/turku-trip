import { useState, useEffect } from "react";
import { packingList as staticList } from "../data";
import { useFirebaseState } from "../hooks/useFirebaseState";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type PackingItem = {
  id: string;
  text: string;
  checked: boolean;
};

export const PackingList = () => {
    const [items, setItems, loading] = useFirebaseState<PackingItem[] | null>("packing-list", null);
    const [newItemText, setNewItemText] = useState("");

    // Migration / Init
    useEffect(() => {
        if (!loading && items === null) {
            // First time setup: map static list to objects
            const initialItems = staticList.map(text => ({
                id: uuidv4(),
                text,
                checked: false
            }));
            setItems(initialItems);
        }
    }, [loading, items, setItems]);

    const toggleItem = (id: string) => {
        if (!items) return;
        setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim() || !items) return;
        
        const newItem: PackingItem = {
            id: uuidv4(),
            text: newItemText.trim(),
            checked: false
        };
        
        setItems([...items, newItem]);
        setNewItemText("");
    };

    const deleteItem = (id: string) => {
        if (!items || !confirm("Usunąć ten element?")) return;
        setItems(items.filter(i => i.id !== id));
    };

    if (loading) return <div className="text-center p-4 muted">Ładowanie listy...</div>;
    if (!items) return null; // Should initialize via effect

    return (
        <div className="packing-list-container">
            <form onSubmit={addItem} className="search-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input 
                    type="text" 
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Dodaj rzecz do zabrania..."
                    className="role-input"
                    style={{ flex: 1 }}
                />
                <button 
                    type="submit" 
                    className="btn-control active"
                    disabled={!newItemText.trim()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={20} />
                </button>
            </form>

            <ul className="checklist">
                {items.map((item) => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <label className="grow" style={{ marginBottom: 0 }}>
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItem(item.id)}
                            />
                            <span style={{ 
                                textDecoration: item.checked ? 'line-through' : 'none',
                                color: item.checked ? 'var(--muted)' : 'var(--text)',
                                marginLeft: '0.75rem'
                            }}>
                                {item.text}
                            </span>
                        </label>
                        <button 
                            onClick={() => deleteItem(item.id)}
                            className="btn-del"
                            style={{ fontSize: '1rem', opacity: 0.5 }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

