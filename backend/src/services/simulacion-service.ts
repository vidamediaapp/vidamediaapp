// ─── Interfaces ──────────────────────────────────────────────────────────

export interface SimulacionRequest {
    saldoPendiente: number;
    tasaInteresAnual: number;
    pagoMensual: number;
    porcentajePagoMinimo?: number;

    
    esTarjetaCredito?: boolean;
    cuotasSinInteres?: number;      
    mantención?: number;            
    seguros?: number;                
    comisiones?: number;             
    interesesAcumulados?: number;    
}

export interface SimulacionResponse {
    mesesProyectados: number;
    totalPagado: number;
    interesTotal: number;
    esTrampa: boolean;
    pagoMinimoSugerido?: number;
    pagoMinimoCMF?: number;         
    faseCMF?: number;              
}


export interface SimulacionComparativaResponse {
    sinExtra: SimulacionResponse;
    conExtra: SimulacionResponse;
    mesesAhorrados: number;
    interesAhorrado: number;
}

export class SimulacionService {

    private getFaseCMF(): number {
        const hoy = new Date();
        const jun2026 = new Date(2026, 5, 4);
        const dic2026 = new Date(2026, 11, 4);
        const jun2027 = new Date(2027, 5, 4);
        const dic2027 = new Date(2027, 11, 4);
        const jun2028 = new Date(2028, 5, 4);

        if (hoy < jun2026) return 0;
        if (hoy < dic2026) return 0.25;
        if (hoy < jun2027) return 0.5;
        if (hoy < dic2027) return 0.75;
        if (hoy < jun2028) return 1;
        return 1;
    }

    private calcularPagoMinimoCMF(data: SimulacionRequest): { pagoMinimo: number; fase: number } {
        const fase = this.getFaseCMF();

        if (!data.esTarjetaCredito) {
            return { pagoMinimo: 0, fase };
        }

        const mnfBase =
            (data.interesesAcumulados || 0) +
            (data.comisiones || 0) +
            (data.seguros || 0) +
            (data.mantención || 0);

        const mnfCuotas = (data.cuotasSinInteres || 0) * fase;
        const mnfTotal = mnfBase + mnfCuotas;
        const mf = Math.max(0, data.saldoPendiente - mnfTotal);
        const pagoMinimo = mnfTotal + (mf * 0.05);

        return {
            pagoMinimo: Math.round(pagoMinimo * 100) / 100,
            fase
        };
    }

    simular(data: SimulacionRequest): SimulacionResponse {
        const {
            saldoPendiente,
            tasaInteresAnual,
            pagoMensual,
            porcentajePagoMinimo,
            esTarjetaCredito = false
        } = data;

        if (saldoPendiente <= 0) {
            throw new Error('El saldo pendiente debe ser mayor a 0.');
        }
        if (pagoMensual <= 0) {
            throw new Error('El pago mensual debe ser mayor a 0.');
        }

        const cmfResult = this.calcularPagoMinimoCMF(data);
        const pagoMinimoCMF = cmfResult.pagoMinimo;
        const faseCMF = cmfResult.fase;

        const pagoMinimoTradicional = porcentajePagoMinimo
            ? saldoPendiente * (porcentajePagoMinimo / 100)
            : undefined;

        let saldoActual = saldoPendiente;
        let totalPagado = 0;
        let meses = 0;
        let esTrampa = false;
        const tasaMensual = tasaInteresAnual / 12 / 100;
        const MAX_MESES = 360;

        while (saldoActual > 0 && meses < MAX_MESES) {
            meses++;
            const interes = saldoActual * tasaMensual;
            let pago = pagoMensual;

            if (pago > saldoActual + interes) {
                pago = saldoActual + interes;
            }

            if (pago < interes) {
                esTrampa = true;
            }

            saldoActual = saldoActual + interes - pago;
            totalPagado += pago;

            if (saldoActual > saldoPendiente * 2 && meses > 12) {
                esTrampa = true;
                break;
            }
        }

        const mesesProyectados = meses >= MAX_MESES && saldoActual > 0 ? -1 : meses;

        return {
            mesesProyectados,
            totalPagado: Math.round(totalPagado * 100) / 100,
            interesTotal: Math.round((totalPagado - saldoPendiente) * 100) / 100,
            esTrampa,
            pagoMinimoSugerido: pagoMinimoTradicional ? Math.round(pagoMinimoTradicional * 100) / 100 : undefined,
            pagoMinimoCMF: esTarjetaCredito ? pagoMinimoCMF : undefined,
            faseCMF: esTarjetaCredito ? faseCMF : undefined
        };
    }

    // ─── NUEVO MÉTODO: Simulación comparativa ──────────────────────────
    simularConComparacion(
        data: SimulacionRequest & { extraPayment?: number }
    ): SimulacionComparativaResponse {
        const { extraPayment = 0, ...baseData } = data;

        // Simulación sin pago extra
        const sinExtra = this.simular(baseData);

        // Simulación con pago extra
        const conExtra = this.simular({
            ...baseData,
            pagoMensual: baseData.pagoMensual + extraPayment
        });

        const mesesAhorrados = sinExtra.mesesProyectados - conExtra.mesesProyectados;
        const interesAhorrado = sinExtra.interesTotal - conExtra.interesTotal;

        return {
            sinExtra,
            conExtra,
            mesesAhorrados: mesesAhorrados > 0 ? mesesAhorrados : 0,
            interesAhorrado: interesAhorrado > 0 ? interesAhorrado : 0
        };
    }
}