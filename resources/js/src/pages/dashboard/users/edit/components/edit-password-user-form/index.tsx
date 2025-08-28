import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { IconButton, InputAdornment } from '@mui/material';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useBoolean } from 'minimal-shared/hooks';

// ----------------------------------------------------------------------

type User = { id: number };

type PageProps = InertiaPageProps & { csrf_token: string };

type FormValues = {
  password: string;
  password_confirmation: string;
};

interface Props {
  currentUser: User;
}

export function EditPasswordUserForm({ currentUser }: Props) {
  const { __ } = useLang();
  const showPassword = useBoolean();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const Schema = z
    .object({
      password: z.string().min(6, { message: __('validation.min.string', { min: 6 }) }),
      password_confirmation: z.string().min(1, { message: __('validation.required') }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: __('validation.confirmed'),
    });

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit((data) => {
    const payload = new FormData();
    payload.append('_token', csrfToken);
    payload.append('_method', 'PUT');
    payload.append('password', data.password);
    payload.append('password_confirmation', data.password_confirmation);

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

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
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

          <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
            {__('pages/users.form.submit_update')}
          </Button>
        </Stack>
      </Card>
    </Form>
  );
}
