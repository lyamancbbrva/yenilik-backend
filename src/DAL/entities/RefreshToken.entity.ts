import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './User.entity';
import { CommonEntity } from './Common.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends CommonEntity{
  @Column({ type: 'text', nullable: false })
  refresh_token!: string;

  @ManyToOne(() => UserEntity, user => user.refreshTokens, { onDelete: 'CASCADE' })
  user!: UserEntity;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;
}
