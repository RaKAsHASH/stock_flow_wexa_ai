export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { sequelize } = await import('@/models');
  await sequelize.sync({
    alter: process.env.NODE_ENV !== 'production',
  });
}
