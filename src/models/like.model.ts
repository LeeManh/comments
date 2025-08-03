import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { User } from './user.model';

@Table({
  tableName: 'likes',
  timestamps: true,
  indexes: [
    {
      name: 'idx_unique_like',
      unique: true,
      fields: ['targetId', 'targetType', 'userId'],
    },
  ],
})
export class Like extends AbstractModel {
  @Column({ type: DataType.UUID, allowNull: false })
  targetId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  targetType: LikeTargetType;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDislike: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;
}
