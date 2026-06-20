import {DataSource} from 'typeorm'

export const AppDataSource = new DataSource ({
    type: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'MonayPerla2020',
    port: 5432,
    database: 'VidaMediadb',
    entities: [],
    logging: true









})