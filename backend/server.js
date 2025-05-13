const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// Configuración de PostgreSQL (¡actualiza con tus credenciales!)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventario_db',
  password: '123456789',  // Cambia esto
  port: 5432,
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Permite solo requests del frontend
  methods: ['GET', 'POST', 'OPTIONS'],         // Métodos permitidos
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend Operativo</h1>
    <p>Endpoints disponibles:</p>
    <ul>
      <li><a href="/api/productos">GET /api/productos</a></li>
      <li>POST /api/productos (body: {nombre, cantidad})</li>
    </ul>
  `);
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar nuevo producto
app.post('/api/productos', async (req, res) => {
  const { nombre, cantidad } = req.body;
  
  if (!nombre || !cantidad === undefined) {
    return res.status(400).json({ error: 'Nombre y cantidad son requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO productos(nombre, cantidad) VALUES($1, $2) RETURNING *',
      [nombre, parseInt(cantidad)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/productos:', err);
    res.status(500).json({ error: 'Error al guardar producto en postgre' });
  }
});

// Manejo de errores para rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});