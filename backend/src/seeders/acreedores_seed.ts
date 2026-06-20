import {DataSource} from 'typeorm'
import {Acreedor} from '../entities/acreedores'

export const seedAcreedores = [{
    nombreComercial: 'Banco Fallabella',
    razonSocial: 'Banco Fallabella S.A.',
    tipo: 'retail',
    tasaInteresTipica: 44.0,
    porcentajePagoMinimo: 3.00,
    nivelAdvertencia: 'alto',
    notaEducativa: 'Las tarjetas de crédito de retail suelen tener tasas de interés más altas que los bancos tradicionales. Es importante pagar más que el mínimo para evitar acumular intereses elevados.'
},{

    nombreComercial: 'Caja Los Andes',
    razonSocial: 'Caja de Compensación Los Andes',
    tipo: 'cooperativa',
    tasaInteresTipica: 18.0,
    porcentajePagoMinimo: 2.5,
    nivelAdvertencia: 'medio',
    notaEducativa: 'El descuento por planilla puede acumularse. Revisa tu liquidación de sueldos mensualmente'
},{
   
    nombreComercial: 'Ripley',
    razonSocial: 'Ripley S.A.',
    tipo: 'retail', 
    tasaInteresTipica: 49.0,
    porcentajePagoMinimo: 3.00,
    nivelAdvertencia: 'alto',
    notaEducativa: 'Ripley presenta las tasas de interés más altas del mercado. Es crucial evitar acumular deuda en esta tarjeta y pagar más que el mínimo cada mes.'
},{

    nombreComercial: 'Banco Estado',
    razonSocial: 'Banco del Estado de Chile',
    tipo: 'banca',
    tasaInteresTipica: 28.0,
    porcentajePagoMinimo: 2.5,
    nivelAdvertencia: 'medio',
    notaEducativa: 'Tasas mas bajas que el retail, pero muy fácil acceso a credito'
},{

    nombreComercial: 'MACH',
    razonSocial: 'MACH S.A.',
    tipo: 'fintech',
    tasaInteresTipica: 35.0,
    porcentajePagoMinimo: 3.5,
    nivelAdvertencia: 'alto',
    notaEducativa: 'Las fintech suelen ofrecer procesos de solicitud rápidos, pero sus tasas de interés pueden ser elevadas. Es importante comparar con otras opciones antes de solicitar crédito.'
}
]

export async function runAcreedoresSeed(dataSource: DataSource) {
    const acreedorRepository = dataSource.getRepository(Acreedor)
    for (const acreedorData of seedAcreedores) {
        const existing = await acreedorRepository.findOneBy({ nombreComercial: acreedorData.nombreComercial })
        if (!existing) {
            const acreedor = acreedorRepository.create(acreedorData)
            await acreedorRepository.save(acreedor)
            console.log(`Acreedor '${acreedor.nombreComercial}' creado.`)
        } else {
            console.log(`Acreedor '${existing.nombreComercial}' ya existe, omitiendo.`)
        }
    }
    console.log('Seed de acreedores completado.')
}

    



