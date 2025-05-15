const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'inventario_user',
  host: 'localhost',
  database: 'inventario_db',
  password: '123456789', // Cambia esto
  port: 5432,
});

// Verificación de conexión a PostgreSQL (debug)
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Error conectando a PostgreSQL:', err);
  else console.log('✅ PostgreSQL conectado. Hora:', res.rows[0].now);
});

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000','http://20.194.194.109'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Rutas
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    console.log('📦 Productos enviados:', result.rows); // Debug
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
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

// Crear producto
app.post('/api/productos', async (req, res) => {
  const { nombre, cantidad } = req.body;

  if (!nombre?.trim() || isNaN(cantidad)) {
    return res.status(400).json({ error: 'Nombre y cantidad son requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, cantidad) VALUES ($1, $2) RETURNING *',
      [nombre.trim(), parseInt(cantidad)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/productos:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});
// Ruta para editar producto
app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad } = req.body;

  console.log(`📝 Intentando editar producto ID: ${id}`, req.body); // Debug

  if (!nombre?.trim() || isNaN(cantidad)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, cantidad = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), parseInt(cantidad), id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log('✅ Producto actualizado:', result.rows[0]); // Debug
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al editar:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});
// Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('Error en DELETE /api/productos:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Manejo de errores para rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = 5001;
app.listen(PORT,'0.0.0.0' () => {
  console.log(`🚀 Servidor corriendo en http://20.194.194.109:${PORT}`);
});
