import { useState, useEffect } from "react";
import clsx from "clsx";
import { Schedule } from "./components/Schedule";
import { PackingList } from "./components/PackingList";
import { Roles } from "./components/Roles";
import { Budget } from "./components/Budget";
import { Weather } from "./components/Weather";
import "./index.css";

type Tab = "schedule" | "squad" | "budget" | "items";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [viewMode, setViewMode] = useState<"all" | "today">("all");
  const [minimalMode, setMinimalMode] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <main className="container tab-content">
        <header className="app-header">
          <div>
            <h1>Turku · Męski Wypad </h1>
            <div style={{ fontSize: "2rem" }}>🇫🇮</div>
            <Weather />
          </div>
          <div className="controls">
            {activeTab === "schedule" && (
              <>
                <button 
                  onClick={() => setMinimalMode(m => !m)}
                  className={clsx("btn-control", minimalMode && "active")}
                >
                  {minimalMode ? "Focus" : "Focus"}
                </button>
                <button 
                  onClick={() => setViewMode(v => v === "all" ? "today" : "all")}
                  className={clsx("btn-control", viewMode === "today" && "active")}
                >
                  {viewMode === "all" ? "Wszystko" : "Dziś"}
                </button>
              </>
            )}
            <button onClick={toggleTheme} className="btn-control theme-toggle">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {activeTab === "schedule" && (
          <section className="tab-pane">
            <Schedule viewMode={viewMode} minimalMode={minimalMode} />
          </section>
        )}

        {activeTab === "squad" && (
          <section className="tab-pane">
            <h2>👥 Ekipa</h2>
            <Roles />
          </section>
        )}

        {activeTab === "budget" && (
          <section className="tab-pane">
            <h2>💰 Budżet</h2>
            <Budget />
          </section>
        )}

        {activeTab === "items" && (
          <section className="tab-pane">
            <h2>🎒 Lista</h2>
            <PackingList />
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={clsx("nav-item", activeTab === "schedule" && "active")}
          onClick={() => setActiveTab("schedule")}
        >
          📅
          <span>Plan</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "squad" && "active")}
          onClick={() => setActiveTab("squad")}
        >
          👥
          <span>Ekipa</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "budget" && "active")}
          onClick={() => setActiveTab("budget")}
        >
          💰
          <span>Kasa</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "items" && "active")}
          onClick={() => setActiveTab("items")}
        >
          🎒
          <span>Lista</span>
        </button>
      </nav>
    </>
  );
}
