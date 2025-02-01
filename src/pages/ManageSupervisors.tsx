// src/pages/ManageSupervisors.tsx
// Version: 1.1.0
// Last Modified: 2025-02-01T22:30:00+05:30 (IST)

// ... (keep existing imports) ...

export default function ManageSupervisors() {
    // ... (keep existing state variables) ...
    const [migrating, setMigrating] = useState(false);
  
    // Add this new function
    const migrateExistingUsers = async () => {
      if (!isAdmin()) return;
      setMigrating(true);
      setError(null);
      setSuccess(null);
  
      try {
        // First, get all users from auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;
  
        // Then, get all existing profiles
        const { data: existingProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id');
        if (profilesError) throw profilesError;
  
        // Create a set of user IDs that already have profiles
        const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
  
        // Create profiles for users who don't have one
        const profilesToCreate = users
          .filter(user => !existingProfileIds.has(user.id))
          .map(user => ({
            id: user.id,
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            role: 'property_owner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
  
        if (profilesToCreate.length > 0) {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(profilesToCreate);
          
          if (insertError) throw insertError;
        }
  
        setSuccess(`Migration completed. Created ${profilesToCreate.length} new profiles.`);
      } catch (err) {
        console.error('Error during migration:', err);
        setError('Failed to migrate users. Check console for details.');
      } finally {
        setMigrating(false);
      }
    };
  
    // Add this button right after the "Add Supervisor" button in your JSX
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Manage Supervisors</h1>
            <p className="mt-2 text-sm text-gray-700">
              Add and manage property supervisors who can review and approve property listings.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md 
                shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Supervisor
            </button>
            <button
              onClick={migrateExistingUsers}
              disabled={migrating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {migrating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Migrate Existing Users
                </>
              )}
            </button>
          </div>
        </div>
  
        {/* ... (rest of your existing code) ... */}
      </div>
    );
  }