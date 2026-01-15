import { useState, useEffect } from "react";
import clsx from "clsx";
import { Schedule } from "./components/Schedule";
import { PackingList } from "./components/PackingList";
import { Roles } from "./components/Roles";
import { Budget } from "./components/Budget";
import { Weather } from "./components/Weather";
import { PhotoAlbum } from "./components/PhotoAlbum";
import "./index.css";
import { 
  Calendar, 
  Users, 
  Wallet, 
  Backpack, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff,
  Image
} from "lucide-react";

type Tab = "schedule" | "squad" | "budget" | "items" | "album";

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
                  {minimalMode ? <Eye size={18} /> : <EyeOff size={18} />}
                  <span style={{ marginLeft: '0.5rem' }}>Focus</span>
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
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {activeTab === "schedule" && (
          <section className="tab-pane">
            <Schedule viewMode={viewMode} minimalMode={minimalMode} />
          </section>
        )}

        {viewMode === "all" && activeTab === "squad" && (
          <section className="tab-pane">
            <h2><Users className="icon-inline" size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Ekipa</h2>
            <Roles />
          </section>
        )}

        {activeTab === "budget" && (
          <section className="tab-pane">
            <h2><Wallet className="icon-inline" size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Budżet</h2>
            <Budget />
          </section>
        )}

        {activeTab === "items" && (
          <section className="tab-pane">
            <h2><Backpack className="icon-inline" size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Lista</h2>
            <PackingList />
          </section>
        )}

        {activeTab === "album" && (
          <section className="tab-pane">
            <h2><Image className="icon-inline" size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Album</h2>
            <PhotoAlbum />
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={clsx("nav-item", activeTab === "schedule" && "active")}
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar size={24} />
          <span>Plan</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "squad" && "active")}
          onClick={() => setActiveTab("squad")}
        >
          <Users size={24} />
          <span>Ekipa</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "budget" && "active")}
          onClick={() => setActiveTab("budget")}
        >
          <Wallet size={24} />
          <span>Kasa</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "items" && "active")}
          onClick={() => setActiveTab("items")}
        >
          <Backpack size={24} />
          <span>Lista</span>
        </button>
        <button 
          className={clsx("nav-item", activeTab === "album" && "active")}
          onClick={() => setActiveTab("album")}
        >
          <Image size={24} />
          <span>Album</span>
        </button>
      </nav>
    </>
  );
}
