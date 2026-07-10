import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Acreedor } from './acreedores';
import { Usuario } from './usuario';
import { Simulacion } from './simulaciones';
import { Pago } from './pagos';
import { Presupuesto } from './presupuesto';

@Entity({ name: 'deudas' })
export class Deuda {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.deudas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Acreedor, (acreedor) => acreedor.deudas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_acreedor' })
  acreedor!: Acreedor;

  @ManyToOne(() => Presupuesto, (presupuesto) => presupuesto.deudas, { nullable: true })
  @JoinColumn({ name: 'id_presupuesto' })
  presupuesto!: Presupuesto | null;

  @OneToMany(() => Pago, (pago) => pago.deuda)
  pagos!: Pago[];

  @OneToMany(() => Simulacion, (simulacion) => simulacion.deuda)
  simulaciones!: Simulacion[];

  @Column({ name: 'monto_original', type: 'decimal', precision: 12, scale: 2 })
  monto_original!: number;

  @Column({ name: 'saldo_pendiente', type: 'decimal', precision: 12, scale: 2 })
  saldo_pendiente!: number;

  @Column({ name: 'tasa_interes', type: 'decimal', precision: 5, scale: 2 })
  tasa_interes!: number;

  @Column({ name: 'porcentaje_pago_minimo', type: 'decimal', precision: 5, scale: 2 })
  porcentaje_pago_minimo!: number;

  @Column({ name: 'fecha_limite', type: 'date' })
  fecha_limite!: Date;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'pendiente' })
  estado!: string;

  @Column({ name: 'total_cuotas', type: 'int', default: 12 })
  totalCuotas!: number;

  @Column({ name: 'cuotas_pagadas', type: 'int', default: 0 })
  cuotasPagadas!: number;

  @Column({ name: 'cuota_mensual', type: 'decimal', precision: 12, scale: 2, default: 0 })
  cuotaMensual!: number;

  @Column({ name: 'cuotas_sin_interes', type: 'decimal', precision: 12, scale: 2, default: 0 })
  cuotas_sin_interes!: number;

  @Column({ name: 'mantencion', type: 'decimal', precision: 12, scale: 2, default: 0 })
  mantencion!: number;

  @Column({ name: 'seguros', type: 'decimal', precision: 12, scale: 2, default: 0 })
  seguros!: number;

  @Column({ name: 'comisiones', type: 'decimal', precision: 12, scale: 2, default: 0 })
  comisiones!: number;

  @Column({ name: 'intereses_acumulados', type: 'decimal', precision: 12, scale: 2, default: 0 })
  intereses_acumulados!: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;
}