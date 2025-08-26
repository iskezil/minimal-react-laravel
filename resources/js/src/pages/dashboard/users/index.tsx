import { useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { Label } from 'src/components/label';
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

// ----------------------------------------------------------------------

export default function Index({ users, roles }: Props) {
  const { __ } = useLang();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const STATUS_OPTIONS = [
    { value: 'all', label: __('pages/users.tabs.all') },
    { value: 'active', label: __('pages/users.tabs.active') },
    { value: 'pending', label: __('pages/users.tabs.pending') },
    { value: 'banned', label: __('pages/users.tabs.banned') },
  ];

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())) &&
          (!role || user.role === role) &&
          (status === 'all' || user.status === status)
      ),
    [users, search, role, status]
  );

  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredUsers, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeStatus = (_: SyntheticEvent, newValue: string) => {
    setStatus(newValue);
    setPage(0);
  };

  const getStatusCount = (value: string) =>
    value === 'all'
      ? users.length
      : users.filter((user) => user.status === value).length;

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
                {__('pages/users.add_user')}
              </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <Tabs value={status} onChange={handleChangeStatus} sx={{ px: { md: 2.5 } }}>
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  iconPosition="end"
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        (tab.value === 'all' || tab.value === status) ? 'filled' : 'soft'
                      }
                      color={
                        (tab.value === 'active' && 'success') ||
                        (tab.value === 'pending' && 'warning') ||
                        (tab.value === 'banned' && 'error') ||
                        'default'
                      }
                    >
                      {getStatusCount(tab.value)}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
              <TextField
                size="small"
                label={__('pages/users.search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: 1, sm: 240 } }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{__('pages/users.filters.role')}</InputLabel>
                <Select
                  value={role}
                  label={__('pages/users.filters.role')}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    <em>{__('pages/users.filters.role')}</em>
                  </MenuItem>
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.name}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{__('pages/users.table.name')}</TableCell>
                    <TableCell>{__('pages/users.table.email')}</TableCell>
                    <TableCell>{__('pages/users.table.status')}</TableCell>
                    <TableCell>{__('pages/users.table.created')}</TableCell>
                    <TableCell>{__('pages/users.table.role')}</TableCell>
                    <TableCell align="center">{__('pages/users.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Label
                          color={
                            (user.status === 'active' && 'success') ||
                            (user.status === 'pending' && 'warning') ||
                            (user.status === 'banned' && 'error') ||
                            'default'
                          }
                        >
                          {user.status}
                        </Label>
                      </TableCell>
                      <TableCell>{user.created_at}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
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
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {__('pages/users.no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

