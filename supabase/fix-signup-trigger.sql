-- Fix signup 500 error: Remove the trigger that creates org on signup
-- Run this in Supabase Dashboard > SQL Editor
-- We'll create organizations in the app instead when user first signs in

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
