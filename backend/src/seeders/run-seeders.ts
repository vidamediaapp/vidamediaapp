import {AppDataSource} from '../db';
import { runAcreedoresSeed } from './acreedores_seed';

async function runSeeders() {
    try {
        await AppDataSource.initialize()
        console.log('Conexión a la base de datos establecida. Ejecutando seeders...')
        await runAcreedoresSeed(AppDataSource)
        console.log('Seeders ejecutados exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar los seeders:', error);
        process.exit(1);
    }
}

runSeeders();
    