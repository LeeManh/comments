import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { AbstractModel } from './abstract.model';
import { Tag } from './tag.model';
import { Series } from './series.model';

@Table({
  tableName: 'series_tags',
  timestamps: true,
  indexes: [
    {
      name: 'idx_unique_series_tag',
      unique: true,
      fields: ['seriesId', 'tagId'],
    },
    {
      name: 'idx_series_tags_tag_id',
      fields: ['tagId'],
    },
  ],
})
export class SeriesTags extends AbstractModel {
  @ForeignKey(() => Series)
  @Column({ type: DataType.UUID, allowNull: false })
  seriesId: string;

  @BelongsTo(() => Series, { foreignKey: 'seriesId', onDelete: 'CASCADE' })
  series: Series;

  @ForeignKey(() => Tag)
  @Column({ type: DataType.UUID, allowNull: false })
  tagId: string;

  @BelongsTo(() => Tag, { foreignKey: 'tagId', onDelete: 'CASCADE' })
  tag: Tag;
}
