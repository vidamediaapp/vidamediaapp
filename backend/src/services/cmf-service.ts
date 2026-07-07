import axios from 'axios';

export interface CmfIndicadorUF {
    valor: number;
    fecha: string;
}

export class CmfService {
    private readonly baseUrl = 'https://api.sbif.cl/api-sbifv3/recursos_api';
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.CMF_API_KEY || '';
        if (!this.apiKey) {
            console.warn('CMF_API_KEY no configurada en .env. La integracion con la CMF no funcionara.');
        }
    }

    private limpiarValor(valorStr: string): number {
        if (!valorStr) return 0;
        const clean = valorStr.replace(/\./g, '').replace(',', '.');
        return parseFloat(clean);
    }

    async obtenerUF(): Promise<CmfIndicadorUF> {
        if (!this.apiKey) {
            console.warn('CMF_API_KEY no configurada. Usando datos de prueba.');
            return this.obtenerUFMock();
        }

        try {
            const url = `${this.baseUrl}/uf?apikey=${this.apiKey}&formato=json`;
            console.log(`Consultando CMF: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
            });

            const data = response.data;

            if (!data) {
                throw new Error('La respuesta de la CMF esta vacia');
            }

            if (!data.UFs || !Array.isArray(data.UFs) || data.UFs.length === 0) {
                throw new Error('La respuesta de la CMF no contiene el array UFs esperado');
            }

            const primerUF = data.UFs[0];

            if (!primerUF || typeof primerUF !== 'object') {
                throw new Error('El formato del objeto UF es invalido');
            }

            if (!primerUF.Valor || !primerUF.Fecha) {
                throw new Error('El objeto UF no contiene Valor o Fecha');
            }

            const valor = this.limpiarValor(primerUF.Valor);

            if (isNaN(valor) || valor <= 0) {
                throw new Error(`El valor de la UF no es valido: ${primerUF.Valor}`);
            }

            return {
                valor: valor,
                fecha: primerUF.Fecha,
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Error de red al consultar CMF: ${error.message}`);
                if (error.response) {
                    console.error(`Codigo: ${error.response.status}`);
                    console.error(`Datos: ${JSON.stringify(error.response.data)}`);
                }
            } else {
                console.error('Error al obtener UF desde la CMF:', error);
            }

            console.warn('Usando datos de prueba de UF (fallo la API)');
            return this.obtenerUFMock();
        }
    }

    private obtenerUFMock(): CmfIndicadorUF {
        return {
            valor: 38000.12,
            fecha: new Date().toISOString().split('T')[0],
        };
    }
}