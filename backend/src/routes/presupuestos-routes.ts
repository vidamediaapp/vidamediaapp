import express from 'express';
import {authenticate} from '../middlewares/auth';
import {PresupuestoService} from '../services/presupuestos-service';
import {AppDataSource} from '../db';
import {Presupuesto} from '../entities/presupuesto';

const router = express.Router();

const presupuestoRepository = AppDataSource.getRepository(Presupuesto);
const presupuestoService = new PresupuestoService(presupuestoRepository);

router.get('/:mes/:año', authenticate, async (req, res) => {
    try {
       
        const mes = parseInt(req.params.mes as string);
        const año = parseInt(req.params.año as string);

    
        if (isNaN(mes) || isNaN(año) || mes < 1 || mes > 12) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año deben ser números válidos (mes 1-12)'
            });
        }

       
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        
        const presupuesto = await presupuestoService.obtenerPresupuestoporMesyAño(
            usuarioId,
            mes,
            año
        );

      
        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                message: `Presupuesto no encontrado para ${mes}/${año}`
            });
        }

       
        res.json({
            success: true,
            data: presupuesto
        });

    } catch (error) {
        console.error('Error al obtener presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener el presupuesto'
        });
    }
});



router.post('/guardar', (req, res) => {
  res.send('guardar presupuesto actual');
});

router.post('/create', (req, res) => {
  res.send('Crear presupuesto');
});

router.get('/historial', (req, res) => {
  res.send('Obtener historial de presupuestos');
});



router.get('/:id', (req, res) => {
  res.send(`Obtener presupuesto con ID: ${req.params.id}`);
}); 