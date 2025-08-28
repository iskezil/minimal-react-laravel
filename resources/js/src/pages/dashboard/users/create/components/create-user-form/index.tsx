import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { IconButton, InputAdornment } from '@mui/material';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useBoolean } from 'minimal-shared/hooks';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

type PageProps = InertiaPageProps & { csrf_token: string };

type FormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles: string[];
  avatar: File | string | null;
  status: 'active' | 'pending';
};

interface Props {
  roles: Role[];
}

export function CreateUserForm({ roles }: Props) {
  const { __ } = useLang();
  const showPassword = useBoolean();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const Schema = z
    .object({
      name: z.string().min(1, { message: __('validation.required') }),
      email: z.string().email({ message: __('validation.email') }),
      password: z.string().min(6, { message: __('validation.min.string', { min: 6 }) }),
      password_confirmation: z.string().min(1, { message: __('validation.required') }),
      roles: z.array(z.string()).min(1, { message: __('validation.required') }),
      avatar: z.any().optional(),
      status: z.enum(['active', 'pending']),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: __('validation.confirmed'),
    });

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      roles: [],
      avatar: null,
      status: 'active',
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const roleOptions = roles.map((r) => ({
    label: __(`pages/users.roles.${r.name.toLowerCase()}`),
    value: String(r.id),
  }));

  const onSubmit = handleSubmit((data) => {
    const payload = new FormData();
    payload.append('_token', csrfToken);
    payload.append('name', data.name);
    payload.append('email', data.email);
    payload.append('password', data.password);
    payload.append('password_confirmation', data.password_confirmation);
    data.roles.forEach((r) => payload.append('roles[]', r));
    payload.append('status', data.status);
    if (data.avatar instanceof File) {
      payload.append('avatar', data.avatar);
    }

    router.post(route('users.store'), payload, {
      onSuccess: () => {
        toast.success(__('pages/users.create_success'));
        router.visit(paths.users);
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message: message as string });
        });
      },
    });
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Field.UploadAvatar name="avatar" />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Field.Text name="name" label={__('pages/users.form.name')} />
              <Field.Text name="email" label={__('pages/users.form.email')} />

              <Field.Text
                name="password"
                type={showPassword.value ? 'text' : 'password'}
                label={__('pages/users.form.password')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <span className="material-icons">
                            {showPassword.value ? 'visibility' : 'visibility_off'}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Field.Text
                name="password_confirmation"
                type={showPassword.value ? 'text' : 'password'}
                label={__('validation.attributes.password_confirmation')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <span className="material-icons">
                            {showPassword.value ? 'visibility' : 'visibility_off'}
                          </span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Field.MultiSelect
                name="roles"
                label={__('pages/users.form.roles')}
                options={roleOptions}
                placeholder=""
                checkbox
              />

              <Field.Select name="status" label={__('pages/users.form.status')}>
                <MenuItem value="active">{__('pages/users.tabs.active')}</MenuItem>
                <MenuItem value="pending">{__('pages/users.tabs.pending')}</MenuItem>
              </Field.Select>

              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
                {__('pages/users.form.submit_create')}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
