import { Repository } from 'typeorm';
import { Deuda } from '../entities/deudas';

export class DeudaService {
    constructor(private deudaRepository: Repository<Deuda>) {}

    async obtenerDeudas(usuarioId: string): Promise<Deuda[]> {
        return await this.deudaRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: {
                acreedor: true  
            },
            order: { fecha_limite: 'ASC' }
        });
    }

    async obtenerDeudaPorId(id: string, usuarioId: string): Promise<Deuda | null> {
        return await this.deudaRepository.findOne({
            where: { id, usuario: { id: usuarioId } },
            relations: {
                acreedor: true,  
                pagos: true      
            }
        });
    }

async crearDeuda(data: any, usuarioId: string): Promise<Deuda> {
    const { acreedorId, ...deudaData } = data;

    const deuda = this.deudaRepository.create({
        ...deudaData,
        usuario: { id: usuarioId },
        acreedor: { id: acreedorId }
    });

   
    const resultado = await this.deudaRepository.save(deuda) as unknown as Deuda;
    return resultado;
}

    async actualizarDeuda(id: string, data: any, usuarioId: string): Promise<Deuda | null> {
        const deuda = await this.obtenerDeudaPorId(id, usuarioId);
        if (!deuda) return null;

        Object.assign(deuda, data);
        return await this.deudaRepository.save(deuda);
    }

    async eliminarDeuda(id: string, usuarioId: string): Promise<boolean> {
        const deuda = await this.obtenerDeudaPorId(id, usuarioId);
        if (!deuda) return false;

        await this.deudaRepository.delete(id);
        return true;
    }

    async actualizarSaldo(deudaId: string, montoPagado: number): Promise<void> {
        const deuda = await this.deudaRepository.findOne({ where: { id: deudaId } });
        if (!deuda) throw new Error('Deuda no encontrada');

        deuda.saldo_pendiente = Math.max(0, deuda.saldo_pendiente - montoPagado);
        if (deuda.saldo_pendiente === 0) {
            deuda.estado = 'pagada';
        }
        await this.deudaRepository.save(deuda);
    }
}