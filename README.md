# Shared Thread

A private web portal where creators draft structured works, publish to a Library, and host community discussions.

🌐 **Live at: [sharedthread.co](https://sharedthread.co)**

## Features

- **Authentication**: Secure login with TOTP 2FA support
- **Community System**: Propose and manage communities with subdomain allocation
- **Staff Dashboard**: Admin tools for community review and approval
- **Compliance Framework**: Complete transparency, accessibility, and ethics pages
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, Prisma

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the Library.

## Demo Access

**Member Account:**
- Email: `demo@sharedthread.co`
- Password: `any password`

**Admin Account:**
- Email: `admin@sharedthread.co` 
- Password: `any password` (access to staff dashboard)

## Community Workflow

1. **Users**: Navigate to Communities → "Propose New Community"
2. **Fill Form**: Name, description, why it should exist
3. **Staff Review**: Admins approve/reject with feedback
4. **Auto-Deploy**: Approved communities get `name.sharedthread.co` subdomains

## Compliance Pages

- `/transparency` - Governance and financial reporting
- `/accessibility` - WCAG 2.1 AA compliance
- `/ethics` - Data ethics and privacy principles  
- `/community-guidelines` - Community standards
- `/open-source` - Credits and licensing
- `/challenge` - Accountability and contact

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM 
- **Auth**: Custom JWT with TOTP 2FA
- **Deployment**: Azure Web App

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── api/               # API routes
│   ├── community-proposals/ # User interface
│   └── staff/             # Admin dashboard
├── components/            # UI components
└── lib/                  # Utilities
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contact

- **General**: hello@sharedthread.co
- **Support**: support@sharedthread.co  
- **Accountability**: accountability@sharedthread.co

