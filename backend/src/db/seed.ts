import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './index';
import { users, branches } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');
  console.log('📋 Environment variables:');
  console.log('   DOMAIN:', process.env.DOMAIN || '(not set, using localhost)');
  console.log('   ADMIN_INITIAL_USERNAME:', process.env.ADMIN_INITIAL_USERNAME || '(not set, using admin)');
  console.log('   ADMIN_INITIAL_EMAIL:', process.env.ADMIN_INITIAL_EMAIL || '(not set, using admin@domain)');
  console.log('   ADMIN_INITIAL_PASSWORD:', process.env.ADMIN_INITIAL_PASSWORD ? '********' : '(not set, using default)');

  try {
    // Get admin credentials from environment variables
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe@FirstLogin2024!';
    const domain = process.env.DOMAIN || 'localhost';
    
    // Handle email - support ${DOMAIN} placeholder or direct value
    let adminEmail = process.env.ADMIN_INITIAL_EMAIL || `admin@${domain}`;
    if (adminEmail.includes('${DOMAIN}')) {
      adminEmail = adminEmail.replace('${DOMAIN}', domain);
    }
    
    const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    console.log(`\n👤 Setting up admin user: ${adminUsername} (${adminEmail})`);

    // Check if admin exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, adminUsername)).limit(1);
    
    let admin;
    if (existingAdmin.length > 0) {
      // Update existing admin with new credentials from environment
      [admin] = await db.update(users)
        .set({
          passwordHash,
          email: adminEmail,
          updatedAt: new Date(),
        })
        .where(eq(users.username, adminUsername))
        .returning();
      console.log('✅ Updated admin user credentials:', admin.username, admin.email);
    } else {
      // Create new admin
      [admin] = await db.insert(users).values({
        username: adminUsername,
        passwordHash,
        email: adminEmail,
        userType: 'admin',
      }).returning();
      console.log('✅ Created admin user:', admin.username, admin.email);
    }

    // Create default branches if they don't exist
    const existingBranches = await db.select().from(branches).limit(1);
    
    if (existingBranches.length === 0) {
      const sampleBranches = [
        {
          name: 'Sede Central',
          code: 'SAC-001',
          description: 'Sede principal',
          status: 'active' as const,
        },
      ];

      const createdBranches = await db.insert(branches).values(sampleBranches).returning();
      console.log('✅ Created branches:', createdBranches.map(b => b.name).join(', '));
    } else {
      console.log('ℹ️  Branches already exist, skipping...');
    }

    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
