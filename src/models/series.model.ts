import {
  BelongsTo,
  BelongsToMany,
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
import { Tag } from './tag.model';
import { SeriesTags } from './series-tags.model';
import {
  SeriesStatus,
  SeriesVisibility,
} from 'src/commons/constants/series.constant';

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

  @HasMany(() => Bookmark, {
    foreignKey: 'targetId',
    constraints: false,
    scope: { targetType: BookmarkTargetType.SERIES },
  })
  bookmarks: Bookmark[];

  @BelongsToMany(() => Tag, () => SeriesTags, 'seriesId', 'tagId')
  tags: Tag[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: SeriesStatus.DRAFT,
  })
  status: SeriesStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: SeriesVisibility.PRIVATE,
  })
  visibility: SeriesVisibility;

  @Column({ type: DataType.DATE, allowNull: true })
  publishedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  scheduledAt: Date;
}
