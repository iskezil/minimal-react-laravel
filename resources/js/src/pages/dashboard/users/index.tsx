import { useMemo, useState } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  role: string | null;
};

type Role = { id: number; name: string };

interface Props {
  users: User[];
  roles: Role[];
}

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

export default function Index({ users, roles }: Props) {
  const { __ } = useLang();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())) &&
          (!role || user.role === role)
      ),
    [users, search, role]
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: __('pages/users.table.name'), flex: 1 },
    { field: 'email', headerName: __('pages/users.table.email'), flex: 1 },
    { field: 'status', headerName: __('pages/users.table.status'), flex: 1 },
    { field: 'created_at', headerName: __('pages/users.table.created'), flex: 1 },
    { field: 'role', headerName: __('pages/users.table.role'), flex: 1 },
    {
      field: 'actions',
      headerName: __('pages/users.table.actions'),
      sortable: false,
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      renderCell: () => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: 1 }}>
          <IconButton size="small">
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton size="small" color="primary">
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton size="small" color="error">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/users.breadcrumbs.users')}
            links={[
              { name: __('pages/users.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/users.breadcrumbs.users') },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.root}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add user
              </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <TextField
              size="small"
              label={__('pages/users.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{__('pages/users.filters.role')}</InputLabel>
              <Select
                value={role}
                label={__('pages/users.filters.role')}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.name}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <DataGrid
            autoHeight
            rows={filteredUsers}
            columns={columns}
            initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }}
            pageSizeOptions={[5, 10, 25]}
            disableColumnMenu
          />
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}
