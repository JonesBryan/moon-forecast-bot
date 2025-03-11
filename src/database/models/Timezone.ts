import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface TimezoneAttributes {
  id: number;
  name: string;
}

type TimezoneCreationAttributes = Optional<TimezoneAttributes, 'id'>;

export class Timezone
  extends Model<TimezoneAttributes, TimezoneCreationAttributes>
  implements TimezoneAttributes
{
  public id!: number;
  public name!: string;
}

export function TimezoneFactory(sequelize: Sequelize): void {
  Timezone.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(40),
        unique: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'timezones',
      timestamps: false,
    },
  );
}
