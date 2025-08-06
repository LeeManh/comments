import {
  AfterFind,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import { User } from './user.model';
import { Post } from './post.model';
import { Series } from './series.model';

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

  @BelongsTo(() => Post, {
    foreignKey: 'targetId',
    constraints: false,
  })
  post: Post;

  @BelongsTo(() => Series, {
    foreignKey: 'targetId',
    constraints: false,
  })
  series: Series;

  // Virtual field để truy cập target
  get target() {
    if (this.targetType === BookmarkTargetType.POST) {
      return this.post;
    } else if (this.targetType === BookmarkTargetType.SERIES) {
      return this.series;
    }
    return null;
  }

  // Hook để tự động xử lý target sau khi find
  @AfterFind
  static afterFindHook(result: any) {
    const bookmarks = Array.isArray(result) ? result : [result];

    for (const bookmark of bookmarks) {
      if (bookmark) {
        // Tạo target field
        if (bookmark.targetType === BookmarkTargetType.POST && bookmark.post) {
          bookmark.dataValues.data = bookmark.post;
        } else if (
          bookmark.targetType === BookmarkTargetType.SERIES &&
          bookmark.series
        ) {
          bookmark.dataValues.data = bookmark.series;
        }

        // Xóa các field không cần thiết
        delete bookmark.dataValues?.post;
        delete bookmark.dataValues?.series;
      }
    }
  }
}
