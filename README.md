# Backend for Incubyte OKR App

## Pre-requisites

- Node.js (v18 or higher)
- Podman (v4 or higher)
- PostgreSQL (via Podman)

---

## Project Setup

Run the following commands to initialize the project:

```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install project dependencies
pnpm install

# Install Prisma
pnpm add -D prisma
pnpm add @prisma/client

# Initialize Prisma
pnpx prisma init
```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/okrs"
```

---

## Setup Database (Podman)

Start PostgreSQL container:

```bash
podman compose up -d
```

---

## Database Migration

### For Development

```bash
pnpx prisma migrate dev --name init
```

### For Production

```bash
pnpx prisma migrate deploy
pnpx prisma generate
```

---

## Start the Server

### Development Mode

```bash
pnpm start
```

### Production Mode

```bash
pnpm build
pnpm start:prod
```

---

## Project Structure

```
src/        # Application source code
prisma/     # Prisma schema and migrations
.env        # Environment variables
```

---

## Troubleshooting

If Prisma fails:

* Ensure PostgreSQL container is running
* Verify `DATABASE_URL` is correct
* Run:

```bash
pnpx prisma validate
```

If migrations fail:

```bash
pnpx prisma migrate reset
```

---

## Authors
- [Maharshi Jani](https://github.com/maharshijani05)
- [Chandu Kommineni](https://github.com/chandukommineni)
