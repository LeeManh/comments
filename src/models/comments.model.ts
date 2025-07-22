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

@Table({ tableName: 'comments', timestamps: true })
export class Comment extends AbstractModel {
  @Column({ type: DataType.TEXT, allowNull: false })
  message: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  postId: string;

  @BelongsTo(() => Post, { foreignKey: 'postId', onDelete: 'CASCADE' })
  post: Post;

  @ForeignKey(() => Comment)
  @Column({ type: DataType.UUID, allowNull: true })
  parentId?: string;

  @BelongsTo(() => Comment, { foreignKey: 'parentId' })
  parent?: Comment;

  @HasMany(() => Comment, { foreignKey: 'parentId' })
  replies: Comment[];
}
