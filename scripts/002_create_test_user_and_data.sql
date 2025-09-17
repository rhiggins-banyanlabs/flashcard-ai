-- Create a test user with email and password
-- Note: This uses Supabase's auth.users table directly
-- Test credentials: test@example.com / password123

-- Insert test user into auth.users (this simulates a signed-up user)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create some sample flashcard sets for the test user
INSERT INTO public.flashcard_sets (id, title, description, user_id, created_at, updated_at) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    'Spanish Vocabulary',
    'Basic Spanish words and phrases for beginners',
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    'Programming Terms',
    'Essential programming concepts and definitions',
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NOW(),
    NOW()
  );

-- Create sample flashcards for Spanish Vocabulary set
INSERT INTO public.flashcards (set_id, front_text, back_text, position) VALUES
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Hello', 'Hola', 1),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Goodbye', 'Adiós', 2),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Thank you', 'Gracias', 3),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Please', 'Por favor', 4),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Water', 'Agua', 5);

-- Create sample flashcards for Programming Terms set
INSERT INTO public.flashcards (set_id, front_text, back_text, position) VALUES
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'Variable', 'A storage location with an associated name that contains data', 1),
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'Function', 'A reusable block of code that performs a specific task', 2),
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'Loop', 'A programming construct that repeats a block of code', 3),
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'Array', 'A data structure that stores multiple values in a single variable', 4);

-- Create some sample study sessions
INSERT INTO public.study_sessions (set_id, user_id, cards_studied, cards_correct, session_date) VALUES
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 5, 4, NOW() - INTERVAL '1 day'),
  ('660e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 4, 3, NOW() - INTERVAL '2 days'),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 5, 5, NOW() - INTERVAL '3 days');
