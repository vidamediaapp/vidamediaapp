import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario';

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
  mes!: number; // 1-12

  @Column({ name: 'año', type: 'int' })
  año!: number;


  @Column({ name: 'salario', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salario!: number;

  @Column({ name: 'extras', type: 'decimal', precision: 12, scale: 2, default: 0 })
  extras!: number;

  @Column({ name: 'pagos_planificados', type: 'jsonb', default: {} })
  pagosPlanificados!: Record<string, number>;


  @Column({ name: 'deudas_planificadas', type: 'jsonb', default: [] })
  deudasPlanificadas!: {
    creditorId: string;
    totalAmount: number;
    totalInstallments: number;
    paidInstallments: number;
    monthlyPayment: number;
  }[];


  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;
}