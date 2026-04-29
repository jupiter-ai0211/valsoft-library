# LibraFlow — Mini Library Management System

A modern, full-stack library management application built with React, TypeScript, Supabase, and Tailwind CSS. Manage books, handle borrowing/returning, and control access with role-based permissions.

## 🌟 Features

### Core Features
- ✅ **Book Management** — Add, edit, delete books with full metadata
- ✅ **Borrow/Return** — Members can borrow and return books seamlessly
- ✅ **Search & Filters** — Fuzzy search by title, author, ISBN, category
- ✅ **Status Tracking** — Real-time tracking of book availability
- ✅ **Borrowing History** — View current and past loans

### Bonus Features
- ✅ **Authentication** — Supabase Auth with email/password
- ✅ **Role-Based Access Control** — Admin, Librarian, and Member roles
- ✅ **Dashboard Analytics** — View library stats and loan activity
- ✅ **User Management** — Admins can manage user roles
- ✅ **Responsive Design** — Mobile-friendly UI with Tailwind CSS
- ✅ **Database Security** — Row Level Security policies

## 🏗️ Tech Stack

### Frontend
- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite** — Fast build tool
- **Tailwind CSS** — Utility-first styling
- **React Router** — Client-side routing
- **Zustand** — State management
- **Fuse.js** — Fuzzy search
- **Lucide React** — Icons

### Backend
- **Supabase** — PostgreSQL + Auth + Realtime
- **PostgRES Functions** — Server-side logic
- **Row Level Security** — Database-level permissions

### Deployment
- **Vercel** — Frontend hosting
- **Supabase Hosting** — Database and auth

## 📋 Project Structure

```
src/
  components/
    AppLayout.tsx          # Main layout wrapper
    Navbar.tsx             # Navigation header
    BookCard.tsx           # Book display component
    BookForm.tsx           # Form for adding/editing books
    SearchBar.tsx          # Search input
    StatusBadge.tsx        # Status indicator
    EmptyState.tsx         # Empty state UI
    DashboardStats.tsx     # Statistics cards
    ProtectedRoute.tsx     # Route protection
  pages/
    Login.tsx              # Login page
    Signup.tsx             # Signup page
    Dashboard.tsx          # Admin dashboard
    Books.tsx              # Book catalog
    NewBook.tsx            # Add book page
    EditBook.tsx           # Edit book page
    MyLoans.tsx            # User's loans
    AdminUsers.tsx         # User management
  services/
    bookService.ts         # Book API calls
    loanService.ts         # Loan API calls
    userService.ts         # User API calls
  lib/
    supabase.ts            # Supabase client
    roles.ts               # Permission helpers
    search.ts              # Search utilities
    recommendations.ts     # Recommendation engine
  store/
    authStore.ts           # Auth state (Zustand)
  types/
    book.ts                # Book types
    user.ts                # User types
    loan.ts                # Loan types
  App.tsx                  # Router and routes
  main.tsx                 # Entry point

supabase/
  schema.sql               # Database schema

public/
  vite.svg                 # Vite logo

.env.example               # Environment template
index.html                 # HTML entry
vite.config.ts             # Vite config
tailwind.config.js         # Tailwind config
tsconfig.json              # TypeScript config
package.json               # Dependencies
README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (free tier available)
- Vercel account (optional, for deployment)

### Step 1: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (free tier)
3. Go to **SQL Editor** and run the SQL from `supabase/schema.sql`:
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the Supabase SQL editor
   - Click **Run**
4. Create test accounts:
   - Go to **Authentication → Users**
   - Click **Add user** and create:
     - **Admin**: admin@example.com / Password123!
     - **Librarian**: librarian@example.com / Password123!
     - **Member**: member@example.com / Password123!
5. Update roles in the database:
   - Go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
   UPDATE profiles SET role = 'librarian' WHERE id = (SELECT id FROM auth.users WHERE email = 'librarian@example.com');
   ```

### Step 2: Get API Keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Step 3: Clone & Setup

```bash
# Clone or download the project
cd valsoft-assessment

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials
# Edit .env and paste the URL and key
```

### Step 4: Run Locally

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 5: Configure Supabase Auth Redirect

In Supabase:
1. Go to **Authentication → URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:5173` (local development)
   - `https://your-app.vercel.app` (after deployment)

## 🧪 Test Accounts

Use these accounts to test different roles:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@example.com | Password123! | Full access, manage users |
| Librarian | librarian@example.com | Password123! | Add/edit/delete books, manage loans |
| Member | member@example.com | Password123! | Borrow/return books, view history |

## 📖 Usage

### As a Member
1. Login with member@example.com
2. Go to **Catalog**
3. Search for a book
4. Click **Borrow** to take it out
5. Go to **My Loans** to see borrowed books
6. Click **Return** to give it back

### As a Librarian
1. Login with librarian@example.com
2. Click **Add Book** to add new catalog items
3. Edit or delete books from the catalog
4. View all loans and activity in **Dashboard**

### As an Admin
1. Login with admin@example.com
2. Access **Dashboard** for full analytics
3. Go to **Users** to change user roles
4. All librarian permissions plus user management

## 🗄️ Database Design

### Tables

**profiles** — User info and roles
```sql
id, full_name, role, created_at
```

**books** — Library catalog
```sql
id, title, author, isbn, category, published_year, description, 
cover_url, status (available/borrowed), created_by, created_at, updated_at
```

**loans** — Borrowing history
```sql
id, book_id, user_id, checked_out_at, due_at, checked_in_at, 
status (active/returned)
```

**audit_logs** — Optional activity tracking
```sql
id, user_id, action, entity_type, entity_id, details, created_at
```

## 🔐 Security

- **Row Level Security** — Database enforces permissions
- **Auth Guards** — Protected routes in frontend
- **Role-Based Policies** — Different access levels
- **Audit Trail** — Track important actions

RLS policies ensure:
- Members can only manage their own loans
- Librarians can see all loans but can't delete users
- Admins have full access
- Books are readable by all authenticated users

## 🎨 UI Features

- **Responsive Design** — Works on mobile, tablet, desktop
- **Dark Mode Ready** — Tailwind supports dark mode
- **Icon Library** — Lucide React icons throughout
- **Form Validation** — Client-side validation with feedback
- **Loading States** — Spinners for async operations
- **Error Handling** — User-friendly error messages

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-url>
git push -u origin main

# 2. Go to vercel.com and connect GitHub
# 3. Import the repository
# 4. Set environment variables:
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_ANON_KEY=...
# 5. Deploy!
```

### Deploy to Netlify

```bash
# 1. Push to GitHub (same as above)
# 2. Go to netlify.com and connect GitHub
# 3. Build settings:
#    Build command: npm run build
#    Publish directory: dist
# 4. Add environment variables in Site Settings
# 5. Deploy!
```

## 📝 Design Decisions

### Why Supabase?
- Free tier includes database, auth, and 50k monthly users
- Postgres is powerful and reliable
- Row Level Security for database-level permissions
- Built-in OAuth support for future social login
- No need for a custom backend server

### Why Zustand for State?
- Lightweight and simple
- Perfect for auth state management
- No boilerplate compared to Redux
- Easy integration with async functions

### Why Fuse.js for Search?
- Lightweight (no dependencies)
- Supports fuzzy matching (typo-tolerant)
- Fast client-side search
- No server cost

### Client-Side vs Server-Side?
- Search is client-side (filter loaded books)
- Auth is server-side (Supabase handles it)
- Business logic is split:
  - UI logic → React
  - Data access rules → RLS policies
  - Core logic → React services

## 🎯 Development Workflow

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format and lint (if added)
npm run lint
```

## 🐛 Troubleshooting

### "Environment variables not found"
- Make sure `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after creating `.env`

### "Login fails"
- Verify test accounts exist in Supabase
- Check email format matches exactly
- Ensure redirect URLs are configured in Supabase

### "Books not saving"
- Verify `created_by` field has auth user ID
- Check RLS policies allow inserts for your role
- Ensure all required fields are populated

### "Loans not updating"
- Check that the user_id in loans matches the authenticated user
- Verify book status is updating via the trigger
- Check Supabase logs for SQL errors

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)

## 🎉 Future Enhancements

- [ ] Email notifications for due dates
- [ ] Book recommendations based on borrowing history
- [ ] Advanced search filters (date range, ratings)
- [ ] Book reviews and ratings
- [ ] PDF export of borrowing history
- [ ] Google/GitHub OAuth login
- [ ] Dark mode toggle
- [ ] Mobile app with React Native

## 📄 License

This project is free to use and modify for your assignment submission.

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Supabase documentation
3. Check browser console for errors
4. Verify all environment variables are correct

---

**Built with ❤️ using React, TypeScript, and Supabase**

**LibraFlow © 2026 — Mini Library Management System**
