import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Find users with 'kit' in their email or username
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'kit', mode: 'insensitive' } },
          { username: { contains: 'kit', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    console.log('Found users:', users);

    if (users.length === 0) {
      console.log('No users found with "kit" in email or username');
      return;
    }

    // Update the first user found to admin
    const userToUpdate = users[0];
    const updated = await prisma.user.update({
      where: { id: userToUpdate.id },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    console.log('✅ Successfully updated user to ADMIN:', updated);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
