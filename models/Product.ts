import { Sequelize, DataTypes, Model } from 'sequelize';

export class Product extends Model {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare sku: string;
  declare quantityOnHand: number;
  declare lowStockThreshold: number | null;
}

export function initProduct(sequelize: Sequelize) {
  Product.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false },
    quantityOnHand: { type: DataTypes.INTEGER, defaultValue: 0 },
    lowStockThreshold: { type: DataTypes.INTEGER, allowNull: true },
  }, { 
    sequelize, 
    modelName: 'Product',
    indexes: [{ unique: true, fields: ['organizationId', 'sku'] }] 
  });
  return Product;
}