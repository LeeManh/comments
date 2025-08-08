import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './post.model';
import { AbstractModel } from './abstract.model';
import { Comment } from './comments.model';
import { Gender, UserRole } from 'src/commons/constants/user.constant';
import { RefreshToken } from './refresh-token.model';
import { Like } from './like.model';
import { Bookmark } from './bookmark.model';
import { Activity } from './activity.model';
import { Series } from './series.model';
import { Exclude } from 'class-transformer';

@Table({ tableName: 'users', timestamps: true })
export class User extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  username: string;

  @Column({ type: DataType.STRING })
  displayName: string;

  @Column({ type: DataType.DATE })
  birthDay: Date;

  @Column({ type: DataType.INTEGER })
  gender: Gender;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar?: string;

  @HasMany(() => Post, { foreignKey: 'authorId' })
  posts: Post[];

  @HasMany(() => Comment, { foreignKey: 'userId' })
  comments: Comment[];

  @HasMany(() => RefreshToken, { foreignKey: 'userId' })
  refreshTokens: RefreshToken[];

  @HasMany(() => Like, { foreignKey: 'userId' })
  likes: Like[];

  @HasMany(() => Bookmark, { foreignKey: 'userId' })
  bookmarks: Bookmark[];

  @HasMany(() => Activity, { foreignKey: 'userId' })
  activities: Activity[];

  @HasMany(() => Series, { foreignKey: 'authorId' })
  series: Series[];
}
