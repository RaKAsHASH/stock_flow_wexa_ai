import { Sequelize } from 'sequelize';
import * as pg from 'pg';

const globalForSequelize = global as unknown as { sequelize: Sequelize };

export const sequelize =
  globalForSequelize.sequelize ||
  new Sequelize(process.env.DATABASE_URL as string, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false, 
  });

if (process.env.NODE_ENV !== 'production') globalForSequelize.sequelize = sequelize;

import { initOrganization } from './Organization';
import { initUser } from './User';
import { initProduct } from './Product';

export const Organization = initOrganization(sequelize);
export const User = initUser(sequelize);
export const Product = initProduct(sequelize);

Organization.hasMany(User, { foreignKey: 'organizationId' });
User.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Product, { foreignKey: 'organizationId' });
Product.belongsTo(Organization, { foreignKey: 'organizationId' });
