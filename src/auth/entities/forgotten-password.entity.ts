import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('forgotten_password')
export class ForgottenPasswordEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  newPasswordToken: string;

  @Column({ nullable: true, type: 'timestamptz' })
  timestamp: Date;
}
