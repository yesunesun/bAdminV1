-- Create roles table first
CREATE TABLE IF NOT EXISTS admin_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name text NOT NULL CHECK (role_name IN ('super_admin', 'admin')),
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
            AND r.role_name = 'super_admin'
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
            AND r.role_name = 'super_admin'
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
    -- Insert super admin role if not exists
    INSERT INTO admin_roles (role_name)
    VALUES ('super_admin')
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_role_id;

    -- If role_id is null (meaning it already existed), get it
    IF v_role_id IS NULL THEN
        SELECT id INTO v_role_id FROM admin_roles WHERE role_name = 'super_admin';
    END IF;

    -- Create super admin user if not exists
    INSERT INTO auth.users (
        email,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        encrypted_password
    )
    VALUES (
        'yesunesun@outlook.com',
        '{"provider":"email","providers":["email"]}',
        '{"role":"super_admin"}',
        'authenticated',
        'authenticated',
        crypt('1udsheela', gen_salt('bf'))
    )
    ON CONFLICT (email) DO UPDATE
    SET encrypted_password = crypt('1udsheela', gen_salt('bf'))
    RETURNING id INTO v_user_id;

    -- Link user to admin role if not already linked
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT DO NOTHING;

    -- Confirm email
    UPDATE auth.users
    SET email_confirmed_at = now(),
        confirmed_at = now(),
        last_sign_in_at = now(),
        raw_app_meta_data = raw_app_meta_data || 
            jsonb_build_object('email_verified', true)
    WHERE id = v_user_id;
END $$;