import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [busqueda, setBusqueda] = useState("")
  const [juegos, setJuegos] = useState([])
  const [cargando, setCargando] = useState(false)
  
  // Estado para el valor del dólar
  const [valorDolar, setValorDolar] = useState(1600) 

  // 1. Buscamos la cotización del Dólar Tarjeta al iniciar
  useEffect(() => {
    fetch("https://dolarapi.com/v1/dolares/tarjeta")
      .then(res => res.json())
      .then(data => {
        if(data && data.venta) setValorDolar(data.venta);
      })
      .catch(err => console.error("Error buscando dólar:", err));
  }, []);

  // 2. Función de Búsqueda
  const buscarJuegos = async () => {
    if (!busqueda) return; 
    setCargando(true);
    setJuegos([]);
    try {
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

  // 3. Generadores de Links
  const getXboxLink = (name) => `https://www.xbox.com/es-ar/search?q=${encodeURIComponent(name)}`;
  const getPsLink = (name) => `https://store.playstation.com/es-ar/search/${encodeURIComponent(name)}`;
  
  const getSteamDBLink = (idString) => {
    const id = idString.replace('steam-', '');
    return `https://steamdb.info/app/${id}/`;
  }

  // 👇 NUEVO: Generador de Link a YouTube
  const getYoutubeLink = (name) => `https://www.youtube.com/results?search_query=gameplay+${encodeURIComponent(name)}`;

  return (
    <div className="app-container">
      <header>
        <h1 className="main-title">GAME<span className="highlight">HUNTER</span></h1>
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
          // A. Cálculos de Precio
          const tieneDescuento = juego.originalPrice > juego.price;
          const porcentaje = tieneDescuento 
            ? Math.round(((juego.originalPrice - juego.price) / juego.originalPrice) * 100) 
            : 0;
          
          const precioARS = Math.round(juego.price * valorDolar).toLocaleString('es-AR');

          // B. Badge
          let badgeClass = "badge-normal";
          let badgeText = `-${porcentaje}%`;

          if (porcentaje >= 85) {
              badgeClass = "badge-historic"; 
              badgeText = `🔥 -${porcentaje}%`;
          } else if (porcentaje >= 50) {
              badgeClass = "badge-great"; 
          }

          // C. Triple Escudo de Imagen
          const steamId = juego.id.replace('steam-', '');
          const hdImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/header.jpg`;
          const placeholderFinal = "https://placehold.co/460x215/1e293b/ffffff?text=GAMEHUNTER";

          return (
            <div key={juego.id} className="card">
              
              <a href={juego.link} target="_blank" rel="noopener noreferrer" className="img-link">
                 <span className="store-badge">STEAM</span>
                 {tieneDescuento && (
                    <span className={`discount-badge ${badgeClass}`}>{badgeText}</span>
                 )}
                 <img 
                    src={hdImage} 
                    alt={juego.name} 
                    onError={(e) => {
                        if (e.target.src !== juego.image && e.target.src !== placeholderFinal) {
                            e.target.src = juego.image; 
                        } else {
                            e.target.src = placeholderFinal;
                            e.target.onerror = null; 
                        }
                    }}
                 />
              </a>
              
              <div className="card-body">
                <h3>{juego.name}</h3>
                
                <div className="price-info">
                    <div className="left-actions">
                        <a href={getSteamDBLink(juego.id)} target="_blank" rel="noopener noreferrer" className="steamdb-link" title="Ver historial">
                        📉 SteamDB
                        </a>

                        {/* 👇 ACÁ ESTÁ EL BOTÓN NUEVO 👇 */}
                        <a href={getYoutubeLink(juego.name)} target="_blank" rel="noopener noreferrer" className="youtube-link" title="Ver Gameplay">
                        🎥 Gameplay
                        </a>
                    </div>

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
                            <div className="ars-price-row">
                                ≈ ARS$ {precioARS}
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