/*
  # Admin User Setup
  
  1. Creates admin user with password authentication
  2. Links user to super admin role
  3. Ensures idempotent execution
*/

-- Create super admin user if not exists
DO $$
DECLARE
    v_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the super admin role ID
    SELECT id INTO v_role_id FROM admin_roles WHERE role_type = 'super_admin';

    -- Create the admin user if it doesn't exist
    INSERT INTO auth.users (
        email,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        encrypted_password,
        email_confirmed_at,
        is_super_admin
    )
    VALUES (
        'yesunesun@outlook.com',
        '{"role":"super_admin"}'::jsonb,
        now(),
        now(),
        'authenticated',
        crypt('1udsheela', gen_salt('bf')),
        now(),
        true
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        encrypted_password = crypt('1udsheela', gen_salt('bf')),
        raw_user_meta_data = '{"role":"super_admin"}'::jsonb,
        email_confirmed_at = now(),
        is_super_admin = true
    RETURNING id INTO v_user_id;

    -- Link user to admin role
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id) DO NOTHING;
END $$;