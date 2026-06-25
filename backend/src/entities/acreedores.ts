
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Deuda } from './deudas';
import { Simulacion } from './simulaciones';

@Entity({ name: 'acreedores' })
export class Acreedor {
   
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre_comercial', length: 100, unique: true })
    nombreComercial: string;

    @Column({ name: 'razon_social', length: 150, nullable: true })
    razonSocial: string;

    @Column({ name: 'tipo', length: 50 })
    tipo: string;

    @Column({ name: 'tasa_interes_tipica', type: 'decimal', precision: 5, scale: 2, nullable: true })
    tasaInteresTipica: number;

    @Column({ name: 'porcentaje_pago_minimo', type: 'decimal', precision: 5, scale: 2, nullable: true })
    porcentajePagoMinimo: number;

    @Column({ name: 'nivel_advertencia', length: 20, default: 'medio' })
    nivelAdvertencia: string; 

    @Column({ name: 'nota_educativa', type: 'text', nullable: true })
    notaEducativa: string;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn: Date;
      
    @OneToMany(() => Deuda, (deuda) => deuda.acreedor)
    deudas!: Deuda[];

    @OneToMany(() => Simulacion, (simulacion) => simulacion.acreedor)
    simulaciones!: Simulacion[];
    
}