import {Repository} from 'typeorm';
import { Presupuesto } from '../entities/presupuesto';

export class PresupuestoService {
    constructor(private presupuestoRepository: Repository<Presupuesto>) {}

    async todosLosPresupuestos(): Promise<Presupuesto[]> {
        return await this.presupuestoRepository.find();
    }

    async obtenerPresupuestoPorId(id: string): Promise<Presupuesto | null> {
        const presupuesto = await this.presupuestoRepository.findOne({ where: { id } }); 
        return presupuesto || null;
    }
    async obtenerPresupuestoporMesyAño(usuarioId: string, mes: number, año: number): Promise<Presupuesto | null> {
        const presupuesto = await this.presupuestoRepository.findOne({
            where: {
                usuario: { id: usuarioId },
                mes: mes,
                año: año
            }
        });
        return presupuesto || null;
    }


    async crearPresupuesto(presupuestoData: Partial<Presupuesto>): Promise<Presupuesto> {
        const nuevoPresupuesto = this.presupuestoRepository.create(presupuestoData);
        return await this.presupuestoRepository.save(nuevoPresupuesto);
    }

    async guardarPresupuesto(data: any, usuarioId: string): Promise<Presupuesto> {
        const existente = await this.presupuestoRepository.findOne({
            where: {
                usuario: { id: usuarioId },
                mes: data.mes,
                año: data.año
            }
        });

        if (existente) {
            this.presupuestoRepository.merge(existente, {
                salario: data.salario,
                extras: data.extras,
                pagosPlanificados: data.pagosPlanificados,
                deudasPlanificadas: data.deudasPlanificadas
            });
            return await this.presupuestoRepository.save(existente);
        } else {
            const nuevoPresupuesto = this.presupuestoRepository.create({
                ...data,
                usuario: { id: usuarioId }
            } as Partial<Presupuesto>);
            return await this.presupuestoRepository.save(nuevoPresupuesto);
        }
    }
}