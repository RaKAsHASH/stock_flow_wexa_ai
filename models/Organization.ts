import { Sequelize, DataTypes, Model } from 'sequelize';

export class Organization extends Model {
  declare id: string;
  declare name: string;
  declare defaultLowStock: number;
}

export function initOrganization(sequelize: Sequelize) {
  Organization.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    defaultLowStock: { type: DataTypes.INTEGER, defaultValue: 5 },
  }, { sequelize, modelName: 'Organization' });
  return Organization;
}