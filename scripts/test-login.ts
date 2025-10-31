#!/usr/bin/env tsx
/**
 * Test login credentials
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'kitchestnut@hotmail.com';
  const password = 'TempPassword123!';
  
  console.log('🔍 Testing login credentials...');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        status: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log(`   Username: @${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log('');
    
    // Hash the test password
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    
    console.log('🔐 Password verification:');
    console.log(`   Stored hash:  ${user.password}`);
    console.log(`   Test hash:    ${hashedPassword}`);
    console.log(`   Match: ${user.password === hashedPassword ? '✅ YES' : '❌ NO'}`);
    console.log('');
    
    if (user.password === hashedPassword) {
      console.log('✅ Login credentials are correct!');
      console.log('   You should be able to log in at https://sharedthread.co/login');
    } else {
      console.log('❌ Password mismatch - updating now...');
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
