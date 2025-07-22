import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './post.model';
import { AbstractModel } from './abstract.model';
import { Comment } from './comments.model';
import { UserRole } from 'src/commons/types/user.type';

@Table({ tableName: 'users', timestamps: true })
export class User extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  role: UserRole;

  @HasMany(() => Post, { foreignKey: 'authorId' })
  posts: Post[];

  @HasMany(() => Comment, { foreignKey: 'userId' })
  comments: Comment[];
}
