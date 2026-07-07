import { Request, Response } from 'express';
import { ComunidadService } from '../services/comunidad-service';
import { AppDataSource } from '../db';
import { Testimonio } from '../entities/testimonio';
import { ForoPublicacion } from '../entities/foro-publicacion';
import { ForoComentario } from '../entities/foro-comentario';
import { Deuda } from '../entities/deudas';

export class ComunidadController {
    private comunidadService = new ComunidadService(
        AppDataSource.getRepository(Testimonio),
        AppDataSource.getRepository(ForoPublicacion),
        AppDataSource.getRepository(ForoComentario),
        AppDataSource.getRepository(Deuda)
    );

    // Testimonios

    async obtenerTestimonios(req: Request, res: Response): Promise<void> {
        try {
            const acreedorId = req.query.acreedorId as string;
            const testimonios = await this.comunidadService.obtenerTestimoniosAprobados(acreedorId);

            res.status(200).json({
                success: true,
                data: testimonios
            });
        } catch (error) {
            console.error('Error al obtener testimonios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener testimonios'
            });
        }
    }

    async crearTestimonio(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { deudaId, mensaje, consejo, estrategiaUsada, anonimo, nombreMostrar } = req.body;

            if (!deudaId || !mensaje || !estrategiaUsada) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios: deudaId, mensaje, estrategiaUsada'
                });
                return;
            }

            const testimonio = await this.comunidadService.crearTestimonio(
                usuarioId,
                deudaId,
                {
                    mensaje,
                    consejo,
                    estrategiaUsada,
                    anonimo: anonimo ?? true,
                    nombreMostrar
                }
            );

            res.status(201).json({
                success: true,
                message: 'Testimonio creado exitosamente. Será revisado por moderación.',
                data: testimonio
            });
        } catch (error) {
            console.error('Error al crear testimonio:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al crear testimonio'
            });
        }
    }

    
    async votarTestimonio(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const id = req.params.id as string;
            await this.comunidadService.votarTestimonio(id, usuarioId);

            res.status(200).json({
                success: true,
                message: 'Voto registrado exitosamente'
            });
        } catch (error) {
            console.error('Error al votar testimonio:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Error al votar testimonio'
            });
        }
    }

    // Foro

    async obtenerPublicaciones(req: Request, res: Response): Promise<void> {
        try {
            const acreedorId = req.query.acreedorId as string;
            const publicaciones = await this.comunidadService.obtenerPublicaciones(acreedorId);

            res.status(200).json({
                success: true,
                data: publicaciones
            });
        } catch (error) {
            console.error('Error al obtener publicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener publicaciones'
            });
        }
    }

    async crearPublicacion(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { acreedorId, titulo, contenido, tipo, anonimo, nombreMostrar } = req.body;

            if (!acreedorId || !titulo || !contenido || !tipo) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios: acreedorId, titulo, contenido, tipo'
                });
                return;
            }

            const publicacion = await this.comunidadService.crearPublicacion(
                usuarioId,
                {
                    acreedorId,
                    titulo,
                    contenido,
                    tipo,
                    anonimo: anonimo ?? true,
                    nombreMostrar
                }
            );

            res.status(201).json({
                success: true,
                message: 'Publicación creada exitosamente',
                data: publicacion
            });
        } catch (error) {
            console.error('Error al crear publicación:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al crear publicación'
            });
        }
    }

   
    async agregarComentario(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const id = req.params.id as string;
            const { contenido, anonimo, nombreMostrar } = req.body;

            if (!contenido) {
                res.status(400).json({
                    success: false,
                    message: 'El contenido del comentario es obligatorio'
                });
                return;
            }

            const comentario = await this.comunidadService.agregarComentario(
                id,
                usuarioId,
                {
                    contenido,
                    anonimo: anonimo ?? true,
                    nombreMostrar
                }
            );

            res.status(201).json({
                success: true,
                message: 'Comentario agregado exitosamente',
                data: comentario
            });
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Error al agregar comentario'
            });
        }
    }

    
    async votarPublicacion(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const id = req.params.id as string;
            await this.comunidadService.votarPublicacion(id, usuarioId);

            res.status(200).json({
                success: true,
                message: 'Voto registrado exitosamente'
            });
        } catch (error) {
            console.error('Error al votar publicación:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Error al votar publicación'
            });
        }
    }
}