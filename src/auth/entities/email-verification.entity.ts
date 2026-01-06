import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('email_verification')
export class EmailVerificationEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  emailToken: string;

  @Column({ nullable: true, type: 'timestamptz' })
  timestamp: Date;
}
