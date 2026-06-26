
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany } from 'typeorm';
import { Acreedor } from './acreedores';
import { Usuario } from './usuario';
import { Simulacion } from './simulaciones';

@Entity({ name: 'deudas' })
export class Deuda {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.deudas, { 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_usuario' })  
  usuario!: Usuario;


  @ManyToOne(() => Acreedor, (acreedor) => acreedor.deudas, { 
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_acreedor' })  
  acreedor!: Acreedor;


  @Column({ name: 'monto_original', type: 'decimal', precision: 12, scale: 2 })
  monto_original!: number;

  @Column({ name: 'saldo_pendiente', type: 'decimal', precision: 12, scale: 2 })
  saldo_pendiente!: number;

  @Column({ name: 'tasa_interes', type: 'decimal', precision: 5, scale: 2 })
  tasa_interes!: number;

  @Column({ name: 'porcentaje_pago_minimo', type: 'decimal', precision: 5, scale: 2 })
  porcentaje_pago_minimo!: number;

  @Column({ name: 'fecha_limite', type: 'date' })
  fecha_limite: Date;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'pendiente' })
  estado: string;

@OneToMany(() => Simulacion, (simulaciones) => simulaciones.deuda)
simulaciones!: Simulacion[];
    
}