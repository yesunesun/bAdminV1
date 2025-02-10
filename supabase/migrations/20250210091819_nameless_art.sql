-- Create enum for admin role types
CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin');

-- Create admin roles table
CREATE TABLE admin_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type admin_role_type NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin users table
CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    role_id uuid REFERENCES admin_roles NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_roles
CREATE POLICY "Super admins can manage roles"
    ON admin_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN admin_roles ar ON au.role_id = ar.id
            WHERE au.user_id = auth.uid()
            AND ar.role_type = 'super_admin'
        )
    );

CREATE POLICY "Admins can view roles"
    ON admin_roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Create policies for admin_users
CREATE POLICY "Super admins can manage admin users"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN admin_roles ar ON au.role_id = ar.id
            WHERE au.user_id = auth.uid()
            AND ar.role_type = 'super_admin'
        )
    );

CREATE POLICY "Admins can view admin users"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Insert super admin role first
INSERT INTO admin_roles (role_type) VALUES ('super_admin');

-- Create super admin user using Supabase's auth.users() function
SELECT auth.users.id 
FROM auth.users 
WHERE email = 'yesunesun@outlook.com'
LIMIT 1;

-- If the user doesn't exist, create them
DO $$
DECLARE
    v_user_id uuid;
    v_role_id uuid;
BEGIN
    -- Get the role ID
    SELECT id INTO v_role_id FROM admin_roles WHERE role_type = 'super_admin';
    
    -- Check if user exists
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'yesunesun@outlook.com';
    
    -- If user doesn't exist, create them
    IF v_user_id IS NULL THEN
        -- Create the user with raw SQL to ensure all required fields are set
        INSERT INTO auth.users (
            email,
            raw_user_meta_data,
            is_super_admin,
            encrypted_password,
            email_confirmed_at,
            aud,
            role
        )
        VALUES (
            'yesunesun@outlook.com',
            '{"role": "super_admin"}'::jsonb,
            true,
            crypt('1udsheela', gen_salt('bf')),
            now(),
            'authenticated',
            'authenticated'
        )
        RETURNING id INTO v_user_id;
    END IF;

    -- Link user to admin role if not already linked
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id) DO NOTHING;
END $$;