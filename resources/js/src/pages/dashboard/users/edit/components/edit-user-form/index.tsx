import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Field, Form } from 'src/components/hook-form';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Iconify } from '@/components/iconify';
import { IconButton, InputAdornment } from '@mui/material';

type Role = { id: number; name: string };

type User = {
  id: number;
  name: string;
  email: string;
  roles: number[];
  status: string;
};

type PageProps = InertiaPageProps & { csrf_token: string };

type Props = { roles: Role[]; currentUser?: User };

export function EditUserForm({ roles, currentUser }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const UserSchema = z.object({
    name: z.string().min(1, { message: __('validation.required') }),
    email: z.string().email({ message: __('validation.email') }),
    ...(currentUser
      ? {}
      : { password: z.string().min(6, { message: __('validation.min.string', { min: 6 }) }) }),
    roles: z.array(z.number()).min(1, { message: __('validation.required') }),
    avatar: z.any().optional(),
    status: z.enum(['active', 'pending']),
  });

  type FormValues = z.infer<typeof UserSchema>;

  const defaultValues: FormValues = {
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    ...(currentUser ? {} : { password: '' }),
    roles: currentUser?.roles ?? [],
    avatar: null,
    status: currentUser?.status ?? 'active',
  } as FormValues;

  const methods = useForm<FormValues>({
    resolver: zodResolver(UserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const translateRole = (id: number) => {
    const role = roles.find((r) => r.id === id);
    return role ? __(`pages/users.roles.${role.name.toLowerCase()}`) : '';
  };

  const onSubmit = handleSubmit((data) => {
    const payload = new FormData();
    payload.append('_token', csrfToken);
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'roles') {
        (value as number[]).forEach((v) => payload.append('roles[]', String(v)));
      } else if (value instanceof File) {
        payload.append(key, value);
      } else if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });
    const options = {
      onSuccess: () => {
        toast.success(
          currentUser ? __('pages/users.update_success') : __('pages/users.create_success')
        );
        router.visit(paths.users);
      },
    };
    if (currentUser) {
      payload.append('_method', 'PUT');
      router.post(route('users.update', currentUser.id), payload, options);
    } else {
      router.post(route('users.store'), payload, options);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card
        sx={{
          p: 3,
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Field.Text
          name="oldPassword"
          type={showPassword.value ? 'text' : 'password'}
          label="Old password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Field.Text
          name="newPassword"
          label="New password"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          helperText={
            <Box component="span" sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:info-circle-bold" width={16} /> Password must be minimum 6+
            </Box>
          }
        />

        <Field.Text
          name="confirmNewPassword"
          type={showPassword.value ? 'text' : 'password'}
          label="Confirm new password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Save changes
        </Button>
      </Card>
    </Form>
  );
}
