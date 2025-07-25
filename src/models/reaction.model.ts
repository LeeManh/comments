import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { ReactionTarget, ReactionType } from 'src/commons/types/reaction.type';
import { User } from './user.model';
import { Post } from './post.model';
import { Comment } from './comments.model';

@Table({
  tableName: 'reactions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'targetId', 'targetType'],
    },
  ],
})
export class Reaction extends AbstractModel {
  @Column({ type: DataType.INTEGER, allowNull: false })
  type: ReactionType;

  @Column({ type: DataType.INTEGER, allowNull: false })
  targetType: ReactionTarget;

  @Column({ type: DataType.UUID, allowNull: false })
  targetId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user: User;

  @BelongsTo(() => Post, {
    foreignKey: 'targetId',
    // onDelete: 'CASCADE',
    constraints: false,
  })
  post: Post;

  @BelongsTo(() => Comment, {
    foreignKey: 'targetId',
    // onDelete: 'CASCADE',
    constraints: false,
  })
  comment: Comment;
}
