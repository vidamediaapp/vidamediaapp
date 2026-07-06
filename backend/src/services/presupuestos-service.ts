import { Repository } from 'typeorm';
import { Presupuesto } from '../entities/presupuesto';

export class PresupuestoService {
    constructor(private presupuestoRepository: Repository<Presupuesto>) {}

    async todosLosPresupuestos(): Promise<Presupuesto[]> {
        return await this.presupuestoRepository.find();
    }

    async obtenerPresupuestoPorId(id: string): Promise<Presupuesto | null> {
        const presupuesto = await this.presupuestoRepository.findOne({ 
            where: { id },
            relations: {
                deudas: true
            }
        }); 
        return presupuesto || null;
    }

    async obtenerPresupuesto(usuarioId: string, mes: number, año: number): Promise<Presupuesto | null> {
        return await this.presupuestoRepository.findOne({
            where: {
                usuario: { id: usuarioId },
                mes: mes,
                año: año
            },
            relations: {
                deudas: true
            }
        });
    }

    async crearPresupuesto(presupuestoData: Partial<Presupuesto>): Promise<Presupuesto> {
        const nuevoPresupuesto = this.presupuestoRepository.create(presupuestoData);
        return await this.presupuestoRepository.save(nuevoPresupuesto);
    }

    async obtenerHistorial(usuarioId: string): Promise<Presupuesto[]> {
        return await this.presupuestoRepository.find({
            where: { usuario: { id: usuarioId } },
            order: { año: 'DESC', mes: 'DESC' },
            relations: {
                deudas: true
            }
        });
    }

    async guardarPresupuesto(data: any, usuarioId: string): Promise<Presupuesto> {
        const existente = await this.obtenerPresupuesto(usuarioId, data.mes, data.año);

        if (existente) {
            
            existente.salario = data.salario || 0;
            existente.extras = data.extras || 0;
            existente.pagosPlanificados = data.pagosPlanificados || {};
            return await this.presupuestoRepository.save(existente);
        } else {
           
            const nuevo = this.presupuestoRepository.create({
                mes: data.mes,
                año: data.año,
                salario: data.salario || 0,
                extras: data.extras || 0,
                pagosPlanificados: data.pagosPlanificados || {},
                usuario: { id: usuarioId }
            });
            return await this.presupuestoRepository.save(nuevo);
        }
    }
}