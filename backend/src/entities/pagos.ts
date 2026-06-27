import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";  
import { Deuda } from "./deudas";

@Entity({ name: 'pagos'})
export class Pago {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne (() => Deuda, (deuda) => deuda.pagos, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({name: 'id_deuda'})
    deuda!: Deuda;

    @Column ({ name: 'monto', type: 'decimal', precision: 12, scale: 2 })
    monto!: number
    
    @Column({name: 'fecha_pago', type: 'date', default: () => 'CURRENT_DATE'})
    fechaPago!: Date;

    @CreateDateColumn({name: 'creado_en'})
    creadoEn!: Date;






}

