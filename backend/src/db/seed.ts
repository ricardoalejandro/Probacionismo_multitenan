import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './index';
import { users, branches } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin user - CAMBIAR ESTA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe@FirstLogin2024!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const [admin] = await db.insert(users).values({
      username: 'admin',
      passwordHash,
      email: 'admin@escolastica.com',
      userType: 'admin',
    }).returning();

    console.log('✅ Created admin user:', admin.username);

    // Create sample branches
    const sampleBranches = [
      {
        name: 'Sede Central',
        code: 'SAC-001',
        description: 'Sede principal en Lima',
        status: 'active' as const,
      },
      {
        name: 'Sede Norte',
        code: 'SAC-002',
        description: 'Sucursal en Lima Norte',
        status: 'active' as const,
      },
    ];

    const createdBranches = await db.insert(branches).values(sampleBranches).returning();

    console.log('✅ Created branches:', createdBranches.map(b => b.name).join(', '));

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
