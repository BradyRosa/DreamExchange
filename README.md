# DreamExchange

DreamExchange is a Base mini app for recording, editing, fusing, and clearing onchain dream records.

The project is built with Next.js and TypeScript, using Wagmi and Viem for Base mainnet connectivity.

## Repository

https://github.com/BradyRosa/DreamExchange.git

## Overview

DreamExchange provides a simple interface for working with dream records onchain.

The app is designed around four core actions:

- Record a dream
- Edit an existing dream record
- Fuse dream records
- Clear dream records

It is intended to run as a Base mini app and includes placeholder configuration for Base attribution.

## Features

- Next.js App Router application structure
- TypeScript-based codebase
- Wagmi integration for wallet and chain interactions
- Viem support for Ethereum-compatible operations
- Base mainnet configuration
- Prepared Base offchain attribution metadata
- Prepared Base onchain attribution suffix configuration

## Stack

- Next.js App Router
- TypeScript
- Wagmi
- Viem
- Base mainnet

## Getting Started

Clone the repository:

```bash
git clone https://github.com/BradyRosa/DreamExchange.git
cd DreamExchange
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL shown in your terminal.

For a standard Next.js setup, this is usually:

```text
http://localhost:3000
```

## Available Scripts

Common scripts for a Next.js project may include:

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm run start
```

Starts the production build locally.

```bash
npm run lint
```

Runs linting if configured in the project.

## Project Structure

Key files and directories include:

```text
app/
```

Contains the Next.js App Router pages, layouts, and app-level UI.

```text
app/layout.tsx
```

Contains the Base offchain attribution metadata placeholder.

```text
lib/wagmi.ts
```

Contains Wagmi configuration and the prepared Base onchain attribution suffix placeholder.

## Base Attribution Placeholders

Base offchain attribution is currently hardcoded in `app/layout.tsx`:

```html
<meta name="base:app_id" content="" />
```

Base onchain attribution is prepared in `lib/wagmi.ts`:

```ts
export const baseDataSuffix = "0x" as `0x${string}`;
```

After Base verification, replace both placeholders with the verified values and redeploy the app.

## Configuration Notes

Before production deployment, review the Base attribution placeholders.

Confirm that the app is configured for the intended Base mainnet environment.

Check the Wagmi and Viem configuration before publishing any production build.

Keep deployment settings aligned with the requirements of the Base mini app environment.

## Usage

Run the app locally with:

```bash
npm run dev
```

Use the interface to create and manage dream records.

The core app flow is centered on recording, editing, fusing, and clearing onchain dream data.

## Deployment

Build the project with:

```bash
npm run build
```
