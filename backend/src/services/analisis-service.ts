import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario';
import { Deuda } from '../entities/deudas';

export interface AnalisisFinanciero {
    ratioDeudaIngreso: number;        // porcentaje
    nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
    recomendaciones: Recomendacion[];
    beneficiosDisponibles: Beneficio[];
    puedeSolicitarInsolvencia: boolean;
}

export interface Recomendacion {
    tipo: 'renegociacion' | 'consolidacion' | 'insolvencia' | 'educacion';
    mensaje: string;
    accion: string;
    enlace?: string;
}

export interface Beneficio {
    nombre: string;
    descripcion: string;
    requisitos: string[];
    enlace: string;
    fuente: string; // 'Superir', 'SERNAC', 'ChileAtiende', etc.
}

export class AnalisisService {
    constructor(
        private deudaRepo: Repository<Deuda>,
        private usuarioRepo: Repository<Usuario>
    ) {}

    async analizarSituacion(usuarioId: string): Promise<AnalisisFinanciero> {
        // 1. Obtener usuario y deudas
        const usuario = await this.usuarioRepo.findOne({
            where: { id: usuarioId },
            select: {
            id: true,
            email: true,
            monthlyIncome: true
}
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const deudas = await this.deudaRepo.find({
            where: { usuario: { id: usuarioId }, estado: 'pendiente' }
        });

        const ingresoAnual = (usuario.monthlyIncome || 0) * 12;
        const totalDeuda = deudas.reduce((sum, d) => sum + d.saldo_pendiente, 0);

        // 2. Calcular ratio deuda/ingreso
        const ratioDeudaIngreso = ingresoAnual > 0
            ? (totalDeuda / ingresoAnual) * 100
            : 0;

        // 3. Detectar nivel de riesgo
        const nivelRiesgo = this.calcularNivelRiesgo(ratioDeudaIngreso, deudas);

        // 4. Recomendaciones
        const recomendaciones = this.generarRecomendaciones(ratioDeudaIngreso, deudas, usuario);

        // 5. Beneficios disponibles
        const beneficiosDisponibles = this.beneficiosDisponibles(ratioDeudaIngreso, deudas, usuario);

        // 6. Insolvencia
        const puedeSolicitarInsolvencia = this.puedeSolicitarInsolvencia(ratioDeudaIngreso, deudas);

        return {
            ratioDeudaIngreso,
            nivelRiesgo,
            recomendaciones,
            beneficiosDisponibles,
            puedeSolicitarInsolvencia
        };
    }

    private calcularNivelRiesgo(ratio: number, deudas: Deuda[]): 'bajo' | 'medio' | 'alto' | 'critico' {
        // Verificar si hay deudas vencidas
        const hayVencidas = deudas.some(d => d.estado === 'vencida');
        const tasaPromedio = deudas.reduce((sum, d) => sum + d.tasa_interes, 0) / (deudas.length || 1);

        if (ratio > 300 || (hayVencidas && ratio > 200)) return 'critico';
        if (ratio > 200 || tasaPromedio > 40) return 'alto';
        if (ratio > 100 || tasaPromedio > 30) return 'medio';
        return 'bajo';
    }

    private generarRecomendaciones(ratio: number, deudas: Deuda[], usuario: Usuario): Recomendacion[] {
        const recomendaciones: Recomendacion[] = [];

        // Recomendación 1: Insolvencia
        if (ratio > 200) {
            recomendaciones.push({
                tipo: 'insolvencia',
                mensaje: 'Tu nivel de deuda supera el doble de tus ingresos anuales. La Ley de Insolvencia (20.720) puede ayudarte a reorganizar tus deudas sin perder tus bienes.',
                accion: 'Conocer más sobre la Ley de Insolvencia',
                enlace: 'https://www.superir.gob.cl'
            });
        }

        // Recomendación 2: Renegociación
        if (ratio > 100 && ratio <= 200) {
            recomendaciones.push({
                tipo: 'renegociacion',
                mensaje: 'Tu deuda es alta, pero aún puedes renegociar con tus acreedores. Contacta a cada uno y solicita un convenio de pago.',
                accion: 'Ver guía de renegociación',
                enlace: 'https://www.sernac.cl'
            });
        }

        // Recomendación 3: Consolidación
        const tasasAltas = deudas.filter(d => d.tasa_interes > 30);
        if (tasasAltas.length > 0 && ratio < 200) {
            recomendaciones.push({
                tipo: 'consolidacion',
                mensaje: 'Tienes deudas con tasas de interés muy altas (>30%). Considera consolidarlas en un solo crédito con tasa más baja.',
                accion: 'Ver opciones de consolidación',
                enlace: 'https://www.chileatiende.cl'
            });
        }

        return recomendaciones;
    }

    private beneficiosDisponibles(ratio: number, deudas: Deuda[], usuario: Usuario): Beneficio[] {
        const beneficios: Beneficio[] = [];

        // Beneficio 1: Ley de Insolvencia
        if (ratio > 200) {
            beneficios.push({
                nombre: 'Ley de Insolvencia (20.720)',
                descripcion: 'Procedimiento de renegociación de deudas sin perder bienes. La cuota no puede superar el 50% de tus ingresos.',
                requisitos: ['Tener deudas no pagadas', 'No tener bienes que liquidar'],
                enlace: 'https://www.superir.gob.cl',
                fuente: 'Superir'
            });
        }

        // Beneficio 2: Subsidio Eléctrico
        if (ratio > 100) {
            beneficios.push({
                nombre: 'Subsidio Eléctrico',
                descripcion: 'Descuento en la cuenta de luz para hogares vulnerables.',
                requisitos: ['Estar en el 60% del Registro Social de Hogares'],
                enlace: 'https://www.subsidioelectrico.cl',
                fuente: 'ChileAtiende'
            });
        }

        // Beneficio 3: IFE Laboral
        if ((usuario.monthlyIncome || 0) < 600000) {
            beneficios.push({
                nombre: 'IFE Laboral',
                descripcion: 'Subsidio para trabajadores dependientes e independientes con bajos ingresos.',
                requisitos: ['Ingreso mensual menor a $600.000'],
                enlace: 'https://www.chileatiende.cl',
                fuente: 'ChileAtiende'
            });
        }

        return beneficios;
    }

    private puedeSolicitarInsolvencia(ratio: number, deudas: Deuda[]): boolean {
        // Según la Ley 20.720, se puede solicitar si:
        // 1. La deuda es superior a los ingresos anuales
        // 2. Hay al menos una deuda vencida
        const hayVencidas = deudas.some(d => d.estado === 'vencida');
        return ratio > 200 && hayVencidas;
    }
}