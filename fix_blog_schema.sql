-- Add missing columns to blog tables
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT '#B8552F';
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'filetext';
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create a simple users table if it doesn't exist (for author_id FK)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) DEFAULT 'Mark Manoti Ndege',
    avatar_url VARCHAR(500),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default user for existing posts
INSERT INTO users (id, full_name, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Mark Manoti Ndege', 'mark@aetsh69.com')
ON CONFLICT (email) DO NOTHING;

-- Update existing posts to have the default author
UPDATE blog_posts SET author_id = '00000000-0000-0000-0000-000000000001' WHERE author_id IS NULL;
