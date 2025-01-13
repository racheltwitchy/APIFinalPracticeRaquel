import express, { Request, Response } from 'express';
import 'reflect-metadata'; // Necesario para `typedi` y decoradores
import { Container } from 'typedi';
import { DatabaseService } from '../database/database.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Inicializar la base de datos y el servidor
(async () => {
  try {
    // Obtener una instancia del servicio de base de datos
    const databaseService = Container.get(DatabaseService);

    // Inicializar la base de datos
    await databaseService.initializeDatabase();
    console.log('Database initialized');

    // Endpoint de prueba
    app.get('/', async (req: Request, res: Response): Promise<void> => {
      res.send('API is running');
    });

    // Otros endpoints (puedes agregarlos aquí)
    // Ejemplo:
    app.get('/users', async (req: Request, res: Response): Promise<void> => {
      try {
        const db = await databaseService.connect();
        const users = await db.all('SELECT * FROM users');
        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Arrancar servidor
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('Failed to initialize the server:', error);
    process.exit(1); // Salir si no se puede inicializar
  }
})();
