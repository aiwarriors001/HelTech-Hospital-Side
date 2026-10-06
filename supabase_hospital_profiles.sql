-- ==============================================================================
-- HelTech Hospital Management System - Supabase Table Schema
-- Table: hospital_profiles
-- Purpose: Dedicated profile registry for Hospital Administrators and Staff
-- (Separated completely from patient-side "profiles" table)
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email_id TEXT,
    full_name TEXT,
    phone_number TEXT,
    hospital_name TEXT,
    hospital_location TEXT,
    role TEXT DEFAULT 'hospital',
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_auth_user_id ON public.hospital_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_email ON public.hospital_profiles(email_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow users to view their own hospital profile
DROP POLICY IF EXISTS "Hospital staff can view own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can view own profile"
    ON public.hospital_profiles
    FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Allow users to insert their own hospital profile during registration
DROP POLICY IF EXISTS "Hospital staff can insert own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can insert own profile"
    ON public.hospital_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Allow users to update their own hospital profile
DROP POLICY IF EXISTS "Hospital staff can update own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can update own profile"
    ON public.hospital_profiles
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- 5. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_hospital_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_hospital_profiles_updated_at ON public.hospital_profiles;
CREATE TRIGGER trigger_hospital_profiles_updated_at
    BEFORE UPDATE ON public.hospital_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_hospital_profile_updated_at();
