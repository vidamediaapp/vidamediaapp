import {Request, Response} from 'express';
import {AcreedorService} from '../services/acreedor-service';

export class AcreedorController {
    constructor(private acreedorService: AcreedorService) {}

    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            const acreedores = await this.acreedorService.findAll();
            res.json(acreedores);
        } catch (error) {
            console.error('Error al obtener acreedores:', error);
            res.status(500).json({ message: 'Error al obtener acreedores' });
        }
    }

    async obtenerAcreedorPorId(req: Request, res: Response): Promise<void> {

        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const acreedor = await this.acreedorService.obtenerAcreedorPorId(id);
            res.json({ success: true, data: acreedor });
        } catch (error) {
            console.error('Error al obtener acreedor por ID:', error);
            res.status(500).json({ message: 'Error al obtener acreedor por ID' });
        }

    }

    async obtenerTasaInteresTipica(req: Request, res: Response): Promise<void> {
        try {
            const tasas = await this.acreedorService.obtenertasaInteresTipica();
            res.json(tasas);
        } catch (error) {
            console.error('Error al obtener tasa de interés típica:', error);
            res.status(500).json({ message: 'Error al obtener tasa de interés típica' });
        }
    }

    async obtenerPorTipo(req: Request, res: Response): Promise<void> {
        try {
            const tipo = req.params.tipo;
            const acreedores = await this.acreedorService.obtenerPorTipo(tipo as string);
            res.json(acreedores);
        } catch (error) {
            console.error('Error al obtener acreedores por tipo:', error);
            res.status(500).json({ message: 'Error al obtener acreedores por tipo' });
        }
    }

    




    }