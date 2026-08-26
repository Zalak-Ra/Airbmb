# Prompts & AI Engineering Log

This document records the structured prompt engineering sequence used by a professional AI Systems Engineer to design, build, debug, and optimize this production-grade Airbnb Listing Clone (**AIR**).

---

## 📋 Executive Summary of Engineering Approach
As a Staff AI Engineer and Systems Architect, the project was developed by pairing advanced prompt engineering with deep domain expertise in full-stack architecture:
1. **Domain & System Architecture**: Enforced strict separation of concerns, Next.js 15 App Router conventions, React Query client caching, and Server Repository patterns.
2. **Infrastructure & Containerization**: Modeled dual-mode L1 Redis read-through caching (Upstash REST / ioredis TCP / In-Memory), PostgreSQL with Prisma ORM, and multi-stage Docker builds.
3. **Technical Problem Solving**: Pinpointed precise root causes (e.g. Prisma client generation gaps, strict TypeScript type narrowings, null metadata dereferences, and Docker WSL2 engine pipe fallbacks) and guided the AI agent to resolve them surgically without breaking working contracts.

---

## 🚀 Prompt Engineering History & Workflow

### Phase 1: System Design, Frontend Architecture & Caching Strategy
**Role**: Senior Full-Stack Engineer & AI Systems Architect  
**Objective**: Build a pixel-perfect, high-performance desktop Airbnb listing surface from scratch with dynamic code-splitting and client-side cache invalidation.

```text
You are an expert AI Full-Stack Developer and Staff-Level Systems Architect. We are building a production-quality, pixel-perfect clone of a real Airbnb listing page for a senior placement assignment. 

Reference URL (Single Source of Truth): https://airbnb-clone-umber-two.vercel.app

CRITICAL CONSTRAINT: Do NOT scrape, lift, or shift the codebase directly from the reference URL. You must build this entirely from scratch. The visual design, spacing, typography, and animations must be a 1:1 identical match. 

TECH STACK & ARCHITECTURE:
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.
- Data Fetching & Caching: React Query (or SWR) to demonstrate advanced client-side caching, stale-while-revalidate patterns, and optimistic UI updates.
- Mock Backend Services: Implement a robust, scalable mock service layer using the Repository Pattern. 

Please execute this project step-by-step:

STEP 1: SYSTEM DESIGN & AI CONFIGURATION
- Generate a `.cursorrules` file enforcing strict TypeScript typing, Tailwind best practices, ARIA accessibility, and highly explanatory JSDoc commenting. 
- Ensure the code is documented and structured meticulously, as if this codebase will be used as a primary teaching asset to teach in a workshop. Explain the "why" behind system design choices in the comments.
- Implement the Mock Service Layer: Create simulated API endpoints with artificial latency. Include a simulated caching layer (mocking Redis behavior using an in-memory Map) that intercepts requests before hitting the "database" (simulated via browser storage/IndexedDB) to demonstrate a deep understanding of read-through caching.

STEP 2: HIGH-PERFORMANCE PIXEL-PERFECT UI (DESKTOP ONLY)
Build the following views matching the reference exactly:
1. Listing Page: Implement dynamic imports (code splitting) for heavy components below the fold (e.g., reviews, maps) to demonstrate web performance optimization.
2. Photo Tour: Full-screen gallery. Implement image lazy-loading and Next.js Image optimization techniques.
3. Lightbox: Single-photo viewer. Implement pre-fetching logic for the next/previous images to ensure zero-latency navigation.

STEP 3: ACCESSIBILITY & INTERACTION PARITY
- Implement matching hover states, focus rings, and scroll transitions using Framer Motion.
- Ensure strict focus management (focus trapping) and full keyboard navigation (←/→) for all modals and lightboxes.

STEP 4: PRODUCTION ARCHITECTURE DIAGRAM
- Generate a complex Mermaid.js script for a production-scale vacation-rental marketplace. 
- The diagram MUST include enterprise system design components: CDN (Cloudflare), API Gateway, Load Balancers, Microservices (Auth, Search, Booking, Pricing), Distributed Cache (Redis), Message Queues (Kafka) for async tasks, Primary DB (PostgreSQL), and Document Stores (MongoDB) for reviews. 
- Add detailed inline comments explaining the scaling and deployment strategy for each node.

Acknowledge these instructions and begin by generating the `.cursorrules` file and the Repository Pattern structure for the caching and mock data layer.
```

---

### Phase 2: Relational Schema, Repository Layer & Multi-Stage Infrastructure
**Role**: Backend Systems Architect & Infrastructure Specialist  
**Objective**: Connect the frontend to a real PostgreSQL database with Prisma ORM, implement a dual-mode Redis read-through cache, write an optimized Dockerfile, and document cloud deployment paths (Neon + Upstash).

```text
You are an expert Backend Systems Architect and Staff-Level Node.js Developer. I have already completed the frontend for a production-quality, pixel-perfect clone of a real Airbnb listing page for a senior placement assignment. 

Your objective is to seamlessly integrate a highly scalable, real backend to power my existing frontend, fully containerize the application with Docker, and prepare it for cloud deployment. Even though a backend is technically optional for this assignment, implementing it will demonstrate production architecture thinking.

Please execute this project systematically in the following phases:

STEP 1: CONTEXT-AWARE INFERENCE & SCHEMA DESIGN
- Context-Aware: Instead of blindly generating a backend, you must first read and analyze my existing frontend code (components, API fetching logic, TypeScript interfaces). 
- Ensure that the API responses you generate perfectly match my current UI state without breaking anything.
- Based on the UI requirements, design a highly normalized relational database schema (schema.prisma). Include a `seed.ts` script to populate the database with the exact data needed.

STEP 2: LOCAL INFRASTRUCTURE & SYSTEM DESIGN
- Create a `docker-compose.yml` file to spin up PostgreSQL and Redis locally.
- Implement the API endpoints using a Clean Architecture / Repository Pattern.
- Implement a Read-Through Caching Strategy with Redis to optimize database read queries.

STEP 3: MULTI-STAGE DOCKERFILE
- Multi-Stage Dockerfile: Write an optimized production `Dockerfile` for the Node.js backend. 
- Standard Dockerfiles are often bloated and insecure; you must implement multi-stage builds to show true deployment maturity. Ensure the final image minimizes size, safely caches dependencies, and runs as a non-root user.

STEP 4: DEPLOYMENT STRATEGY & DOCUMENTATION
- Deployment Strategy: Generate a `deploy.md` guide in the root directory. 
- You must explicitly include environment configurations for modern serverless databases (Neon for PostgreSQL and Upstash for Redis) to demonstrate an understanding of how modern cloud infrastructure works, even on free tiers.
- Provide explicit instructions on how to deploy this Dockerized backend to a platform like Render, Vercel, or Fly.io.

Acknowledge these instructions, review my frontend codebase to understand the data structures, and begin by outputting the `schema.prisma` and the `docker-compose.yml` file.
```

---

### Phase 3: Technical Problem Solving & Deep System Auditing
**Role**: Principal QA & Senior Placement Auditor  
**Objective**: Audit the entire codebase, pinpoint subtle bugs (Prisma engine generation, type narrowing, `null` property dereferencing), fix them without breaking working code, and confirm production readiness.

```text
Act as a senior full-stack engineer, software architect, QA engineer, and deployment specialist.

I have already developed the project, including whatever frontend, backend, database, services, integrations, and other functionality the project requires.

Your job is to understand what has actually been built first, then determine whether everything that has been implemented is properly connected and working together.

Main Objective:
1. Inspect and understand the existing project completely.
2. Build an internal picture of the application.
3. Discover technical bugs and broken connections:
   - Identify un-generated ORM clients (Prisma Client generation).
   - Pinpoint TypeScript type errors (`tsc --noEmit`).
   - Catch potential runtime null dereference bugs in transaction retry handlers (e.g. `typeof null === 'object'` error in `isExclusionViolation`).
4. Make surgical fixes preserving existing functionality.
5. Verify build, lints, and static page optimizations (`npm run typecheck`, `npm run build`).
6. Deliver clear summary and final deployment status.
```

---

## 💡 Key Technical Insights & AI Engineering Lessons Learned
1. **Prisma Generation in CI/CD & Local Workspaces**:
   - *Problem*: Missing generated `.prisma/client` types broke TypeScript compilation.
   - *Solution*: Identified that `prisma generate` must run post-install and pre-build (`prisma generate && next build`) so standard imports from `@prisma/client` resolve cleanly.
2. **Safe Type Narrowing in Error Guards**:
   - *Problem*: Runtime JS `typeof null === 'object'` meant `'code' in meta` crashed when `error.meta` was `null`.
   - *Solution*: Explicitly checked `!meta || typeof meta !== 'object'` and casted metadata safely as `Record<string, unknown>`.
3. **Graceful Cache Fallbacks**:
   - *Problem*: Relying strictly on a running Redis TCP socket causes serverless deployment crashes or build failures.
   - *Solution*: Designed a 3-tier fallback chain (`Upstash REST -> ioredis TCP -> InMemoryRedis`), guaranteeing zero runtime crashes regardless of environment.
