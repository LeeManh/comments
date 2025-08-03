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
import { Comment } from './comments.model';
import { PostTag } from './post-tags.model';
import { Tag } from './tag.model';

@Table({
  tableName: 'posts',
  timestamps: true,
  indexes: [
    {
      name: 'idx_unique_featured_post',
      unique: true,
      fields: ['featured'],
      where: { featured: true },
    },
  ],
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

  @HasMany(() => Comment, { foreignKey: 'postId' })
  comments: Comment[];

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  featured: boolean;

  @BelongsToMany(() => Tag, () => PostTag, 'postId', 'tagId')
  tags: Tag[];
}
