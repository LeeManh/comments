import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import {
  ActivityTargetType,
  ActivityType,
} from 'src/commons/constants/activity.constant';
import { User } from './user.model';

@Table({
  tableName: 'activities',
  timestamps: true,
  indexes: [
    {
      name: 'idx_activities_user_target',
      fields: ['userId', 'targetType', 'targetId'],
    },
    {
      name: 'idx_activities_created_at',
      fields: ['createdAt'],
    },
  ],
})
export class Activity extends AbstractModel {
  @Column({ type: DataType.UUID, allowNull: false })
  targetId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  targetType: ActivityTargetType;

  @Column({ type: DataType.INTEGER, allowNull: true })
  type: ActivityType;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;
}
