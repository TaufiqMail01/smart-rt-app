import { supabase } from '../config/supabase';

// 1. Registrasi Warga Baru
export const registerUserSupabase = async (email, password, userData) => {
  try {
    // Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Insert Profil ke Tabel
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          tenant_id: userData.tenantCode,
          name: userData.name,
          email: email,
          block: userData.block,
          phone: userData.phone,
          role: 'warga',
          status: 'pending',
        },
      ]);

    if (profileError) throw profileError;

    return { success: true, user: authData.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 2. Stream Aduan Realtime dengan Supabase
export const subscribeReportsSupabase = (tenantCode, onUpdate) => {
  // Ambil data awal
  supabase
    .from('reports')
    .select('*, profiles(name, block)')
    .eq('tenant_id', tenantCode)
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      if (data) onUpdate(data);
    });

  // Listener Realtime Change
  const subscription = supabase
    .channel('public:reports')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reports', filter: `tenant_id=eq.${tenantCode}` },
      () => {
        // Fetch ulang saat ada perubahan
        supabase
          .from('reports')
          .select('*, profiles(name, block)')
          .eq('tenant_id', tenantCode)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) onUpdate(data);
          });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(subscription);
};