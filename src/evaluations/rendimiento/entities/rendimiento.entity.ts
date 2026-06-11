import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn} from 'typeorm'

@Entity('rendimientos',{schema:'public'})
export class Rendimiento{
    @PrimaryGeneratedColumn('uuid')
    id!:string;
     
    @Column('uuid')
    purchase_order_item_id!:string;

    @Column('uuid')
    proveedor_id!:string;
     
    @Column('integer')
    bodega_performance!: number;

    @Column('integer')
    calidad_performance!: number;
    
    @Column('integer')
    compras_performance!: number;
    
    @Column('integer')
    total_performance!: number;
     
    @CreateDateColumn({ type: 'date',
  default: () => 'CURRENT_TIMESTAMP'})
    date_performance!:Date
}