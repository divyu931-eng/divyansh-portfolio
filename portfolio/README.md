# Divyansh Aggarwal — Portfolio

React/Vite personal portfolio. Email, WhatsApp, GitHub, LinkedIn and project links are preconfigured. You can add a resume URL via `.env` or `src/data.js`.

## How enquiries work
The contact form validates the visitor's name, email and message, then opens WhatsApp with a pre-filled message addressed to **+91 89370 96797**. The visitor must press **Send in WhatsApp**; opening WhatsApp alone does not send an enquiry. This form does not call the backend, save to a database or send a Gmail notification. WhatsApp/Web and a working account on the number are required. The number is public in the website link. To change it, edit `profile.whatsapp` in `src/data.js` to digits only, including country code. The number is not printed on the page, but it remains visible in the WhatsApp link and to the recipient.

The email card opens the visitor's email app; it is a separate contact method.

## Run locally
1. Install Node.js 20+ and run `npm install`.
2. Run `npm run dev` and open the printed URL. The WhatsApp form requires no API credentials, backend or database.
3. For optional frontend overrides copy `.env.example` to `.env`; don't commit secrets.

## Deploy free on Vercel
1. Extract the ZIP and upload the **contents** of `portfolio` to a GitHub repository. The repository root must contain `package.json` and `vercel.json`; exclude `.env`, `node_modules`, `dist` and `server/data`.
2. On Vercel, import the GitHub repo via **Add New > Project**, choose Hobby, and deploy. The Vite build configuration is included. No Supabase, Gmail App Password or environment variables are needed for the WhatsApp form.
3. Open your deployed website on a phone and test: fill the form, continue to WhatsApp, and press Send. Confirm the message reaches the intended WhatsApp account. Also test on desktop with WhatsApp Web. Using the website does not automatically deliver a message until Send is pressed.

## Optional legacy contact API (not used by the WhatsApp form)
The previous Express/Supabase/Gmail API remains in `server/` and `api/` for optional future use, but the current frontend does not submit to it. If you decide to use it later, you must explicitly connect the frontend, set up persistent Supabase storage with `server/schema.sql`, provide server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and configure Gmail SMTP credentials. Never commit or share those secrets. Don't rely on serverless/local ephemeral files for durable storage. For public use add appropriate privacy information and robust distributed anti-abuse protection.

## Private admin studio
On the portfolio, double-tap the lotus beside the DA logo (or double-click it on desktop) to open `/admin`. The login page itself is discoverable; the secret gesture is only a shortcut, **not security**. Supabase email/password sign-in plus server-side user-ID verification protects editing and media uploads.

### What you can edit
- Name, hero headline/background, portrait, about and education text, rotating roles, skills, achievements, contact email, WhatsApp number, LinkedIn/GitHub/resume links.
- Show/hide portfolio sections; add, remove and update up to 12 project cards, links, tags, text, award labels and images.
- Upload JPG, PNG or WebP photos up to 3 MB. Upload then press **Save Changes** to publish. Uploaded images in the public bucket can be viewed by anyone; don't upload private photos.
- Removing a project only removes its portfolio card, not the actual separately deployed application or its GitHub repository. This is a content editor: entirely new functionality, page layouts or deleting a hosting deployment still require code or the relevant hosting dashboard.

### One-time Supabase setup
1. Create a Supabase project. In SQL Editor run `server/schema.sql`. The `portfolio_settings` table uses RLS and has no public policies. Do not add anonymous write policies.
2. Under Storage, create a **public** bucket named exactly `portfolio-media`. Set its maximum file size to 3 MB and allowed MIME types to `image/jpeg`, `image/png`, `image/webp`. Do **not** add public upload/write policies. The authenticated server issues a temporary signed upload URL only to the authorized owner. Public means anyone can view image files by URL. Uploads consume free storage; unreferenced uploads can be removed manually in the Supabase dashboard.
3. In Supabase Authentication settings **disable public signups**. Under Authentication > Users, manually create and confirm one email/password account for yourself. Copy its user UUID. Use a strong unique password; never put it in the code, GitHub, or chat. The admin login email defaults to `divyu931@gmail.com` but can be changed at sign-in if your admin account uses a different email. Editing your public contact email does not change your admin login.
4. In Vercel project settings add these environment variables:
   - `VITE_SUPABASE_URL`: your Supabase project URL (public browser config).
   - `VITE_SUPABASE_ANON_KEY`: the project's anon/publishable key (public browser config; **never** the service role key).
   - `SUPABASE_URL`: same project URL (server only).
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase legacy service_role key (server-only secret; never use `VITE_` for this).
   - `ADMIN_USER_ID`: exact UUID of the one authorized Auth user (server only).
5. Redeploy after setting variables. Double-tap the lotus or go to `/admin`, sign in, edit and **Save Changes**. Reload the public portfolio to view changes. For local development set `.env` and run `node --env-file=.env server/index.js` and `npm run dev` in separate terminals.
6. Test a valid owner login and an unauthorized account (which must be rejected), a save, and a photo upload on your actual deployment. This package cannot provision your Supabase account automatically. If Supabase is unavailable or its free project pauses, the public site falls back to built-in defaults until it is available again. Back up edits, sign out on shared devices, and add robust distributed rate limiting for production. Contact enquiries still open WhatsApp and require the visitor to press Send; they are not automatically stored or emailed.
