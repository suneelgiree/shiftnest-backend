# ShiftNest Backend API

A comprehensive, secure, and scalable backend for ShiftNest - Nepal's premier room-finding and professional shifting services platform.

## 🏢 Project Overview

ShiftNest connects property seekers with verified room and flat listings across Kathmandu, while also providing professional shifting services. This backend powers the mobile and web applications with robust APIs, secure payments, and comprehensive user management.

### Key Features
- ✅ Verified room & flat listings
- ✅ Secure booking & payments (Khalti integration)
- ✅ User authentication & authorization (JWT + 2FA)
- ✅ Professional shifting services
- ✅ Live tracking & real-time updates
- ✅ Ratings & reviews system
- ✅ Agent network management
- ✅ Comprehensive audit logging

## 📋 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ LTS |
| **Language** | TypeScript | 5.0+ |
| **Framework** | Express.js | 4.18+ |
| **Database** | PostgreSQL | 14+ |
| **Cache** | Redis | 7+ |
| **ORM** | TypeORM | 0.3+ |
| **Authentication** | JWT + bcryptjs | Latest |
| **Validation** | Joi | 17+ |
| **Logging** | Winston | 3+ |
| **Container** | Docker | 20+ |

## 🚀 Quick Start

### Prerequisites
- Debian 11/12 OS
- Git
- Administrator/sudo access

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/suneelgiree/shiftnest-backend.git
cd shiftnest-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
