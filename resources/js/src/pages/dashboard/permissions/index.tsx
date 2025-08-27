import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { RoleNames, PermissionNames } from 'src/enums/rights';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

type Role = {
  id: number;
  name: string;
};

type Permission = {
  id: number;
  name: string;
  created_at: string;
  roles: Role[];
};

type PageProps = { csrf_token: string };

type Props = { permissions: Permission[] };

const metadata = { title: `Permissions | Dashboard - ${CONFIG.appName}` };

export default function Index({ permissions }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const [permissionList, setPermissionList] = useState<Permission[]>(permissions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [newPermission, setNewPermission] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewPermission, setViewPermission] = useState<Permission | null>(null);

  useEffect(() => {
    setPermissionList(permissions);
  }, [permissions]);

  const filtered = useMemo(
    () =>
      permissionList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [permissionList, search]
  );

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    router.post(
      route('permissions.store'),
      { name: newPermission, _token: csrfToken },
      {
        onSuccess: () => {
          toast.success(__('pages/permissions.add_permission'));
          setOpenAdd(false);
          setNewPermission('');
          router.reload({ only: ['permissions'] });
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    router.delete(route('permissions.destroy', deleteId), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/permissions.delete_success'));
        setDeleteId(null);
        router.reload({ only: ['permissions'] });
      },
    });
  };

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/permissions.breadcrumbs.permissions')}
            links={[
              { name: __('pages/permissions.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/permissions.breadcrumbs.permissions') },
            ]}
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => setOpenAdd(true)}
              >
                {__('pages/permissions.add_permission')}
              </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
              <TextField
                size="small"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={__('pages/permissions.search')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-linear" width={24} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{__('pages/permissions.table.name')}</TableCell>
                    <TableCell>{__('pages/permissions.table.display')}</TableCell>
                    <TableCell>{__('pages/permissions.table.created')}</TableCell>
                    <TableCell align="center">{__('pages/permissions.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        {PermissionNames[p.name as keyof typeof PermissionNames]
                          ? __(PermissionNames[p.name as keyof typeof PermissionNames])
                          : p.name}
                      </TableCell>
                      <TableCell>{p.created_at}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => setViewPermission(p)}>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteId(p.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {__('pages/permissions.no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
        <DialogTitle>{__('pages/permissions.add_permission')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            variant="filled"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>{__('pages/permissions.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newPermission}>
            {__('pages/permissions.add_permission')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewPermission !== null}
        onClose={() => setViewPermission(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{__('pages/permissions.roles')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {viewPermission?.roles.map((r) => (
              <div key={r.id}>
                {RoleNames[r.name as keyof typeof RoleNames]
                  ? __(RoleNames[r.name as keyof typeof RoleNames])
                  : r.name}
              </div>
            ))}
            {viewPermission && viewPermission.roles.length === 0 && (
              <div>{__('pages/permissions.no_roles')}</div>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPermission(null)}>{__('pages/permissions.cancel')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={__('pages/permissions.delete_permission')}
        content={__('pages/permissions.delete_confirm')}
        action={
          <Button color="error" variant="contained" onClick={handleDelete}>
            {__('pages/permissions.delete')}
          </Button>
        }
      />
    </>
  );
}

