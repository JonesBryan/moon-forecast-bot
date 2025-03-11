import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type point = { type: 'Point'; coordinates: [number, number] | number[] };

export interface UserAttributes {
  id: number;
  discord_id: string;
  coordinates: point;
  timezone_id: number;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'timezone_id'>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public discord_id!: string;
  public coordinates!: point;
  public timezone_id!: number;
}

export function UserFactory(sequelize: Sequelize): void {
  User.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      discord_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        allowNull: false,
      },
      coordinates: {
        type: DataTypes.GEOMETRY('POINT', 4326),
      },
      timezone_id: {
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false,
    },
  );
}
