import { Column, DataType, Model } from 'sequelize-typescript';

export abstract class AbstractModel extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;
}
