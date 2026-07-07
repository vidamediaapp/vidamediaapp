import { Repository } from 'typeorm';
import { Testimonio } from '../entities/testimonio';
import { ForoPublicacion } from '../entities/foro-publicacion';
import { ForoComentario } from '../entities/foro-comentario';
import { Deuda } from '../entities/deudas';
import { Acreedor } from '../entities/acreedores';

export class ComunidadService {
    constructor(
        private testimonioRepo: Repository<Testimonio>,
        private foroRepo: Repository<ForoPublicacion>,
        private comentarioRepo: Repository<ForoComentario>,
        private deudaRepo: Repository<Deuda>
    ) {}

    

    async crearTestimonio(
        usuarioId: string,
        deudaId: string,
        data: {
            mensaje: string;
            consejo?: string;
            estrategiaUsada: string;
            anonimo: boolean;
            nombreMostrar?: string;
        }
    ): Promise<Testimonio> {
     
        const deuda = await this.deudaRepo.findOne({
            where: { id: deudaId, usuario: { id: usuarioId } }
        });

        if (!deuda) {
            throw new Error('Deuda no encontrada');
        }

        if (deuda.estado !== 'pagada') {
            throw new Error('Solo puedes compartir testimonios de deudas pagadas');
        }

        const testimonio = this.testimonioRepo.create({
            usuario: { id: usuarioId },
            acreedor: { id: deuda.acreedor.id },
            montoOriginal: deuda.monto_original,
            mesesTardados: deuda.totalCuotas - deuda.cuotasPagadas,
            estrategiaUsada: data.estrategiaUsada,
            mensaje: data.mensaje,
            consejo: data.consejo || null,
            anonimo: data.anonimo,
            nombreMostrar: data.anonimo ? null : (data.nombreMostrar || 'Usuario'),
            aprobado: false // Requiere moderación
        });

        return await this.testimonioRepo.save(testimonio);
    }

    async obtenerTestimoniosAprobados(acreedorId?: string): Promise<Testimonio[]> {
        const query = this.testimonioRepo.createQueryBuilder('t')
            .leftJoinAndSelect('t.acreedor', 'acreedor')
            .where('t.aprobado = :aprobado', { aprobado: true })
            .orderBy('t.votosUtiles', 'DESC')
            .addOrderBy('t.creadoEn', 'DESC');

        if (acreedorId) {
            query.andWhere('t.id_acreedor = :acreedorId', { acreedorId });
        }

        return await query.getMany();
    }

    async votarTestimonio(testimonioId: string, usuarioId: string): Promise<void> {
        const testimonio = await this.testimonioRepo.findOne({
            where: { id: testimonioId }
        });

        if (!testimonio) {
            throw new Error('Testimonio no encontrado');
        }

        testimonio.votosUtiles += 1;
        await this.testimonioRepo.save(testimonio);
    }

    // ── FORO ──────────────────────────────────────────────────────

    async crearPublicacion(
        usuarioId: string,
        data: {
            acreedorId: string;
            titulo: string;
            contenido: string;
            tipo: 'experiencia' | 'pregunta' | 'consejo' | 'alerta';
            anonimo: boolean;
            nombreMostrar?: string;
        }
    ): Promise<ForoPublicacion> {
        const publicacion = this.foroRepo.create({
            usuario: { id: usuarioId },
            acreedor: { id: data.acreedorId },
            titulo: data.titulo,
            contenido: data.contenido,
            tipo: data.tipo,
            anonimo: data.anonimo,
            nombreMostrar: data.anonimo ? null : (data.nombreMostrar || 'Usuario')
        });

        return await this.foroRepo.save(publicacion);
    }

    async obtenerPublicaciones(acreedorId?: string): Promise<ForoPublicacion[]> {
        const query = this.foroRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.acreedor', 'acreedor')
            .leftJoinAndSelect('p.comentarios', 'comentarios')
            .orderBy('p.votosUtiles', 'DESC')
            .addOrderBy('p.creadoEn', 'DESC');

        if (acreedorId) {
            query.where('p.id_acreedor = :acreedorId', { acreedorId });
        }

        return await query.getMany();
    }

    async agregarComentario(
        publicacionId: string,
        usuarioId: string,
        data: {
            contenido: string;
            anonimo: boolean;
            nombreMostrar?: string;
        }
    ): Promise<ForoComentario> {
        const comentario = this.comentarioRepo.create({
            publicacion: { id: publicacionId },
            usuario: { id: usuarioId },
            contenido: data.contenido,
            anonimo: data.anonimo,
            nombreMostrar: data.anonimo ? null : (data.nombreMostrar || 'Usuario')
        });

        return await this.comentarioRepo.save(comentario);
    }

    async votarPublicacion(publicacionId: string, usuarioId: string): Promise<void> {
    const publicacion = await this.foroRepo.findOne({
        where: { id: publicacionId }
    });

    if (!publicacion) {
        throw new Error('Publicación no encontrada');
    }

    publicacion.votosUtiles += 1;
    await this.foroRepo.save(publicacion);
}
}