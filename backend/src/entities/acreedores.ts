import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Deuda } from './deudas';

@Entity({ name: 'acreedores' })
export class Acreedor {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string; 

  @Column({ name: 'nombre_comercial', length: 100 })
  nombreComercial!: string;

  @Column({ name: 'tipo', length: 50 })
  tipo!: string;

  @Column({ name: 'tasa_interes_tipica', type: 'decimal', precision: 5, scale: 2, nullable: true })
  tasaInteresTipica!: number;

  @Column({ name: 'porcentaje_pago_minimo', type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajePagoMinimo!: number;

  @Column({ name: 'nivel_advertencia', length: 20, default: 'medio' })
  nivelAdvertencia!: string;

  @Column({ name: 'nota_educativa', type: 'text', nullable: true })
  notaEducativa!: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;

  @OneToMany(() => Deuda, (deuda) => deuda.acreedor)
  deudas!: Deuda[];
}