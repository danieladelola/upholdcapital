Clerk setup for local development

1. Create `.env.local` at the project root (do NOT commit this file).

2. Copy the example and set your publishable key:

```bash
cp .env.local.example .env.local
# then edit .env.local and replace the value with your Clerk Publishable Key
```

3. Where to find the key

- Sign in to your Clerk dashboard and copy the "Publishable Key" that begins with `pk_`.

4. Restart the dev server

- After adding the key restart the dev server:

```bash
npm run dev
```

Notes

- If the key is not set a dev banner will appear in the app and Clerk-related auth features will be disabled for local development.
- For production, set the publishable key and any server-side Clerk secrets in your deployment environment settings.
