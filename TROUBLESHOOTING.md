# LibraFlow Troubleshooting Guide

Having issues? This guide covers the most common problems and solutions.

## 🔧 Setup Issues

### Problem: "npm install fails" or "Missing dependencies"

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**If still failing:**
- Check Node.js version: `node --version` (needs 16+)
- Try with administrator privileges
- Check internet connection
- Try installing a specific package: `npm install react`

---

### Problem: ".env file not found" or "Environment variables undefined"

**Solutions:**
1. Create `.env` file in project root (copy from `.env.example`)
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart dev server (Ctrl+C, then `npm run dev`)
4. Check spelling: Variables are case-sensitive!

**Verify:**
```bash
# On Windows (PowerShell)
Get-Content .env

# On Mac/Linux
cat .env
```

---

### Problem: "Port 5173 already in use"

**Solutions:**
```bash
# Use different port
npm run dev -- --port 3000

# Kill process using port (Mac/Linux)
lsof -i :5173
kill -9 <PID>

# Kill process using port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 🔐 Supabase & Authentication Issues

### Problem: "Login fails" or "Invalid credentials"

**Check these:**
1. ✅ Supabase project is active (not paused)
2. ✅ Test user exists (Authentication → Users)
3. ✅ Email matches exactly (including capitalization)
4. ✅ Password is correct
5. ✅ Redirect URLs configured (Settings → URL Configuration)

**Browser Console Error:**
- Open DevTools: F12
- Go to Console tab
- Look for error messages
- Copy and paste error for debugging

**Reset Password:**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find user and delete
4. Create new test user with new password

---

### Problem: "Redirect failed" after login

**Solutions:**
1. Add redirect URL in Supabase:
   - Settings → Authentication → URL Configuration
   - Add: `http://localhost:5173` (local)
   - Add: `https://your-app.vercel.app` (production)

2. Check browser console (F12) for errors

3. Clear browser cache and cookies:
   - Ctrl+Shift+Delete (most browsers)
   - Try incognito mode

---

### Problem: "Cannot read profile" or profile is null

**Solutions:**
1. Run the schema.sql again to recreate tables
2. Manually create profile for user:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO profiles (id, full_name, role)
   SELECT id, email, 'member'
   FROM auth.users
   WHERE id = 'USER_ID_HERE';
   ```
3. Check that profiles table exists: go to SQL Editor and run:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```

---

## 📚 Database Issues

### Problem: "Database tables don't exist"

**Solutions:**
1. Go to Supabase → SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Create new query and paste
4. Click Run
5. Wait for completion (watch for green checkmark)

**Check if worked:**
```sql
-- Run this to verify tables exist
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

### Problem: "RLS policy violation" or "permission denied"

**Solutions:**
1. Check user role: Query `SELECT * FROM profiles WHERE id = 'USER_ID';`
2. Verify user has correct role (admin, librarian, or member)
3. Update role if needed:
   ```sql
   UPDATE profiles SET role = 'member' 
   WHERE id = 'USER_ID';
   ```

**For Librarian:**
```sql
UPDATE profiles SET role = 'librarian' 
WHERE id = 'USER_ID';
```

**For Admin:**
```sql
UPDATE profiles SET role = 'admin' 
WHERE id = 'USER_ID';
```

---

### Problem: Books don't save or appear

**Check:**
1. User role is 'librarian' or 'admin'
2. Book has required fields: title, author, category
3. Check browser console for error details
4. Check Supabase logs for SQL errors

**Manually add book:**
```sql
INSERT INTO books (title, author, category, status)
VALUES ('Test Book', 'Test Author', 'Technology', 'available');
```

---

### Problem: Borrow/Return doesn't work

**Check:**
1. Book status is correct (check `books` table)
2. User has active loan (check `loans` table)
3. Book exists with that ID

**Manually create loan:**
```sql
INSERT INTO loans (book_id, user_id, status, due_at)
VALUES (
  'BOOK_ID',
  'USER_ID',
  'active',
  NOW() + INTERVAL '14 days'
);

UPDATE books SET status = 'borrowed' WHERE id = 'BOOK_ID';
```

---

## 🎨 Frontend Issues

### Problem: Pages don't load or show blank screen

**Solutions:**
1. Check browser console (F12): Any error messages?
2. Verify `.env` is set up correctly
3. Hard refresh page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Clear browser cache:
   - DevTools (F12) → Application → Cache Storage → Delete
5. Try incognito mode to rule out cache
6. Check that `npm run dev` is still running

---

### Problem: Components not rendering or showing errors

**Common causes:**
1. TypeScript errors — Check terminal for compilation errors
2. Missing props — Check component usage
3. Null reference — Add null checks in component

**Solutions:**
1. Look at terminal where `npm run dev` is running
2. Check for red errors (not just warnings)
3. Check browser console (F12 → Console)
4. Restart dev server (Ctrl+C, then `npm run dev`)

---

### Problem: Styles not applying or Tailwind not working

**Solutions:**
1. Verify Tailwind is installed: `npm list tailwindcss`
2. Check `tailwind.config.js` has correct content paths
3. Restart dev server to rebuild CSS
4. Hard refresh browser: Ctrl+Shift+R
5. Check that `src/index.css` is imported in `main.tsx`

**Verify Tailwind:**
```bash
# Check if CSS is included
grep -r "@tailwind" src/
```

---

## 🚀 Deployment Issues

### Problem: Build fails with `npm run build`

**Check:**
1. TypeScript errors: `npx tsc --noEmit`
2. Missing environment variables in build
3. Vercel logs for specific errors

**Solutions:**
```bash
# Try building locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check what's in dist
npm run preview
```

---

### Problem: App works locally but fails on Vercel

**Check:**
1. ✅ Environment variables are set in Vercel
2. ✅ Build command is correct: `npm run build`
3. ✅ Output directory is correct: `dist`
4. ✅ Redirect URLs include Vercel URL in Supabase
5. ✅ Supabase credentials are correct

**Add to Vercel:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 🔍 Debugging Tips

### Enable Debug Logging

Add to `src/lib/supabase.ts`:
```typescript
// Log all API calls
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

### Browser DevTools

1. Open: F12 (Windows) or Cmd+Option+I (Mac)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab to see API calls
5. Go to Application → Storage for cookies/storage

### Supabase Logs

In Supabase Dashboard:
- SQL Editor: Run queries to check data
- Logs: View API calls and errors
- Authentication: See user sign-ups

---

## 🆘 Still Stuck?

**Before asking for help:**
1. ✅ Check all of the above solutions
2. ✅ Check browser console (F12)
3. ✅ Check terminal where `npm run dev` runs
4. ✅ Try incognito mode
5. ✅ Restart dev server
6. ✅ Clear cache and cookies

**When reporting issues, include:**
- Error message (copy from console)
- What you were trying to do
- Steps to reproduce
- Your environment (Node version, OS, etc.)

**Check documentation:**
- [README.md](README.md) — Main guide
- [SETUP.md](SETUP.md) — Setup steps
- [FEATURES.md](FEATURES.md) — Feature list
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

---

## ✅ Verification Checklist

After setup, verify:
- [ ] `.env` file exists with credentials
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] App opens at `http://localhost:5173`
- [ ] Can login with test account
- [ ] Can see dashboard/books page
- [ ] Books search works
- [ ] Can borrow/return books (as member)
- [ ] Can add book (as librarian)

---

**If you need more help, check the relevant documentation file or Supabase/React docs.**

**Happy debugging! 🐛**
