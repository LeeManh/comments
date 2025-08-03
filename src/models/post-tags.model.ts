import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  Index,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { Post } from './post.model';
import { Tag } from './tag.model';

@Table({
  tableName: 'post_tags',
  timestamps: true,
  indexes: [
    {
      name: 'idx_unique_post_tag',
      unique: true,
      fields: ['postId', 'tagId'],
    },
    {
      name: 'idx_post_tags_tag_id',
      fields: ['tagId'],
    },
  ],
})
export class PostTag extends AbstractModel {
  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  postId: string;

  @BelongsTo(() => Post, { foreignKey: 'postId', onDelete: 'CASCADE' })
  post: Post;

  @ForeignKey(() => Tag)
  @Column({ type: DataType.UUID, allowNull: false })
  tagId: string;

  @BelongsTo(() => Tag, { foreignKey: 'tagId', onDelete: 'CASCADE' })
  tag: Tag;
}
