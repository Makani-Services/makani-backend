import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('customer_forgotten_password')
export class CustomerForgottenPasswordEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  newPasswordToken: string;

  @Column({ nullable: true, type: 'timestamptz' })
  timestamp: Date;
}
