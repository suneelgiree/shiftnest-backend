# ShiftNest Backend API

**A comprehensive, secure, and scalable backend for ShiftNest - Nepal's premier room-finding and professional shifting services platform.**

![ShiftNest](https://img.shields.io/badge/ShiftNest-Backend-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## 🏢 Project Overview

ShiftNest is a comprehensive digital platform that:
- **Connects property seekers** with verified room and flat listings across Kathmandu
- **Provides professional shifting services** with experienced team members
- **Ensures secure transactions** through integrated payment gateway (Khalti)
- **Builds trust** through verified listings, user reviews, and ratings
- **Tracks shipments** in real-time during moving operations
- **Manages agent networks** for expanded coverage

This backend powers the mobile and web applications with robust APIs, security, and scalability.

## ✨ Features

### Core Features
- ✅ **Verified Room & Flat Listings** - Curated and verified property listings
- ✅ **Secure Booking System** - End-to-end booking management
- ✅ **Payment Integration** - Khalti payment gateway (Nepal-based)
- ✅ **User Authentication** - JWT + Two-Factor Authentication (2FA)
- ✅ **Authorization & RBAC** - Role-based access control (Admin, Agent, User)
- ✅ **Professional Shifting Services** - Full-service moving operations
- ✅ **Live Tracking** - Real-time shipment tracking
- ✅ **Ratings & Reviews** - User feedback system
- ✅ **Agent Network** - Distributed agent management
- ✅ **Comprehensive Audit Logging** - Complete audit trail for security

### Security Features
- 🔐 Password hashing with bcryptjs (12 rounds)
- 🔐 JWT token-based authentication with refresh mechanism
- 🔐 Two-Factor Authentication (2FA) with TOTP
- 🔐 Role-Based Access Control (RBAC)
- 🔐 Rate limiting to prevent brute-force attacks
- 🔐 SQL injection prevention (parameterized queries)
- 🔐 XSS protection (input sanitization)
- 🔐 CSRF protection
- 🔐 Security headers (Helmet.js)
- 🔐 Data encryption at rest
- 🔐 GDPR compliance (data export, deletion)
- 🔐 Comprehensive audit logging

## 📊 Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ LTS | JavaScript runtime |
| **Language** | TypeScript | 5.0+ | Type-safe code |
| **Framework** | Express.js | 4.18+ | Web framework |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Cache** | Redis | 7+ | In-memory cache |
| **ORM** | TypeORM | 0.3+ | Database ORM |
| **Authentication** | JWT/bcryptjs | Latest | Auth mechanism |
| **Validation** | Joi | 17+ | Data validation |
| **Logging** | Winston | 3+ | Logging system |
| **Testing** | Jest | 29+ | Testing framework |
| **Container** | Docker | 20+ | Containerization |
| **API Docs** | Swagger/OpenAPI | 3.0 | API documentation |

## 🚀 Quick Start

### Prerequisites
- Debian 11/12 OS (or Linux/macOS)
- Git
- Administrator/sudo access
- 2GB RAM minimum
- 5GB disk space

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/suneelgiree/shiftnest-backend.git
cd shiftnest-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration (see ENV_VARIABLES.md)

# 4. Setup database
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
