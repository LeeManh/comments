import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { User } from './user.model';

@Table({ tableName: 'refresh_tokens', timestamps: true })
export class RefreshToken extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  token: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.STRING })
  deviceInfo: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRevoked: boolean;
}
