
-- Lock down SECURITY DEFINER helpers (only invoked by triggers / service role)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage policies: user-files bucket, each user owns their prefix (userId/...)
CREATE POLICY "user-files select own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user-files insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user-files update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user-files delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
