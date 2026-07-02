import { Router } from 'express';
import acreedoresRoutes from './acreedores-routes';
import deudasRoutes from './deuda-routes';
import pagosRoutes from './pagos-routes';
import presupuestosRoutes from './presupuestos-routes';
import simulacionesRoutes from './simulaciones-routes';
import usuariosRoutes from './usuario-routes';

const router = Router();


router.use('/acreedores', acreedoresRoutes);
router.use('/deudas', deudasRoutes);
router.use('/pagos', pagosRoutes);
router.use('/presupuesto', presupuestosRoutes);
router.use('/simulaciones', simulacionesRoutes);
router.use('/usuarios', usuariosRoutes);


router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

export default router;