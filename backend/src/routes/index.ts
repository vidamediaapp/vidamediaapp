import { Router } from 'express';
import authRoutes from './auth-routes';          
import usuarioRoutes from './usuario-routes';    
import acreedoresRoutes from './acreedores-routes';
import deudasRoutes from './deuda-routes';
import pagosRoutes from './pagos-routes';
import presupuestosRoutes from './presupuestos-routes';
import simulacionesRoutes from './simulaciones-routes';

const router = Router();


router.use('/auth', authRoutes);    


router.use('/usuarios', usuarioRoutes); 


router.use('/acreedores', acreedoresRoutes);
router.use('/deudas', deudasRoutes);
router.use('/pagos', pagosRoutes);
router.use('/presupuesto', presupuestosRoutes);
router.use('/simulaciones', simulacionesRoutes);


router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

export default router;