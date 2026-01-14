import { packingList } from "../data";
import { usePersistentState } from "../hooks/usePersistentState";

export const PackingList = () => {
  // Use shared persistent hook
  const [checked, setChecked] = usePersistentState<Record<number, boolean>>("packing", {});

  const handleCheck = (index: number) => {
    setChecked((c) => ({ ...c, [index]: !c[index] }));
  };

  return (
    <ul className="checklist">
      {packingList.map((item, i) => (
        <li key={i}>
          <label>
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => handleCheck(i)}
            />
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
};
