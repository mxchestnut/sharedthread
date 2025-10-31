#!/usr/bin/env tsx
/**
 * Update admin user email and reset password
 * Usage: npx tsx scripts/update-admin-user.ts
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function updateAdminUser() {
  const oldEmail = 'kit@sharedthread.co';
  const newEmail = 'kitchestnut@hotmail.com';
  const newPassword = 'TempPassword123!'; // You'll change this on first login
  
  // Hash the password using SHA-256 (matching your auth system)
  const hashedPassword = createHash('sha256').update(newPassword).digest('hex');
  
  console.log('🔄 Updating admin user...');
  console.log(`   Old email: ${oldEmail}`);
  console.log(`   New email: ${newEmail}`);
  console.log(`   New password: ${newPassword}`);
  console.log('');
  
  try {
    // Check if old user exists
    const oldUser = await prisma.user.findUnique({
      where: { email: oldEmail }
    });
    
    if (!oldUser) {
      console.log('❌ User with email', oldEmail, 'not found');
      console.log('');
      console.log('Available users:');
      const users = await prisma.user.findMany({
        select: { email: true, username: true, role: true }
      });
      users.forEach(u => console.log(`   - ${u.email} (@${u.username}) - ${u.role}`));
      process.exit(1);
    }
    
    console.log(`✅ Found user: @${oldUser.username}`);
    
    // Update the user
    await prisma.user.update({
      where: { email: oldEmail },
      data: {
        email: newEmail,
        password: hashedPassword
      }
    });
    
    console.log('');
    console.log('✅ Admin user updated successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after logging in!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUser();
