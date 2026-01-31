import { useState } from 'react'
import './App.css'

function App() {
  const [busqueda, setBusqueda] = useState("")
  const [juegos, setJuegos] = useState([])
  const [cargando, setCargando] = useState(false)

  const buscarJuegos = async () => {
    if (!busqueda) return; 
    setCargando(true);
    setJuegos([]);
    try {
      // URL DE PRODUCCIÓN (RENDER)
      const respuesta = await fetch(`https://gamehunter-backend.onrender.com/search?q=${busqueda}`)
      const datos = await respuesta.json()
      setJuegos(datos)
    } catch (error) {
      console.error(error)
      alert("Error al conectar. El servidor puede estar despertando...")
    } finally {
      setCargando(false);
    }
  }

  // Links de consolas
  const getXboxLink = (name) => `https://www.xbox.com/es-ar/search?q=${encodeURIComponent(name)}`;
  const getPsLink = (name) => `https://store.playstation.com/es-ar/search/${encodeURIComponent(name)}`;
  
  // Link de SteamDB
  const getSteamDBLink = (idString) => {
    const id = idString.replace('steam-', '');
    return `https://steamdb.info/app/${id}/`;
  }

  return (
    <div className="app-container">
      <header>
        <h1 className="main-title">GAME<span className="highlight">HUNTER</span></h1>
        <p className="subtitle">Historial de precios y ofertas</p>
      </header>
      
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Ej: Cyberpunk, FIFA, Resident Evil..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarJuegos()}
        />
        <button onClick={buscarJuegos} disabled={cargando}>
          {cargando ? "..." : "Buscar"}
        </button>
      </div>

      <div className="results-grid">
        {juegos.map((juego) => {
          // 1. Lógica de Descuento
          const tieneDescuento = juego.originalPrice > juego.price;
          const porcentaje = tieneDescuento 
            ? Math.round(((juego.originalPrice - juego.price) / juego.originalPrice) * 100) 
            : 0;

          // 2. Lógica de "Calidad de Oferta"
          let badgeClass = "badge-normal";
          let badgeText = `-${porcentaje}%`;

          if (porcentaje >= 85) {
              badgeClass = "badge-historic"; // Rojo + Fuego
              badgeText = `🔥 -${porcentaje}%`;
          } else if (porcentaje >= 50) {
              badgeClass = "badge-great"; // Azul
          }

          return (
            <div key={juego.id} className="card">
              
              <a href={juego.link} target="_blank" rel="noopener noreferrer" className="img-link">
                 <span className="store-badge">STEAM</span>
                 
                 {/* 3. AQUÍ APLICAMOS LA LÓGICA VISUALMENTE */}
                 {tieneDescuento && (
                    <span className={`discount-badge ${badgeClass}`}>{badgeText}</span>
                 )}

                 <img 
                    src={juego.image} 
                    alt={juego.name} 
                    onError={(e) => {e.target.src="https://via.placeholder.com/300x150?text=No+Image"}}
                 />
              </a>
              
              <div className="card-body">
                <h3>{juego.name}</h3>
                
                <div className="price-info">
                    {/* Botón SteamDB */}
                    <a href={getSteamDBLink(juego.id)} target="_blank" rel="noopener noreferrer" className="steamdb-link" title="Ver historial en SteamDB">
                      📉 SteamDB
                    </a>

                    <div className="steam-price-block">
                        {juego.price > 0 ? (
                          <>
                            {tieneDescuento && (
                                <span className="original-price">US$ {juego.originalPrice.toFixed(2)}</span>
                            )}
                            <div className="final-price-row">
                                <span className="currency">US$</span>
                                <span className="amount">{juego.price.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <span className="free">Gratis</span>
                        )}
                    </div>
                </div>

                <div className="separator"></div>
                
                <div className="console-links">
                  <div className="buttons-row">
                    <a href={getXboxLink(juego.name)} target="_blank" rel="noopener noreferrer" className="btn-console btn-xbox">Xbox 🇦🇷</a>
                    <a href={getPsLink(juego.name)} target="_blank" rel="noopener noreferrer" className="btn-console btn-ps">PS Store 🇦🇷</a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App