import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario';
import { Deuda } from './deudas';

@Entity({ name: 'presupuestos' })
export class Presupuesto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.presupuestos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @Column({ name: 'mes', type: 'int' })
  mes!: number;

  @Column({ name: 'año', type: 'int' })
  año!: number;

  @Column({ name: 'salario', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salario!: number;

  @Column({ name: 'extras', type: 'decimal', precision: 12, scale: 2, default: 0 })
  extras!: number;

  @Column({ name: 'pagos_planificados', type: 'jsonb', default: {} })
  pagosPlanificados!: Record<string, number>;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;

  @OneToMany(() => Deuda, (deuda) => deuda.presupuesto)
  deudas!: Deuda[];
}