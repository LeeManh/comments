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
// import { Comment } from './comments.model';
import { PostTag } from './post-tags.model';
import { Tag } from './tag.model';
import { Series } from './series.model';

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

  // @HasMany(() => Comment, { foreignKey: 'postId' })
  // comments: Comment[];

  @BelongsToMany(() => Tag, () => PostTag, 'postId', 'tagId')
  tags: Tag[];

  @ForeignKey(() => Series)
  @Column({ type: DataType.UUID, allowNull: true })
  seriesId?: string;

  @BelongsTo(() => Series, { foreignKey: 'seriesId', onDelete: 'SET NULL' })
  series?: Series;
}
