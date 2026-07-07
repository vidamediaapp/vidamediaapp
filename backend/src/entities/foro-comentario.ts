import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from './usuario';
import { ForoPublicacion } from './foro-publicacion';

@Entity({ name: 'foro_comentarios' })
export class ForoComentario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: Usuario | null;

    @ManyToOne(() => ForoPublicacion, (publicacion) => publicacion.comentarios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: ForoPublicacion;

    @Column({ name: 'contenido', type: 'text' })
    contenido!: string;

    @Column({ name: 'anonimo', default: true })
    anonimo!: boolean;

    @Column({ name: 'nombre_mostrar', type: 'varchar', length: 100, nullable: true })
    nombreMostrar!: string | null;

    @Column({ name: 'votos_utiles', type: 'int', default: 0 })
    votosUtiles!: number;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;
}