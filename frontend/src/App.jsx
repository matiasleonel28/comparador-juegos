import { useState } from 'react'
import './App.css'

function App() {
  const [busqueda, setBusqueda] = useState("")
  const [juegos, setJuegos] = useState([])
  const [cargando, setCargando] = useState(false)

  const buscarJuegos = async () => {
    if (!busqueda) return; 

    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:3001/search?q=${busqueda}`)
      if (!respuesta.ok) throw new Error("Error en el backend");
      const datos = await respuesta.json()
      setJuegos(datos)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al conectar.")
    } finally {
      setCargando(false);
    }
  }
  // Función para ordenar los juegos (de menor a mayor precio)
  const ordenarPorPrecio = () => {
    // 1. Creamos una copia de la lista [...juegos] para no romper el estado original
    const juegosOrdenados = [...juegos].sort((a, b) => {
      // Obtenemos el precio final (o 0 si es gratis/no tiene precio)
      const precioA = a.price ? a.price.final : 0;
      const precioB = b.price ? b.price.final : 0;
      
      return precioA - precioB; // Si da negativo, A va antes que B
    });

    // 2. Actualizamos la pantalla con la lista ordenada
    setJuegos(juegosOrdenados);
  }

  return (
    <div className="container">
      <h1>🎮 Comparador de Steam</h1>
      
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Ej: Resident Evil, FIFA..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarJuegos()}
        />
        <button onClick={buscarJuegos} disabled={cargando}>
          {cargando ? "Buscando..." : "Buscar"}
        </button>
        
        {/* NUEVO BOTÓN: Solo se muestra si hay juegos en la lista */}
        {juegos.length > 0 && (
          <button onClick={ordenarPorPrecio} style={{ marginLeft: '10px', backgroundColor: '#4caf50' }}>
            Ordenar 💲
          </button>
        )}
      </div>

      <div className="results-grid">
        {juegos.map((juego) => (
          // NUEVO: Envolvemos la tarjeta en un enlace <a>
          // target="_blank" hace que se abra en una pestaña nueva
          <a 
            key={juego.id} 
            href={`https://store.steampowered.com/app/${juego.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="card-link"
          >
            <div className="card">
              <img src={juego.tiny_image} alt={juego.name} />
              <h3>{juego.name}</h3>
              <p className="price">
                {/* NUEVO: Agregamos "USD" al final */}
                {juego.price 
                  ? `$${(juego.price.final / 100).toFixed(2)} USD` 
                  : "Gratis / Sin precio"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default App