import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare organizationId: string | null;
}

export function initUser(sequelize: Sequelize) {
  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    organizationId: { type: DataTypes.UUID, allowNull: true },
  }, { sequelize, modelName: 'User' });
  return User;
}