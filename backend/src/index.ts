import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();  

import app from './app';
import { AppDataSource } from './db';

async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Conexión a PostgreSQL establecida');
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

main();