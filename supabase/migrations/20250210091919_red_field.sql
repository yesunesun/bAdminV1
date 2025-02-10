-- Create enum for admin role types if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN
        CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin');
    END IF;
END $$;

-- Create admin roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type admin_role_type NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin users table if it doesn't exist
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

-- Insert super admin role if it doesn't exist
INSERT INTO admin_roles (role_type)
SELECT 'super_admin'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_roles WHERE role_type = 'super_admin'
);

-- Create super admin user and link to role
DO $$
DECLARE
    v_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Generate UUID for user
    v_user_id := gen_random_uuid();
    
    -- Get the role ID
    SELECT id INTO v_role_id FROM admin_roles WHERE role_type = 'super_admin';

    -- Create super admin user if doesn't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yesunesun@outlook.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            is_super_admin,
            confirmation_token,
            recovery_token
        )
        VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'yesunesun@outlook.com',
            crypt('1udsheela', gen_salt('bf')),
            now(),
            jsonb_build_object('role', 'super_admin'),
            now(),
            now(),
            'super_admin',
            true,
            '',
            ''
        );

        -- Link the user to the super admin role
        INSERT INTO admin_users (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;