-- Create roles table first
CREATE TABLE IF NOT EXISTS admin_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type text NOT NULL CHECK (role_type IN ('super_admin', 'admin')),
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

-- Create super admin user and role
DO $$
DECLARE
    v_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Generate UUID for user
    v_user_id := gen_random_uuid();

    -- Insert super admin role
    INSERT INTO admin_roles (role_type)
    VALUES ('super_admin')
    RETURNING id INTO v_role_id;

    -- Create super admin user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
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
        '{"provider":"email","providers":["email"],"email_verified":true}'::jsonb,
        '{"role":"super_admin"}'::jsonb,
        now(),
        now(),
        'authenticated',
        true,
        '',
        ''
    );

    -- Link user to admin role
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id);

END $$;