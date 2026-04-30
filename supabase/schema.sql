-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (user roles and info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'librarian', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table (library catalog)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category TEXT,
  published_year INT,
  description TEXT,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'borrowed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loans table (borrowing history)
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_out_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'returned')),
  UNIQUE(book_id, user_id, checked_out_at)
);

-- Audit logs table (optional - for tracking changes)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_created_by ON books(created_by);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add foreign key for loans -> profiles relationship (required for PostgREST joins)
ALTER TABLE loans ADD CONSTRAINT fk_loans_user_profile 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- RLS Policies for books
CREATE POLICY "Authenticated users can view books" ON books
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and librarians can insert books" ON books
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'librarian')
    )
  );

CREATE POLICY "Admins and librarians can update books" ON books
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'librarian')
    )
  );

CREATE POLICY "Admins and librarians can delete books" ON books
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'librarian')
    )
  );

-- RLS Policies for loans
CREATE POLICY "Authenticated users can view loans" ON loans
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() = user_id
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'librarian')
      )
    )
  );

CREATE POLICY "Users can create their own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON loans
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'librarian')
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update book status when loan is created
CREATE OR REPLACE FUNCTION public.update_book_status_on_loan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE books SET status = 'borrowed' WHERE id = NEW.book_id;
  ELSIF NEW.status = 'returned' THEN
    UPDATE books SET status = 'available' WHERE id = NEW.book_id AND status = 'borrowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for loan status changes
CREATE OR REPLACE TRIGGER on_loan_status_change
  AFTER INSERT OR UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION public.update_book_status_on_loan();

-- Seed data (optional - run after creating users manually in Supabase UI)
-- 
-- IMPORTANT: First create these users in Supabase Authentication UI:
-- 1. Go to Authentication → Users
-- 2. Click "Add user" and create:
--    - Email: admin@example.com, Password: Password123!
--    - Email: librarian@example.com, Password: Password123!
--    - Email: member@example.com, Password: Password123!
-- 3. Then run the SQL below to assign roles

-- After creating users in Supabase UI, update their roles:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
  AND id IS NOT NULL;

UPDATE profiles 
SET role = 'librarian' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'librarian@example.com' LIMIT 1)
  AND id IS NOT NULL;

UPDATE profiles 
SET role = 'member' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'member@example.com' LIMIT 1)
  AND id IS NOT NULL;

-- Add sample books to library
INSERT INTO books (title, author, isbn, category, published_year, description, cover_url, status)
SELECT * FROM (VALUES
  ('Clean Code', 'Robert C. Martin', '978-0134685991', 'Technology', 2008, 'A Handbook of Agile Software Craftsmanship', 'https://images-na.ssl-images-amazon.com/images/P/0134685997.01.L.jpg', 'available'),
  ('The Pragmatic Programmer', 'David Thomas', '978-0201616224', 'Technology', 1999, 'Your Journey to Mastery', 'https://images-na.ssl-images-amazon.com/images/P/020161622X.01.L.jpg', 'available'),
  ('Refactoring', 'Martin Fowler', '978-0201485677', 'Technology', 1999, 'Improving the Design of Existing Code', 'https://images-na.ssl-images-amazon.com/images/P/0201485672.01.L.jpg', 'available'),
  ('The Mythical Man-Month', 'Frederick Brooks', '978-0201835959', 'Technology', 1975, 'Essays on Software Engineering', 'https://images-na.ssl-images-amazon.com/images/P/0201835959.01.L.jpg', 'available'),
  ('Code Complete', 'Steve McConnell', '978-0735619678', 'Technology', 2004, 'A Practical Handbook of Software Construction', 'https://images-na.ssl-images-amazon.com/images/P/0735619670.01.L.jpg', 'available'),
  ('Design Patterns', 'Gang of Four', '978-0201633610', 'Technology', 1994, 'Elements of Reusable Object-Oriented Software', 'https://images-na.ssl-images-amazon.com/images/P/0201633612.01.L.jpg', 'available'),
  ('The Art of Computer Programming', 'Donald Knuth', '978-0321751041', 'Technology', 1968, 'Fundamental Algorithms', 'https://images-na.ssl-images-amazon.com/images/P/0321751043.01.L.jpg', 'available'),
  ('Introduction to Algorithms', 'Cormen', '978-0262033848', 'Technology', 2009, 'A Foundation for Computer Science', 'https://images-na.ssl-images-amazon.com/images/P/0262033844.01.L.jpg', 'available'),
  ('The C Programming Language', 'Kernighan & Ritchie', '978-0131103627', 'Technology', 1988, 'The Definitive Reference', 'https://images-na.ssl-images-amazon.com/images/P/0131103628.01.L.jpg', 'available'),
  ('SQL Performance Explained', 'Markus Winand', '978-3950307825', 'Technology', 2012, 'Everything Developers Need to Know about SQL Performance', 'https://images-na.ssl-images-amazon.com/images/P/3950307829.01.L.jpg', 'available')
) AS v(title, author, isbn, category, published_year, description, cover_url, status)
ON CONFLICT DO NOTHING;
