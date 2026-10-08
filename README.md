# Clinic HIS | نظام العيادة

Bilingual English/Arabic clinic management application, exported from the current Site source.

## Features

Patient records, appointments, waiting queues, consultations, prescriptions, vitals, clinic management, staff accounts, role permissions, and configurable password settings.

## Upload to GitHub

1. Extract `Clinic-HIS-GitHub.zip`.
2. Create an empty GitHub repository.
3. Upload the **contents** of the `clinic-his` folder, preserving all folders, including `.openai` and `.gitignore`.
4. Commit the files. Do not upload the ZIP itself as your only repository content.

Alternatively, from the extracted folder:

```bash
git init
git add .
git commit -m "Import Clinic HIS source"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## What is included

- `app/`: pages, bilingual interface, and authentication/clinic API routes.
- `lib/`: authorization, password policy, account management, and administrator initialization.
- `db/` and `drizzle/`: database schema and migrations.
- `components/`, `hooks/`, `public/`, and `vendor/`: interface components and assets.
- Build scripts, configuration, package manifest, and dependency lockfile.
- `.openai/hosting.json`: the existing Site identity and logical database binding. It contains no runtime secrets.

## Runtime requirements

Node.js 22.13 or later, the package manager declared by the lockfile (pnpm), and a Cloudflare Workers-compatible runtime with a D1 database bound as `DB`.

**GitHub stores the source code. GitHub Pages cannot run the login, APIs, or database.** Uploading this code does not migrate your existing Site or its data.

## Local development

```bash
pnpm install
node scripts/create-local-admin.mjs
pnpm build
```

The helper asks you to choose an initial password and creates an ignored `.dev.vars` file with salted password-hash configuration. It does not export any existing account credentials.

Apply each `drizzle/*.sql` migration in filename order to your new local database (once per migration):

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_curious_lifeguard.sql
```

Repeat with the other migration filenames, then run `pnpm dev`. The startup output provides the local address. Bootstrap creates the `sysadmin` account in the local database with the password you supplied.

Local sign-in cookies use `Secure`; use HTTPS for local authentication testing. A new installation has an empty database.

## Hosting configuration

Configure these runtime values on the target host, without committing them:

- `SYSADMIN_ACCOUNT_EMAIL`
- `SYSADMIN_INITIAL_HASH`
- `SYSADMIN_INITIAL_SALT`

The initialization runs once per database and is recorded in the `settings` table. Passwords are hashed; sessions use HttpOnly cookies. The default password policy is a six-character minimum, with mandatory temporary-password changes disabled. Admins can change this from **Staff → Password settings**.

The project retains Sites build integration. For another hosting provider, adapt the deployment configuration and D1 bindings rather than treating this as a static React website. See `docs/STARTER_RUNTIME.md` for further runtime details.

## Existing live records

Patient records, staff credentials, sessions, and other live database contents are **not included** in this source archive. They remain in the existing Clinic HIS database. Exporting this code does not change or delete that data.

## Source snapshot

Original source commit: f9472dcf735ff6b38f9cc5ea1dc1772a00777f46

Export-only changes: project README, GitHub upload instructions, secret-ignore rules, local bootstrap helper, runtime-variable template, and removal of an unused owner-email constant. The deployed Site has not been modified by this export.
