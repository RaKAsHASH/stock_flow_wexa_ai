import { Sequelize, DataTypes, Model } from 'sequelize';

export class Product extends Model {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare sku: string;
  declare description: string | null;
  declare quantityOnHand: number;
  declare costPrice: string | null;
  declare sellingPrice: string | null;
  declare lowStockThreshold: number | null;
}

export function initProduct(sequelize: Sequelize) {
  Product.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    quantityOnHand: { type: DataTypes.INTEGER, defaultValue: 0 },
    costPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    sellingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    lowStockThreshold: { type: DataTypes.INTEGER, allowNull: true },
  }, { 
    sequelize, 
    modelName: 'Product',
    indexes: [{ unique: true, fields: ['organizationId', 'sku'] }] 
  });
  return Product;
}