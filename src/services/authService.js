import { supabase } from '../config/supabase';

// 1. Registrasi Warga Baru
export const registerUser = async (email, password, userData) => {
  try {
    console.log('--- PROSES REGISTRASI SUPABASE ---');

    // Step 1: Pendaftaran Auth di Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError.message);
      return { success: false, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, message: 'Gagal membuat pengguna di Supabase Auth.' };
    }

    // Step 2: Simpan Profil Warga ke Tabel Profiles
    const { error: profileError } = await supabase.from('profiles').insert([
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

    if (profileError) {
      console.error('Supabase Profile Insert Error:', profileError.message);
      return { success: false, message: profileError.message };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Catch Register Error:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem.' };
  }
};

// 2. Login Warga / Admin RT
export const loginUser = async (email, password, tenantCode) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { success: false, message: 'Akun tidak terdaftar di wilayah RT/RW ini.' };
    }

    return { success: true, userData: profile };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 3. Logout
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { success: !error };
};