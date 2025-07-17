import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteUser() {
    const userId = '4d3f209c-a05a-4c71-b8b0-2167dc62e485';

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        console.error("❌ Failed to delete user:", error.message);
    } else {
        console.log("✅ User deleted successfully!");
    }
}

deleteUser();
