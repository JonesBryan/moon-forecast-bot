import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type point = { type: 'Point'; coordinates: [number, number] | number[] };

export interface UserAttributes {
  id: number;
  discord_id: string;
  coordinates: point;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public discord_id!: string;
  public coordinates: point;
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
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false,
    },
  );
}
