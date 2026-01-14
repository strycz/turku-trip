import { useState } from "react";
import { useFirebaseState } from "../hooks/useFirebaseState";
import { type Member } from "../data";

type Expense = {
  id: number;
  what: string;
  cost: number;
  who: string;
};

export const Budget = () => {
  const [expenses, setExpenses] = useFirebaseState<Expense[]>("budget", []);
  const [squad] = useFirebaseState<Member[]>("squad", []);

  const [newWhat, setNewWhat] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newWho, setNewWho] = useState("");

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhat || !newCost || !newWho) return;

    const expense: Expense = {
      id: Date.now(),
      what: newWhat,
      cost: parseFloat(newCost),
      who: newWho,
    };

    setExpenses((prev) => [...prev, expense]);
    setNewWhat("");
    setNewCost("");
    // Keep 'who' selected or reset? Resetting forces confirming who paid.
    // But usually same person pays multiple times. Let's keep it? 
    // Actually standard is reset or keep default. Let's keep it.
  };

  const removeExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const total = expenses.reduce((sum, e) => sum + e.cost, 0);
  // Estimate per head based on squad count (default to 4 if empty)
  const headCount = squad && squad.length > 0 ? squad.length : 4;
  const perPerson = total / headCount; 

  // Safely ensure squad is array
  const members = Array.isArray(squad) ? squad : [];

  return (
    <div className="budget-container">
      <div className="budget-summary">
        <div className="summary-item">
          <span>Łącznie</span>
          <strong>{total.toFixed(2)} €</strong>
        </div>
        <div className="summary-item">
          <span>Na głowę (~{headCount})</span>
          <strong>{perPerson.toFixed(2)} €</strong>
        </div>
      </div>

      <form onSubmit={addExpense} className="budget-form">
        <input
          type="text"
          placeholder="Co? (np. Taxi)"
          value={newWhat}
          onChange={(e) => setNewWhat(e.target.value)}
          className="budget-input grow"
        />
        <input
          type="number"
          placeholder="€"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          className="budget-input cost"
          step="0.01"
        />
        
        {members.length > 0 ? (
          <select
            value={newWho}
            onChange={(e) => setNewWho(e.target.value)}
            className="budget-input who"
            style={{ appearance: 'none' }} // simple styled select
            required
          >
            <option value="" disabled>Kto?</option>
            {members.map(m => (
              <option key={m.id} value={m.name}>
                {m.name || "Bez imienia"}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Kto?"
            value={newWho}
            onChange={(e) => setNewWho(e.target.value)}
            className="budget-input who"
          />
        )}
        
        <button type="submit" className="btn-add">+</button>
      </form>

      <ul className="budget-list">
        {expenses.map((e) => (
          <li key={e.id} className="budget-item">
            <div className="budget-info">
              <span className="what">{e.what}</span>
              <span className="who muted">płacił: {e.who}</span>
            </div>
            <div className="budget-actions">
              <span className="cost">{e.cost.toFixed(2)} €</span>
              <button onClick={() => removeExpense(e.id)} className="btn-del">×</button>
            </div>
          </li>
        ))}
        {expenses.length === 0 && (
          <li className="muted empty-msg">Brak wydatków. Dodaj coś!</li>
        )}
      </ul>
    </div>
  );
};
