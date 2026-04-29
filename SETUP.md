# LibraFlow Setup Guide

Complete step-by-step instructions to get LibraFlow running locally.

## Part 1: Supabase Setup (10 minutes)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with email or GitHub
4. Verify your email

### Step 2: Create a Project

1. In the Supabase dashboard, click **"New project"**
2. Fill in:
   - **Name**: `libraflow` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait for project to initialize (2-5 minutes)

### Step 3: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy all contents from `supabase/schema.sql` in this project
4. Paste into the SQL editor
5. Click **"Run"** (or Cmd+Enter)
6. Wait for the schema to complete (watch for the green checkmark)

**Expected result**: All tables created without errors

### Step 4: Create Test Users

1. Go to **Authentication** → **Users** (left sidebar)
2. Click **"Add user"** button
3. Create three test users:

#### User 1 - Admin
- Email: `admin@example.com`
- Password: `Password123!`
- Click **"Create user"**

#### User 2 - Librarian
- Email: `librarian@example.com`
- Password: `Password123!`
- Click **"Create user"**

#### User 3 - Member
- Email: `member@example.com`
- Password: `Password123!`
- Click **"Create user"**

### Step 5: Set User Roles

Now we need to assign roles to these users. Go back to **SQL Editor** and run this:

```sql
UPDATE profiles SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

UPDATE profiles SET role = 'librarian' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'librarian@example.com');
```

The member user already defaults to 'member' role.

### Step 6: Get API Keys

1. Go to **Settings** (gear icon, bottom left)
2. Click **"API"**
3. You'll see:
   - **Project URL** (starts with `https://`)
   - **Project API keys** section with:
     - **`service_role` key** (keep this secret!)
     - **`anon` public key** (safe to share)

4. Copy:
   - **Project URL** → Save this
   - **`anon` public key** → Save this

You need these in the next part!

### Step 7: Configure Redirect URLs

1. In Settings, go to **Authentication** tab (or find **URL Configuration**)
2. Under **Site URL**:
   - For local development: `http://localhost:5173`
   - For production: `https://your-app-name.vercel.app`
3. Add both URLs if available
4. Click **"Save"**

---

## Part 2: Local Development Setup (5 minutes)

### Step 1: Install Dependencies

Open terminal in this project folder and run:

```bash
npm install
```

Wait for all packages to install (1-3 minutes).

### Step 2: Configure Environment

1. Copy `.env.example` → `.env`
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace:
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```
   
   Use the URL and anon key from Step 6 above.

3. Save the file

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser!

### Step 4: Test Login

1. Go to the login page
2. Try logging in with:
   - Email: `admin@example.com`
   - Password: `Password123!`
3. You should be redirected to the dashboard!

---

## Part 3: Add Sample Books (Optional)

1. Create an admin account if you haven't
2. Go to **Catalog** → **"+ Add Book"**
3. Fill in sample books:

```
Title: Clean Code
Author: Robert C. Martin
ISBN: 978-0134685991
Category: Technology
Year: 2008
Description: A Handbook of Agile Software Craftsmanship
Cover: https://images-na.ssl-images-amazon.com/images/P/0134685997.01.L.jpg
```

4. Add more books as desired
5. Test borrowing/returning as a member account

---

## Part 4: Deploy to Vercel (Optional)

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial LibraFlow commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/libraflow.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select your GitHub repository
4. Fill in:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **"Deploy"**
7. After deployment, get your URL
8. Go back to Supabase and add this URL to redirect URLs:
   - Example: `https://libraflow-abc123.vercel.app`

---

## Troubleshooting

### "Cannot find module" error
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Environment variables not found"
- Ensure `.env` file exists in root directory
- Restart the dev server (Ctrl+C, then `npm run dev`)
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### "Login failed"
- Verify user exists in Supabase (Authentication → Users)
- Check email exactly matches (including capitalization)
- Verify redirect URL is configured in Supabase
- Check browser console (F12) for error details

### "Buttons don't work"
- Check browser console for errors
- Ensure Supabase credentials are correct
- Try clearing browser cache (Ctrl+Shift+Delete)

### "Database tables not found"
- Go back to SQL Editor in Supabase
- Re-run the schema.sql file
- Check for any error messages

---

## Quick Reference

### Test Accounts
```
Admin:
  Email: admin@example.com
  Password: Password123!

Librarian:
  Email: librarian@example.com
  Password: Password123!

Member:
  Email: member@example.com
  Password: Password123!
```

### Common Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### File Locations
- **Supabase Schema**: `supabase/schema.sql`
- **Environment**: `.env`
- **React Code**: `src/`
- **Components**: `src/components/`
- **Pages**: `src/pages/`

---

**You're all set! Happy coding! 🚀**
