/*
  # Admin System Setup
  
  1. New Tables
    - admin_roles: Stores admin role types and permissions
    - admin_users: Links auth users to admin roles
  
  2. Security
    - Enable RLS on new tables
    - Add policies for super admin access
    
  3. Initial Data
    - Create super admin role
    - Create super admin user
*/

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

-- Insert super admin role
INSERT INTO admin_roles (role_type) VALUES ('super_admin');

-- Create super admin user
DO $$
DECLARE
    v_user_id uuid;
    v_role_id uuid;
BEGIN
    -- Create user if not exists
    INSERT INTO auth.users (
        email,
        raw_user_meta_data,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        is_super_admin
    )
    VALUES (
        'yesunesun@outlook.com',
        jsonb_build_object('role', 'super_admin'),
        now(),
        now(),
        now(),
        'super_admin',
        true
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        raw_user_meta_data = jsonb_build_object('role', 'super_admin'),
        role = 'super_admin',
        is_super_admin = true
    RETURNING id INTO v_user_id;

    -- Get super admin role id
    SELECT id INTO v_role_id FROM admin_roles WHERE role_type = 'super_admin';

    -- Link user to super admin role
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Set user password
    UPDATE auth.users
    SET encrypted_password = crypt('1udsheela', gen_salt('bf'))
    WHERE id = v_user_id;
END $$;