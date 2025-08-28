import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: 'active' | 'pending' | 'banned';
  roles: number[];
};

type PageProps = InertiaPageProps & { csrf_token: string };

type FormValues = {
  name: string;
  email: string;
  roles: string[];
  avatar: File | string | null;
  status: 'active' | 'pending' | 'banned';
};

interface Props {
  roles: Role[];
  currentUser: User;
}

export function EditUserForm({ roles, currentUser }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const Schema = z.object({
    name: z.string().min(1, { message: __('validation.required') }),
    email: z.string().email({ message: __('validation.email') }),
    roles: z.array(z.string()).min(1, { message: __('validation.required') }),
    avatar: z.any().optional(),
    status: z.enum(['active', 'pending', 'banned']),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      roles: currentUser.roles.map(String),
      avatar: currentUser.avatar ?? null,
      status: currentUser.status,
    },
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { isSubmitting },
  } = methods;

  const roleOptions = roles.map((r) => ({
    label: __(`pages/users.roles.${r.name.toLowerCase()}`),
    value: String(r.id),
  }));

  const onSubmit = handleSubmit((data) => {
    const payload = new FormData();
    payload.append('_token', csrfToken);
    payload.append('_method', 'PUT');
    payload.append('name', data.name);
    payload.append('email', data.email);
    data.roles.forEach((r) => payload.append('roles[]', r));
    payload.append('status', data.status);
    if (data.avatar instanceof File) {
      payload.append('avatar', data.avatar);
    }

    router.post(route('users.update', currentUser.id), payload, {
      onSuccess: () => {
        toast.success(__('pages/users.update_success'));
        router.visit(paths.users);
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message: message as string });
        });
      },
    });
  });

  const handleDelete = () => {
    router.delete(route('users.destroy', currentUser.id), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/users.delete_success'));
        router.visit(paths.users);
      },
    });
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Field.UploadAvatar name="avatar" />
            <Button color="error" variant="soft" sx={{ mt: 3 }} onClick={handleDelete}>
              {__('pages/users.delete_user')}
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Field.Text name="name" label={__('pages/users.form.name')} />
              <Field.Text name="email" label={__('pages/users.form.email')} />

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
                <MenuItem value="banned">{__('pages/users.tabs.banned')}</MenuItem>
              </Field.Select>

              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
                {__('pages/users.form.submit_update')}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
