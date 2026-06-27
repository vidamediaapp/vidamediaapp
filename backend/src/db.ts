import { DataSource } from 'typeorm';
import { Usuario } from './entities/usuario';
import { Acreedor } from './entities/acreedores';
import { Deuda } from './entities/deudas';
import {Pago} from './entities/pagos'
import { Simulacion } from './entities/simulaciones';
import { Presupuesto } from './entities/presupuesto';


export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'MonayPerla2020',
    port: 5432,
    database: 'VidaMediadb',
    entities: [
        Usuario,
        Acreedor,
        Deuda,
        Pago,
        Simulacion,
        Presupuesto,
    ], 
    synchronize: true,
    logging: true,
});






