import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { User } from './user.model';
import { PostTag } from './post-tags.model';
import { Tag } from './tag.model';
import { Series } from './series.model';
import { Bookmark } from './bookmark.model';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import {
  PostStatus,
  PostVisibility,
} from 'src/commons/constants/post.constant';

@Table({
  tableName: 'posts',
  timestamps: true,
})
export class Post extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.STRING, allowNull: true })
  thumbnail: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId: string;

  @BelongsTo(() => User, { foreignKey: 'authorId', onDelete: 'CASCADE' })
  author: User;

  @BelongsToMany(() => Tag, () => PostTag, 'postId', 'tagId')
  tags: Tag[];

  @ForeignKey(() => Series)
  @Column({ type: DataType.UUID, allowNull: true })
  seriesId?: string;

  @BelongsTo(() => Series, { foreignKey: 'seriesId', onDelete: 'SET NULL' })
  series?: Series;

  @HasMany(() => Bookmark, {
    foreignKey: 'targetId',
    constraints: false,
    scope: { targetType: BookmarkTargetType.POST },
  })
  bookmarks: Bookmark[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: PostVisibility.PRIVATE,
  })
  visibility: PostVisibility;

  @Column({ type: DataType.DATE, allowNull: true })
  publishedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  scheduledAt: Date;
}
