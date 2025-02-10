-- Create roles table first
CREATE TABLE IF NOT EXISTS admin_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type admin_role_type NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create policies for admin_roles
CREATE POLICY "Super admins can manage roles"
    ON admin_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM admin_users au
            JOIN admin_roles r ON au.role_id = r.id
            WHERE au.user_id = auth.uid()
            AND r.role_type = 'super_admin'
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
            SELECT 1 
            FROM admin_users au
            JOIN admin_roles r ON au.role_id = r.id
            WHERE au.user_id = auth.uid()
            AND r.role_type = 'super_admin'
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

-- Insert super admin role if it doesn't exist
INSERT INTO admin_roles (role_type)
SELECT 'super_admin'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_roles WHERE role_type = 'super_admin'
)
RETURNING id;

-- Create function to set up admin user
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void AS $$
DECLARE
    v_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the super admin role ID
    SELECT id INTO v_role_id FROM admin_roles WHERE role_type = 'super_admin';

    -- Get or create user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'yesunesun@outlook.com';

    -- If user exists, update their metadata
    IF v_user_id IS NOT NULL THEN
        UPDATE auth.users
        SET 
            raw_user_meta_data = jsonb_build_object('role', 'super_admin'),
            raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
            role = 'authenticated',
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_user_id;

        -- Link user to admin role
        INSERT INTO admin_users (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the setup function
SELECT setup_admin_user();