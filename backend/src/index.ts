import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './db';

async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Conexión a PostgreSQL establecida');
        console.log('Servidor corriendo en http://localhost:3000');
        app.listen(3000); 
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

main();