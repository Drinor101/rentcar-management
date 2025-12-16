-- Shto kolonë password në tabelën users
-- Kujdes: Ruajtja e password-it në plain text nuk është e sigurt
-- Por për lehtësi menaxhimi, do ta shtojmë

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password TEXT;

-- Koment për kolonën
COMMENT ON COLUMN public.users.password IS 'Password i përdoruesit (plain text - jo i sigurt, por i nevojshëm për menaxhim)';

-- Update password për përdoruesit ekzistues nga auth.users
-- Kjo nuk mund të bëhet automatikisht sepse password në auth.users është hash
-- Duhet të vendoset manualisht ose përmes aplikacionit

