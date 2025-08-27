import { type ChangeEvent, type SyntheticEvent, useMemo, useState } from 'react';

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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Label } from 'src/components/label';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FilledInput } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  roles: number[];
};

type Role = { id: number; name: string };

type Filters = { keyword: string; role: number | null; status: string };

interface Props {
  users: User[];
  roles: Role[];
}

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

// ----------------------------------------------------------------------

export default function Index({ users, roles }: Props) {
  const { __ } = useLang();

  const [userList, setUserList] = useState<User[]>(users);
  const [filters, setFilters] = useState<Filters>({ keyword: '', role: null, status: 'all' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editing, setEditing] = useState<{ id: number | null; field: string | null }>({
    id: null,
    field: null,
  });

  const handleFilters = (name: keyof Filters, value: string | number | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ keyword: '', role: null, status: 'all' });
    setPage(0);
  };

  const handleEditChange = (id: number, field: keyof User, value: any) => {
    setUserList((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const STATUS_OPTIONS = [
    { value: 'all', label: __('pages/users.tabs.all') },
    { value: 'active', label: __('pages/users.tabs.active') },
    { value: 'pending', label: __('pages/users.tabs.pending') },
    { value: 'banned', label: __('pages/users.tabs.banned') },
  ];

  const filteredUsers = useMemo(
    () =>
      userList.filter(
        (user) =>
          (user.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.keyword.toLowerCase())) &&
          (!filters.role || user.roles.includes(filters.role)) &&
          (filters.status === 'all' || user.status === filters.status)
      ),
    [userList, filters]
  );

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
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
    handleFilters('status', newValue);
  };

  const getStatusCount = (value: string) =>
    value === 'all' ? userList.length : userList.filter((user) => user.status === value).length;

  const translateRole = (id: number) => {
    const role = roles.find((r) => r.id === id);
    return role ? __(`pages/users.roles.${role.name.toLowerCase()}`) : '';
  };

  const handleCopy = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // fall back to older copy method
      }
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const hoverSx = {
    '& .action-icons': {
      display: 'inline-flex',
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      transition: 'opacity 0.2s',
    },
    '&:hover .action-icons': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    },
  };

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
            <Tabs value={filters.status} onChange={handleChangeStatus} sx={{ px: { md: 2.5 } }}>
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  iconPosition="end"
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        tab.value === 'all' || tab.value === filters.status ? 'filled' : 'soft'
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

            <UserTableToolbar filters={filters} onFilters={handleFilters} roles={roles} />

            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={filteredUsers.length}
              roles={roles}
            />

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
                  {paginatedUsers.map((user) => {
                    const rolesText = user.roles.length
                      ? user.roles.map(translateRole).join(', ')
                      : '-';
                    const statusText = __(`pages/users.tabs.${user.status}`);
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'name' ? (
                            <FilledInput
                              value={user.name}
                              size="small"
                              hiddenLabel
                              autoFocus
                              onChange={(e) => handleEditChange(user.id, 'name', e.target.value)}
                              onBlur={() => setEditing({ id: null, field: null })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditing({ id: null, field: null });
                              }}
                            />
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {user.name}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => setEditing({ id: user.id, field: 'name' })}
                              >
                                <Iconify icon="solar:pen-bold" width={16} />
                              </IconButton>
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(user.name)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'email' ? (
                            <FilledInput
                              value={user.email}
                              size="small"
                              hiddenLabel
                              autoFocus
                              onChange={(e) => handleEditChange(user.id, 'email', e.target.value)}
                              onBlur={() => setEditing({ id: null, field: null })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditing({ id: null, field: null });
                              }}
                            />
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {user.email}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => setEditing({ id: user.id, field: 'email' })}
                              >
                                <Iconify icon="solar:pen-bold" width={16} />
                              </IconButton>
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(user.email)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'status' ? (
                            <Select
                              size="small"
                              variant="filled"
                              hiddenLabel
                              value={user.status}
                              onChange={(e) => {
                                handleEditChange(user.id, 'status', e.target.value);
                              }}
                              onClose={() => setEditing({ id: null, field: null })}
                            >
                              {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              <Label
                                color={
                                  (user.status === 'active' && 'success') ||
                                  (user.status === 'pending' && 'warning') ||
                                  (user.status === 'banned' && 'error') ||
                                  'default'
                                }
                              >
                                {statusText}
                              </Label>
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => setEditing({ id: user.id, field: 'status' })}
                              >
                                <Iconify icon="solar:pen-bold" width={16} />
                              </IconButton>
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(statusText)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                            {user.created_at}
                            <IconButton
                              className="action-icons"
                              size="small"
                              onClick={() => handleCopy(user.created_at)}
                            >
                              <Iconify icon="solar:copy-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'roles' ? (
                            <Select
                              multiple
                              size="small"
                              variant="filled"
                              hiddenLabel
                              value={user.roles}
                              onChange={(e) => {
                                const value = e.target.value as number[];
                                handleEditChange(user.id, 'roles', value);
                              }}
                              renderValue={(selected) =>
                                (selected as number[]).map(translateRole).join(', ')
                              }
                              onClose={() => setEditing({ id: null, field: null })}
                            >
                              {roles.map((r) => {
                                const key = r.name.toLowerCase();
                                return (
                                  <MenuItem key={r.id} value={r.id}>
                                    <Checkbox checked={user.roles.includes(r.id)} />
                                    <ListItemText primary={__(`pages/users.roles.${key}`)} />
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {rolesText}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => setEditing({ id: user.id, field: 'roles' })}
                              >
                                <Iconify icon="solar:pen-bold" width={16} />
                              </IconButton>
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(rolesText)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
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
                    );
                  })}

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

// ----------------------------------------------------------------------

type UserTableToolbarProps = {
  filters: Filters;
  onFilters: (name: keyof Filters, value: string | number | null) => void;
  roles: Role[];
};

function UserTableToolbar({ filters, onFilters, roles }: UserTableToolbarProps) {
  const { __ } = useLang();

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
      <TextField
        size="small"
        variant="filled"
        hiddenLabel
        value={filters.keyword}
        onChange={(e) => onFilters('keyword', e.target.value)}
        sx={{ width: { xs: 1, sm: 240 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" width={24} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        size="small"
        sx={{ minWidth: '100px', width: 'auto' }}
        hiddenLabel
        variant="filled"
        placeholder={__('pages/users.filters.role')}
        value={filters.role ?? ''}
        onChange={(e) => onFilters('role', e.target.value === '' ? null : Number(e.target.value))}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:user-id-bold" width={24} />
              </InputAdornment>
            ),
          },
        }}
      >
        {roles.map((role) => {
          const key = role.name.toLowerCase();
          return (
            <MenuItem key={role.id} value={role.id}>
              {__(`pages/users.roles.${key}`)}
            </MenuItem>
          );
        })}
      </TextField>
    </Stack>
  );
}

type UserTableFiltersResultProps = {
  filters: Filters;
  onFilters: (name: keyof Filters, value: string | number | null) => void;
  onResetFilters: () => void;
  results: number;
  roles: Role[];
};

function UserTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  roles,
}: UserTableFiltersResultProps) {
  const { __ } = useLang();
  const { keyword, role, status } = filters;
  const roleName = role !== null ? roles.find((r) => r.id === role)?.name || '' : '';

  const canReset = keyword || role !== null || status !== 'all';
  if (!canReset) return null;

  return (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ p: 2, pt: 0 }}>
      <Typography variant="body2" sx={{ mr: 1 }}>
        {__('pages/users.filters.results', { count: results })}
      </Typography>

      {status !== 'all' && (
        <Chip
          label={`${__('pages/users.filters.status')}: ${__('pages/users.tabs.' + status)}`}
          onDelete={() => onFilters('status', 'all')}
        />
      )}

      {role !== null && (
        <Chip
          label={`${__('pages/users.filters.role')}: ${__(`pages/users.roles.${roleName.toLowerCase()}`)}`}
          onDelete={() => onFilters('role', null)}
        />
      )}

      {keyword && (
        <Chip
          label={`${__('pages/users.filters.keyword')}: ${keyword}`}
          onDelete={() => onFilters('keyword', '')}
        />
      )}

      <Button
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={onResetFilters}
      >
        {__('pages/users.filters.clear')}
      </Button>
    </Stack>
  );
}
