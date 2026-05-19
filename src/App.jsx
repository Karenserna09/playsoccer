import { useEffect, useMemo, useState } from "react";
import playersData from "./data/players";
import "./styles/app.css";

const POSITION_ORDER = {
  Mediocampista: 1,
  Delantero: 2,
  Extremo: 3,
  Defensa: 4,
  Portero: 5
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() =>
    safeParse(localStorage.getItem("darkMode"), true)
  );
  const [favorites, setFavorites] = useState(() =>
    safeParse(localStorage.getItem("favorites"), [])
  );
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() =>
    safeParse(localStorage.getItem("searchHistory"), [])
  );
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none"
  });
  const [paintMode, setPaintMode] = useState("none");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    if (!debouncedSearch) return;

    setSearchHistory((prev) => {
      const normalized = debouncedSearch.toLowerCase();
      const updated = [
        debouncedSearch,
        ...prev.filter((item) => item.toLowerCase() !== normalized)
      ];
      return updated.slice(0, 5);
    });
  }, [debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, itemsPerPage, showOnlyFavorites]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }

      if (prev.direction === "desc") {
        return { key: null, direction: "none" };
      }

      return { key, direction: "asc" };
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const selectHistory = (value) => {
    setSearchTerm(value);
    setDebouncedSearch(value);
    setCurrentPage(1);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [id, ...prev]
    );
  };

  const handleRowClick = (player) => {
    setSelectedPlayer(player);
  };

  const filteredPlayers = useMemo(() => {
    let list = [...playersData];

    if (debouncedSearch) {
      list = list.filter((player) =>
        player.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (showOnlyFavorites) {
      list = list.filter((player) => favorites.includes(player.id));
    }

    const sorted = [...list].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);

      if (aFav !== bFav) {
        return bFav ? 1 : -1;
      }

      if (!sortConfig.key || sortConfig.direction === "none") {
        return 0;
      }

      const direction = sortConfig.direction === "asc" ? 1 : -1;
      const { key } = sortConfig;

      if (key === "position") {
        const aPos = POSITION_ORDER[a.position] ?? 99;
        const bPos = POSITION_ORDER[b.position] ?? 99;

        if (aPos !== bPos) {
          return (aPos - bPos) * direction;
        }

        return a.name.localeCompare(b.name) * direction;
      }

      if (typeof a[key] === "string") {
        return a[key].localeCompare(b[key]) * direction;
      }

      return (a[key] - b[key]) * direction;
    });

    return sorted;
  }, [debouncedSearch, favorites, showOnlyFavorites, sortConfig]);

  const totalPlayers = filteredPlayers.length;
  const totalPages = Math.max(1, Math.ceil(totalPlayers / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visiblePlayers = filteredPlayers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = filteredPlayers.length;

    const averageGoals =
      total > 0
        ? filteredPlayers.reduce((sum, p) => sum + p.goals, 0) / total
        : 0;

    const averageAge =
      total > 0
        ? filteredPlayers.reduce((sum, p) => sum + p.age, 0) / total
        : 0;

    const topScorer =
      total > 0
        ? [...filteredPlayers].sort((a, b) => b.goals - a.goals)[0]
        : null;

    return {
      total,
      averageGoals,
      averageAge,
      topScorer
    };
  }, [filteredPlayers]);

  const getRowClass = (index) => {
    if (paintMode === "pares" && (index + 1) % 2 === 0) {
      return "highlight";
    }

    if (paintMode === "impares" && (index + 1) % 2 !== 0) {
      return "highlight";
    }

    return "";
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    if (sortConfig.direction === "asc") return "↑";
    if (sortConfig.direction === "desc") return "↓";
    return "";
  };

  const startRecord = totalPlayers === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(startIndex + itemsPerPage, totalPlayers);

  return (
    <div className={darkMode ? "app app--dark" : "app app--light"}>
      <header className="header">
        <div>
          <span className="mini-title">TOP CLUB SOCCER</span>
          <h1>Dashboard Top Soccer</h1>
          <p>
            Gestiona tus estrellas favoritas, analiza estadísticas y descubre
            talentos.
          </p>
        </div>

        <button className="mode-btn" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "🌙 Modo oscuro" : "☀️ Modo claro"}
        </button>
      </header>

      <main className="dashboard">
        <section className="search-section">
          <label>BUSCAR JUGADORES</label>

          <div className="search-box">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Escribe un nombre o club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button className="search-clear" onClick={clearSearch}>
              Limpiar
            </button>
          </div>
        </section>

        <section className="stats">
          <article className="stat-card yellow">
            <h3>JUGADORES EN TABLA</h3>
            <h1>{stats.total}</h1>
            <span>Favoritos: {favorites.length}</span>
          </article>

          <article className="stat-card">
            <h3>PROMEDIO DE GOLES</h3>
            <h2>{stats.averageGoals.toFixed(1)}</h2>
          </article>

          <article className="stat-card">
            <h3>PROMEDIO DE EDAD</h3>
            <h2>{stats.averageAge.toFixed(0)} años</h2>
          </article>

          <article className="stat-card">
            <h3>MÁXIMO GOLEADOR</h3>
            <h2>{stats.topScorer ? stats.topScorer.name : "Sin datos"}</h2>
          </article>

          <article className="stat-card">
            <h3>HISTORIAL DE BÚSQUEDA</h3>

            <div className="history-list">
              {searchHistory.map((item, index) => (
                <span key={`${item}-${index}`} onClick={() => selectHistory(item)}>
                  {item}
                </span>
              ))}
            </div>

            <div className="card-actions">
              <button onClick={() => setSearchHistory([])}>
                Limpiar
              </button>
            </div>
          </article>
        </section>

        <div className="actions">
          <button
            className={paintMode === "pares" ? "active" : ""}
            onClick={() => setPaintMode("pares")}
          >
            Pintar filas pares
          </button>

          <button
            className={paintMode === "impares" ? "active" : ""}
            onClick={() => setPaintMode("impares")}
          >
            Pintar filas impares
          </button>

          <button
            className={paintMode === "none" ? "active" : ""}
            onClick={() => setPaintMode("none")}
          >
            Limpiar color
          </button>

          <button
            className={showOnlyFavorites ? "active" : ""}
            onClick={() => setShowOnlyFavorites((v) => !v)}
          >
            {showOnlyFavorites ? "Mostrando favoritos" : "Mostrar solo favoritos"}
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FAV</th>

                <th className="sortable" onClick={() => handleSort("name")}>
                  JUGADOR <span className="arrow">{sortIndicator("name")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("club")}>
                  CLUB <span className="arrow">{sortIndicator("club")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("position")}>
                  POSICIÓN{" "}
                  <span className="arrow">{sortIndicator("position")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("country")}>
                  PAÍS <span className="arrow">{sortIndicator("country")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("age")}>
                  EDAD <span className="arrow">{sortIndicator("age")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("goals")}>
                  GOLES <span className="arrow">{sortIndicator("goals")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("assists")}>
                  ASISTENCIAS{" "}
                  <span className="arrow">{sortIndicator("assists")}</span>
                </th>

                <th className="sortable" onClick={() => handleSort("rating")}>
                  RATING <span className="arrow">{sortIndicator("rating")}</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {visiblePlayers.map((player, index) => (
                <tr key={player.id} className={getRowClass(index)}>
                  <td>
                    <button
                      className="fav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(player.id);
                      }}
                    >
                      {favorites.includes(player.id) ? "★" : "☆"}
                    </button>
                  </td>

                  <td
                    className="click-name"
                    onClick={() => handleRowClick(player)}
                  >
                    {player.name}
                  </td>

                  <td>{player.club}</td>
                  <td>{player.position}</td>
                  <td>{player.country}</td>
                  <td>{player.age}</td>
                  <td>{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bottom-bar">
          <div className="items-select">
            <span>Mostrar</span>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={15}>15 por página</option>
            </select>
          </div>

          <div className="records-info">
            Mostrando {startRecord}-{endRecord} de {totalPlayers} registros
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              «
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 2), Math.max(0, currentPage - 2) + 3)
              .map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      </main>

      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPlayer(null)}>
              ×
            </button>

            <button
              className="favorite-modal"
              onClick={() => toggleFavorite(selectedPlayer.id)}
            >
              {favorites.includes(selectedPlayer.id) ? "⭐ Favorito" : "☆ Favorito"}
            </button>

            <h1>{selectedPlayer.name}</h1>
            <span className="position-badge">{selectedPlayer.position}</span>

            <div className="modal-grid">
              <div>
                <h4>Club</h4>
                <p>{selectedPlayer.club}</p>
              </div>

              <div>
                <h4>País</h4>
                <p>{selectedPlayer.country}</p>
              </div>

              <div>
                <h4>Edad</h4>
                <p>{selectedPlayer.age}</p>
              </div>

              <div>
                <h4>Goles</h4>
                <p>{selectedPlayer.goals}</p>
              </div>

              <div>
                <h4>Asistencias</h4>
                <p>{selectedPlayer.assists}</p>
              </div>

              <div>
                <h4>Rating</h4>
                <p className="rating">{selectedPlayer.rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;