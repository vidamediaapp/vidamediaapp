import { Request, Response } from 'express';
import { CmfService } from '../services/cmf-service';

export class CmfController {
    private cmfService = new CmfService();


    async obtenerUF(req: Request, res: Response): Promise<void> {
        try {
            const ufData = await this.cmfService.obtenerUF();
            res.status(200).json({
                success: true,
                data: {
                    valor: ufData.valor,
                    fecha: ufData.fecha,
                }
            });
        } catch (error) {
            console.error('Error al obtener UF:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el valor de la UF'
            });
        }
    }
}