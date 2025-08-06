import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { User } from './user.model';
import { Post } from './post.model';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import { Bookmark } from './bookmark.model';
// import { Comment } from './comments.model';

@Table({ tableName: 'series', timestamps: true })
export class Series extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.STRING, allowNull: false })
  thumbnail: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId: string;

  @BelongsTo(() => User, { foreignKey: 'authorId', onDelete: 'CASCADE' })
  author: User;

  @HasMany(() => Post, { foreignKey: 'seriesId' })
  posts: Post[];

  // @HasMany(() => Comment, { foreignKey: 'seriesId' })
  // comments: Comment[];

  @HasMany(() => Bookmark, {
    foreignKey: 'targetId',
    constraints: false,
    scope: { targetType: BookmarkTargetType.SERIES },
  })
  bookmarks: Bookmark[];
}
