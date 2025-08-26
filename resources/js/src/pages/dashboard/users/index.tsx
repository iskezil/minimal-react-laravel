import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role: string | null;
};

interface Props {
  users: User[];
}

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

export default function Index({ users }: Props) {
  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.created_at}</TableCell>
                    <TableCell>{user.role || '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton color="primary">
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton color="error">
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}
