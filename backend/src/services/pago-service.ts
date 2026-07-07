import { Repository } from 'typeorm';
import { Pago } from '../entities/pagos';
import { Deuda } from '../entities/deudas';

export class PagoService {
    constructor(
        private pagoRepository: Repository<Pago>,
        private deudaRepository: Repository<Deuda>
    ) {}

    async registrarPago(deudaId: string, monto: number, usuarioId: string): Promise<Pago> {
        // Verificar que la deuda existe y pertenece al usuario
        const deuda = await this.deudaRepository.findOne({
            where: { id: deudaId, usuario: { id: usuarioId } }
        });

        if (!deuda) {
            throw new Error('Deuda no encontrada o no pertenece al usuario');
        }

        if (monto <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }

        if (monto > deuda.saldo_pendiente) {
            throw new Error('El pago no puede superar el saldo pendiente');
        }

        // ✅ Crear el pago con los nombres correctos
        const pago = this.pagoRepository.create({
            deuda: { id: deudaId },
            monto: monto,
            fechaPago: new Date()  // ← CORREGIDO: fechaPago, no fecha_pago
        });

        await this.pagoRepository.save(pago);

        // Actualizar el saldo de la deuda
        deuda.saldo_pendiente = Math.max(0, deuda.saldo_pendiente - monto);
        if (deuda.saldo_pendiente === 0) {
            deuda.estado = 'pagada';
        }
        await this.deudaRepository.save(deuda);

        return pago;
    }

    async obtenerPagosDeuda(deudaId: string, usuarioId: string): Promise<Pago[]> {
        const deuda = await this.deudaRepository.findOne({
            where: { id: deudaId, usuario: { id: usuarioId } }
        });

        if (!deuda) {
            throw new Error('Deuda no encontrada');
        }

        return await this.pagoRepository.find({
            where: { deuda: { id: deudaId } },
            order: { fechaPago: 'DESC' }  
        });
    }
}