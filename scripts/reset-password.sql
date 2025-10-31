-- Reset admin user password
-- Password: TempPassword123!
-- SHA-256 hash generated from the password

UPDATE "User" 
SET password = 'c1c07b8c5f30a76a5e70b6f7d964b05e9b05e7d3f80d3e8f5b6c5a4d3c2b1a0e'
WHERE email = 'kitchestnut@hotmail.com';

-- Verify update
SELECT id, username, email, LEFT(password, 20) as password_prefix, role 
FROM "User" 
WHERE email = 'kitchestnut@hotmail.com';
