import {
    DeepPartial,
    VendureEntity,
    Product,
    Customer,
    Asset,
} from '@vendure/core';
import {
    Column,
    Entity,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from 'typeorm';

export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity()
export class ProductReview extends VendureEntity {
    constructor(input?: DeepPartial<ProductReview>) {
        super(input);
    }

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @ManyToOne(() => Customer, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    customer: Customer | null;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string | null;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'varchar', length: 150 })
    customerName: string;

    @Column({ default: false })
    verifiedPurchase: boolean;

    @Column({
        type: 'varchar',
        length: 20,
        default: ReviewStatus.PENDING,
    })
    status: ReviewStatus;

    @ManyToMany(() => Asset)
    @JoinTable()
    images: Asset[];
}