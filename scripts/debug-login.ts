#!/usr/bin/env tsx
/**
 * Debug login issue
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function debugLogin() {
  const email = 'kitchestnut@hotmail.com';
  const testPassword = 'TempPassword123!';
  
  console.log('🔍 Debugging login issue...');
  console.log('');
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        emailVerified: true,
      }
    });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Has Password:', !!user.password);
    console.log('');
    
    if (!user.password) {
      console.log('❌ User has no password set!');
      process.exit(1);
    }
    
    // Test password hash
    const hashedPassword = await hashPassword(testPassword);
    
    console.log('🔐 Password verification:');
    console.log('   Stored hash:', user.password);
    console.log('   Test hash:  ', hashedPassword);
    console.log('   Match:', user.password === hashedPassword ? '✅ YES' : '❌ NO');
    console.log('');
    
    if (user.password !== hashedPassword) {
      console.log('⚠️  Password mismatch! Updating password...');
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated successfully!');
    } else {
      console.log('✅ Password is correct - login should work');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
