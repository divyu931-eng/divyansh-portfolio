# Divyansh Portfolio — Free Deployment & Private Admin

## Kya ready hai?
- WhatsApp enquiry form; visitor ko WhatsApp par **Send** dabana hoga.
- Logo ke lotus par double tap/double click se `/admin` khulta hai.
- Admin se photo aur project images upload, project add/remove, personal text, skills, achievements, links aur sections edit/hide kar sakte ho. Up to 12 project cards.
- Project card hataane se asli deployed app ya GitHub repository delete nahi hoti. Nayi coding functionality ya hosting deployment delete karna alag kaam hai.

## Step 1 — GitHub
1. Is ZIP ko extract karo. GitHub par naya repository banao.
2. `portfolio` folder **ke andar ki files/folders** repository ke root mein upload karo. Root par `package.json` aur `vercel.json` hone chahiye. `api`, `server`, `src`, `public`, aur `package-lock.json` bhi upload karo.
3. `.env`, secrets, `node_modules`, `dist` ya `server/data` upload mat karna. ZIP mein `.env.example` hai, secret nahi.

## Step 2 — Supabase
1. https://supabase.com par account banao aur free project create karo.
2. SQL Editor mein ZIP ke `server/schema.sql` ka pura content paste karke Run karo. Ye portfolio settings table aur RLS banata hai; anonymous write policy mat banana.
3. **Storage > New bucket:** `portfolio-media` naam ka **public** bucket banao. File limit 3 MB aur allowed MIME types `image/jpeg`, `image/png`, `image/webp` set karo. Public bucket ki images URL se kisi ko bhi dikhti hain; private photo upload mat karna. Koi anonymous upload/write policy mat lagana.
4. **Authentication** settings mein public signups disable karo. **Authentication > Users > Add user** mein apne liye ek email/password user manually create aur confirm karo. Us user ka UUID copy karo. Strong password rakho; password chat mein ya code mein mat daalna.
5. Supabase dashboard se project URL, anon/publishable key, aur legacy `service_role` key note karo. Service role key secret hai: ise sirf Vercel server variables mein rakho, GitHub ya chat mein kabhi nahi.

## Step 3 — Vercel
1. https://vercel.com par GitHub se sign in karo. **Add New > Project**, apna repository import karo, Hobby/free plan choose karo.
2. Deploy se pehle Environment Variables mein ye 5 values set karo:
   - `VITE_SUPABASE_URL` — project URL
   - `VITE_SUPABASE_ANON_KEY` — anon/publishable key (service role nahi)
   - `SUPABASE_URL` — wahi project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — legacy service role secret (server only; kabhi VITE_ mat lagana)
   - `ADMIN_USER_ID` — Authentication Users page se admin user ka UUID
3. Deploy karo. Agar baad mein environment variables change karo, redeploy karo. Vite build aur API configuration project mein already hain.
4. Vercel URL kholo. Lotus ko do baar jaldi tap karo, admin email/password se login karo. Edit karke **Save Changes** dabao. Website reload karke check karo.
5. Admin se photo upload karo aur Save karo. Real phone se WhatsApp enquiry bhej ke check karo. Kisi non-admin account/token se admin access deny hona chahiye.

## Important
- Admin login email aur public contact email alag cheezein hain. Contact email edit karne se login account nahi badlega.
- Lotus gesture secret shortcut hai, security nahi; actual protection Supabase login aur server-side authorized UUID check hai.
- Supabase free project inactivity par pause ho sakta hai; tab admin kaam nahi karega aur site temporarily original default content dikha sakti hai. Apni content backup rakho.
- Image URL public hoga. Free platform limits aur policies change ho sakti hain. Production ke liye distributed rate limiting, privacy notice aur backup ka dhyan rakho.
