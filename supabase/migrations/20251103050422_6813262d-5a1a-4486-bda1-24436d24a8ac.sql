-- Grant admin role to sairockplm@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('ecf6d8fa-a46c-42f3-a99f-846e2d659484', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;