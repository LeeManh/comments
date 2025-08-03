import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import { User } from './user.model';

@Table({
  tableName: 'bookmarks',
  timestamps: true,
  indexes: [
    {
      name: 'idx_unique_bookmark',
      unique: true,
      fields: ['targetId', 'targetType', 'userId'],
    },
  ],
})
export class Bookmark extends AbstractModel {
  @Column({ type: DataType.UUID, allowNull: false })
  targetId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  targetType: BookmarkTargetType;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;
}
