import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn } from 'typeorm';
import { Acreedor } from './acreedores';
import { Usuario } from './usuario';
import { Deuda } from './deudas';

@Entity({ name: 'simulaciones' })
export class Simulacion {

  
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  
  @ManyToOne(() => Usuario, (usuario) => usuario.simulaciones, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Deuda, (deuda) => deuda.simulaciones, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_deuda' })
  deuda!: Deuda;



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


  @Column({ name: 'monto_propuesto', type: 'decimal', precision: 12, scale: 2 })
  monto_propuesto!: number;

  @Column({ name: 'meses_proyectados' })
  meses_proyectados!: number; 

  @Column({ name: 'interes_proyectado', type: 'decimal', precision: 12, scale: 2 })
  interes_proyectado!: number; 

  @Column({ name: 'total_pagado', type: 'decimal', precision: 12, scale: 2 })
  total_pagado!: number; 

  @Column({ name: 'es_trampa', default: false })
  es_trampa!: boolean; 


  @Column({ name: 'estrategia_usada', type: 'varchar', length: 50, nullable: true })
  estrategia_usada!: string; 

  @Column({ name: 'nota', type: 'text', nullable: true })
  nota!: string; 

  @Column({ name: 'fecha_simulacion', type: 'date' })
  fecha_simulacion!: Date; 

  @CreateDateColumn({ name: 'creado_en' })
  creado_en!: Date;
}