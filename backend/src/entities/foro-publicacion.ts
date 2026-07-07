import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario';
import { Acreedor } from './acreedores';
import { ForoComentario } from './foro-comentario';

@Entity({ name: 'foro_publicaciones' })
export class ForoPublicacion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: Usuario | null;

    @ManyToOne(() => Acreedor, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_acreedor' })
    acreedor!: Acreedor;

    @Column({ name: 'titulo', type: 'varchar', length: 200 })
    titulo!: string;

    @Column({ name: 'contenido', type: 'text' })
    contenido!: string;

    @Column({ name: 'anonimo', default: true })
    anonimo!: boolean;

    @Column({ name: 'nombre_mostrar', type: 'varchar', length: 100, nullable: true })
    nombreMostrar!: string | null;

    @Column({ name: 'votos_utiles', type: 'int', default: 0 })
    votosUtiles!: number;

    @Column({ name: 'tipo', type: 'varchar', length: 20, default: 'experiencia' })
    tipo!: 'experiencia' | 'pregunta' | 'consejo' | 'alerta';

    @OneToMany(() => ForoComentario, (comentario) => comentario.publicacion)
    comentarios!: ForoComentario[];

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn!: Date;
}