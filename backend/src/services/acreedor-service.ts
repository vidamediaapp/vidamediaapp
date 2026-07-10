import { Repository } from 'typeorm';
import { Acreedor } from '../entities/acreedores';

export class AcreedorService {
    constructor(private acreedorRepository: Repository<Acreedor>) {}

    async findAll(): Promise<Acreedor[]> {
        return await this.acreedorRepository.find();
    }

    async obtenerAcreedorPorId(id: string): Promise<Acreedor | null> {
        const acreedor = await this.acreedorRepository.findOne({ where: { id } });
        if (!acreedor) {
            return null;
        }
        return acreedor;
    }

    async obtenertasaInteresTipica(): Promise<{ id: string; nombreComercial: string; tasaInteresTipica: number | null }[]> {
        const acreedores = await this.acreedorRepository.find({
            select: {
                id: true,
                nombreComercial: true,
                tasaInteresTipica: true
            }
        });
        return acreedores;
    }

    async obtenerPorTipo(tipo: string): Promise<Acreedor[]> {
        return await this.acreedorRepository.find({
            where: { tipo },
            order: { nombreComercial: 'ASC' }
        });
    }
}



