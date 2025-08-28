import { router, usePage } from '@inertiajs/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Form, Field } from 'src/components/hook-form';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

type User = {
  id: number;
  name: string;
  email: string;
  roles: number[];
  status: string;
};

type PageProps = { csrf_token: string };

type Props = { roles: Role[]; currentUser?: User };

export function UserForm({ roles, currentUser }: Props) {
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
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3} alignItems="center">
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => {
                  const file = field.value as File | null;
                  const preview = file ? URL.createObjectURL(file) : undefined;
                  return (
                    <Stack spacing={2} alignItems="center">
                      <Avatar src={preview} sx={{ width: 96, height: 96 }} />
                      <Button component="label" variant="outlined">
                        {__('pages/users.form.avatar') ?? 'Upload photo'}
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            field.onChange(f);
                          }}
                        />
                      </Button>
                    </Stack>
                  );
                }}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    labelPlacement="start"
                    control={
                      <Switch
                        checked={field.value === 'active'}
                        onChange={(e) =>
                          field.onChange(e.target.checked ? 'active' : 'pending')
                        }
                      />
                    }
                    label={__('pages/users.form.status')}
                    sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Field.Text name="name" label={__('pages/users.form.name')} />
              <Field.Text name="email" label={__('pages/users.form.email')} />
              {!currentUser && (
                <Field.Text
                  name="password"
                  label={__('pages/users.form.password')}
                  type="password"
                />
              )}
              <Controller
                name="roles"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>{__('pages/users.form.roles')}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      label={__('pages/users.form.roles')}
                      renderValue={(selected) =>
                        (selected as number[])
                          .map((value) => translateRole(value))
                          .join(', ')
                      }
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          <Checkbox checked={field.value.includes(role.id)} />
                          <ListItemText
                            primary={__(`pages/users.roles.${role.name.toLowerCase()}`)}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Stack alignItems="flex-end">
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {currentUser
                    ? __('pages/users.form.submit_update')
                    : __('pages/users.form.submit_create')}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}

