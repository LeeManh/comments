import { BelongsToMany, Column, DataType, Table } from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { PostTag } from './post-tags.model';
import { Post } from './post.model';
import { Series } from './series.model';
import { SeriesTags } from './series-tags.model';

@Table({ tableName: 'tags', timestamps: true })
export class Tag extends AbstractModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  slug: string;

  @BelongsToMany(() => Post, () => PostTag, 'tagId', 'postId')
  posts: Post[];

  @BelongsToMany(() => Series, () => SeriesTags, 'tagId', 'seriesId')
  series: Series[];
}
