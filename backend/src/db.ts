import { DataSource } from 'typeorm';
import { Usuario } from './entities/usuario';
import { Acreedor } from './entities/acreedores';
import { Deuda } from './entities/deudas';
import { Pago } from './entities/pagos';
import { Simulacion } from './entities/simulaciones';
import { Presupuesto } from './entities/presupuesto';
import { Testimonio } from './entities/testimonio';
import { ForoPublicacion } from './entities/foro-publicacion';
import { ForoComentario } from './entities/foro-comentario';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'VidaMedia2026',
    database: process.env.DB_NAME || 'VidaMediadb',
    entities: [
        Usuario,
        Acreedor,
        Deuda,
        Pago,
        Simulacion,
        Presupuesto,
        Testimonio,
        ForoPublicacion,
        ForoComentario,
    ],
    synchronize: true,
    logging: true,
});






