import {DataSource} from 'typeorm'
import {Acreedor} from '../entities/acreedores'

export const seedAcreedores = [
  {
    id: 'falabella',
    nombreComercial: 'Falabella CMR',
    tipo: 'retail',
    tasaInteresTipica: 44.0,
    porcentajePagoMinimo: 3.0,
    nivelAdvertencia: 'alto',
    notaEducativa: 'Las tarjetas de retail tienen las tasas más altas del mercado.'
  },
  {
    id: 'ripley',
    nombreComercial: 'Ripley',
    tipo: 'retail',
    tasaInteresTipica: 38.0,
    porcentajePagoMinimo: 3.0,
    nivelAdvertencia: 'alto',
    notaEducativa: 'Tasa muy alta. Prioriza pagar esta deuda.'
  },
  {
    id: 'cajaAndes',
    nombreComercial: 'Caja Los Andes',
    tipo: 'cooperativa',
    tasaInteresTipica: 18.0,
    porcentajePagoMinimo: 2.5,
    nivelAdvertencia: 'medio',
    notaEducativa: 'Descuento por planilla. Revisa tu liquidación.'
  },
  {
    id: 'bancoEstado',
    nombreComercial: 'BancoEstado',
    tipo: 'banco',
    tasaInteresTipica: 12.0,
    porcentajePagoMinimo: 2.0,
    nivelAdvertencia: 'bajo',
    notaEducativa: 'Tasa competitiva. Mantén pagos al día.'
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

    



