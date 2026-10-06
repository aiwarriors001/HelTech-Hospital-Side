-- ==============================================================================
-- 1. CREATE DEDICATED HOSPITAL TABLE: hospital_profiles
-- Contains ONLY the requested columns:
-- - id
-- - email
-- - hospital_name (Hospital / Clinic Name)
-- - lead_doctor_name (Administrator / Lead Doctor Name)
-- - mobile_number
-- - location
-- - role
-- - password
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    hospital_name TEXT,
    lead_doctor_name TEXT,
    mobile_number TEXT,
    location TEXT,
    role TEXT DEFAULT 'hospital',
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_auth_user_id ON public.hospital_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_email ON public.hospital_profiles(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies
DROP POLICY IF EXISTS "Hospital staff can view own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can view own profile"
    ON public.hospital_profiles
    FOR SELECT
    USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Hospital staff can insert own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can insert own profile"
    ON public.hospital_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Hospital staff can update own profile" ON public.hospital_profiles;
CREATE POLICY "Hospital staff can update own profile"
    ON public.hospital_profiles
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Auto-update timestamp trigger
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


-- ==============================================================================
-- 2. CLEAN UP PATIENT PROFILES TABLE: profiles
-- Removes hospital data and columns from patient profile table
-- ==============================================================================

-- Remove hospital accounts from patient profiles table
DELETE FROM public.profiles 
WHERE role = 'hospital';

-- Remove hospital-specific columns from patient profiles table (if present)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hospital_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hospital_location;
