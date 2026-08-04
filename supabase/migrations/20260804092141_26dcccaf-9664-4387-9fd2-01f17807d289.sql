REVOKE EXECUTE ON FUNCTION public.referral_code_owner(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.referral_code_owner(text) TO service_role;