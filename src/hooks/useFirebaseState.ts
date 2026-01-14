import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebase";

export function useFirebaseState<T>(path: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, path);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        setState(val);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  const setValue = (newValue: T | ((prev: T) => T)) => {
    // Optimistic update logic if needed, but for now simple set
    // calculate new value if function
    let valueToStore: T;
    
    if (newValue instanceof Function) {
      valueToStore = newValue(state);
    } else {
      valueToStore = newValue;
    }

    // Update local immediately (optional, onValue will trigger anyway but might feel laggy without this)
    setState(valueToStore);

    // Sync to Firebase
    console.log(`[Firebase] Setting path: ${path} to:`, valueToStore);
    set(ref(database, path), valueToStore)
      .then(() => console.log(`[Firebase] Write success for ${path}`))
      .catch((err) => {
        console.error("Firebase set error:", err);
    });
  };

  return [state, setValue, loading] as const;
}
