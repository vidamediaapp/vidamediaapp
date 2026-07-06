import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import {Entity} from 'typeorm'
import { Deuda } from './deudas';
import { Simulacion } from './simulaciones';
import { Presupuesto } from './presupuesto';


@Entity({name: 'usuarios'})
export class Usuario {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true, length: 255})
  email: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({name: "nombre", length: 50})
  nombre: string;

  @Column({name: "apaterno", length: 50})
  apaterno: string;

  @Column({name: "amaterno", length: 50})
  amaterno: string;

  @Column({ name: 'rut', length: 12, unique: true, nullable: true })
  rut!: string;

  @Column({name: "telefono", nullable: true,length: 20})
  telefono: string;

  @Column({ name: 'ingreso', type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyIncome!: number; 

  @CreateDateColumn({name: "creado_en"})
  creadoen: Date;

  @UpdateDateColumn({name: "actualizado_en"})
  actualizadoen: Date;

  @OneToMany(() => Deuda, (deuda) => deuda.usuario)
  deudas!: Deuda[];

  @OneToMany(() => Simulacion, (simulacion) => simulacion.usuario)
  simulaciones!: Simulacion[];

  @OneToMany(() => Presupuesto, (presupuesto) => presupuesto.usuario)
  presupuestos!: Presupuesto[];
}