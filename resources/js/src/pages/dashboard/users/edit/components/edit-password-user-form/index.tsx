import { router, usePage } from '@inertiajs/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Field, Form } from 'src/components/hook-form';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { Label } from 'src/components/label';
import Typography from '@mui/material/Typography';
import { fData } from 'src/utils/format-number';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

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
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label color="success" sx={{ position: 'absolute', top: 24, right: 24 }}>
                Активен"
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{
                  mx: 0,
                  mb: 3,
                  width: 1,
                  justifyContent: 'space-between',
                }}
              />
            )}

            <Field.Switch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button variant="soft" color="error">
                  Delete user
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="name" label="Full name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" defaultCountry="US" />

              <Field.CountrySelect
                fullWidth
                name="country"
                label="Country"
                placeholder="Choose a country"
              />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="address" label="Address" />
              <Field.Text name="zipCode" label="Zip/code" />
              <Field.Text name="company" label="Company" />
              <Field.Text name="role" label="Role" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create user' : 'Save changes'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
