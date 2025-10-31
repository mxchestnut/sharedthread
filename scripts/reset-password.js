const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function resetPassword() {
  const correctHash = '9204bc018668f60cbd4abcfc88e2c387e1976354ad2b7bf158ccbacd4f20c709';
  
  try {
    const result = await prisma.$executeRaw`
      UPDATE users 
      SET password = ${correctHash}
      WHERE email = 'kitchestnut@hotmail.com'
    `;
    
    console.log('✅ Password updated for kitchestnut@hotmail.com');
    console.log('Rows affected:', result);
    
    // Verify
    const user = await prisma.$queryRaw`
      SELECT id, username, email, LEFT(password, 20) as password_prefix, role 
      FROM users 
      WHERE email = 'kitchestnut@hotmail.com'
    `;
    
    console.log('\nUser details:');
    console.log(user);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
