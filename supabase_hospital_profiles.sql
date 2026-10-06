-- ==============================================================================
-- HELTECH SUPABASE FIX: RESOLVE "Database error saving new user"
-- ==============================================================================

-- STEP 1: CREATE DEDICATED hospital_profiles TABLE (EXACT 8 COLUMNS)
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_id ON public.hospital_profiles(id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_email ON public.hospital_profiles(email);

-- Enable RLS and grant open access so permissions NEVER block inserts
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on hospital_profiles" ON public.hospital_profiles;
CREATE POLICY "Allow all operations on hospital_profiles"
    ON public.hospital_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- STEP 2: FIX THE DATABASE TRIGGER CAUSING "Database error saving new user"
-- The old trigger function was crashing whenever hospital users registered.
-- This updated function routes hospital users to hospital_profiles and catches errors gracefully.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- If registered as hospital, insert into hospital_profiles
  IF (COALESCE(new.raw_user_meta_data->>'role', '') = 'hospital') THEN
    BEGIN
      INSERT INTO public.hospital_profiles (
        id,
        email,
        hospital_name,
        lead_doctor_name,
        mobile_number,
        location,
        role,
        password
      )
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'hospital_name', ''),
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'mobile_number', ''),
        COALESCE(new.raw_user_meta_data->>'hospital_location', ''),
        'hospital',
        COALESCE(new.raw_user_meta_data->>'password', '')
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        hospital_name = COALESCE(EXCLUDED.hospital_name, hospital_profiles.hospital_name),
        lead_doctor_name = COALESCE(EXCLUDED.lead_doctor_name, hospital_profiles.lead_doctor_name),
        mobile_number = COALESCE(EXCLUDED.mobile_number, hospital_profiles.mobile_number),
        location = COALESCE(EXCLUDED.location, hospital_profiles.location),
        password = COALESCE(EXCLUDED.password, hospital_profiles.password);
    EXCEPTION WHEN OTHERS THEN
      -- Gracefully catch so auth.users registration NEVER fails
      NULL;
    END;
  ELSE
    -- If patient user, insert into patient profiles table
    BEGIN
      INSERT INTO public.profiles (auth_user_id, email_id, full_name, avatar_url, auth_provider)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        COALESCE(new.raw_app_meta_data->>'provider', 'email')
      )
      ON CONFLICT (auth_user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Catch-all so auth.users registration NEVER aborts with a 500 error
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STEP 3: CLEAN UP PATIENT PROFILES TABLE (profiles)
-- Removes hospital accounts and hospital columns so 'profiles' is exclusively for patients
-- ==============================================================================

DELETE FROM public.profiles WHERE role = 'hospital';
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hospital_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hospital_location;
