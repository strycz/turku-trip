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

  const [settlementPlan, setSettlementPlan] = useState<string[] | null>(null);

  const resolveDebts = () => {
    if (expenses.length === 0) return;

    // 1. Calculate Net Balance per person
    // Initialize balances for all known squad members
    const balances: Record<string, number> = {};
    const memberNames = squad.map(m => m.name).filter(Boolean);
    
    // If we have expenses from people NOT in the squad list, we should account for them too?
    // For simplicity, let's assume everyone involved is either in squad or we collect names from expenses.
    // Let's gather all unique names from expenses + squad.
    const allNames = Array.from(new Set([
      ...memberNames, 
      ...expenses.map(e => e.who)
    ]));

    allNames.forEach(name => balances[name] = 0);

    // Total spent
    const totalSpent = expenses.reduce((sum, e) => sum + e.cost, 0);
    if (totalSpent === 0) return;

    // Assuming equal split among ALL participants
    // NOTE: In really complex scenarios, some expenses might be shared by subset.
    // Here we stick to the rule: "Everything is split equally among the squad".
    // If the squad list is empty, we split among distinctive payers? 
    // Let's use `headCount` logic: spread total cost among `headCount`.
    
    const splitCount = memberNames.length > 0 ? memberNames.length : allNames.length;
    if (splitCount === 0) return; // Should not happen if expenses exist

    // Cost per person
    // Note: We calculate net balance. 
    // For each expense: Payer gets +Cost. Everyone gets -(Cost/N).
    // Sum of balances must be 0.
    
    expenses.forEach(e => {
        const cost = e.cost;
        const payer = e.who;
        
        // Payer paid 'cost', so they are "up" by that amount initially
        balances[payer] = (balances[payer] || 0) + cost;

        // Everyone "consumes" cost/N
        const share = cost / splitCount;
        allNames.forEach(name => {
            balances[name] = (balances[name] || 0) - share;
        });
    });

    // 2. Separate into Debtors and Creditors
    let debtors: { name: string; amount: number }[] = [];
    let creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
        // Round to 2 decimals to avoid floating point drift
        const val = Math.round(amount * 100) / 100;
        if (val < -0.01) debtors.push({ name, amount: val });
        if (val > 0.01) creditors.push({ name, amount: val });
    });

    // 3. Match them (Greedy approach)
    // Sort by magnitude desc
    debtors.sort((a, b) => a.amount - b.amount); // ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // descending (most positive first)

    const plan: string[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is min(abs(debtor), creditor)
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
        
        // "Debtor pays Creditor Amount"
        plan.push(`${debtor.name} → ${creditor.name}: ${amount.toFixed(2)} €`);

        // Adjust remaining
        debtor.amount += amount;
        creditor.amount -= amount;

        // If debtor is settled (approx 0), move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        // If creditor is settled (approx 0), move to next
        if (creditor.amount < 0.01) j++;
    }

    setSettlementPlan(plan.length > 0 ? plan : ["Wszyscy są kwita!"]);
  };

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
            style={{ appearance: 'none' }} // handled by CSS now but keeping generic fallback
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

      {expenses.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="btn-control" onClick={resolveDebts}>
             💸 Rozlicz (Smart Resolve)
          </button>
        </div>
      )}

      {settlementPlan && (
        <div className="settlement-modal" style={{
            marginTop: '1rem', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '1rem', 
            borderRadius: '12px',
            border: '1px solid var(--accent)'
        }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent)' }}>Plan Rozliczeń</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {settlementPlan.map((line, i) => (
                    <li key={i} style={{ padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {line}
                    </li>
                ))}
            </ul>
            <button 
                onClick={() => setSettlementPlan(null)} 
                style={{ 
                    marginTop: '1rem', 
                    background: 'transparent', 
                    border: '1px solid var(--muted)', 
                    color: 'var(--muted)',
                    padding: '0.25rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer'
                }}
            >
                Zamknij
            </button>
        </div>
      )}
    </div>
  );
};
