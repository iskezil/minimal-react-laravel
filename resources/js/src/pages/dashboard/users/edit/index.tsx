import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { Can } from 'src/components/Can';
import { EditUserForm } from '@/pages/dashboard/users/edit/components/edit-user-form';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Iconify } from '@/components/iconify';
import { RouterLink } from 'src/routes/components';
import { removeLastSlash } from 'minimal-shared/utils';
import { usePathname } from 'src/routes/hooks';

const NAV_ITEMS = [
  {
    label: 'General',
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
    href: paths.userEdit,
  },
  {
    label: 'Security',
    icon: <Iconify width={24} icon="ic:round-vpn-key" />,
    href: `${paths.userEdit}/change-password`,
  },
];

type Role = { id: number; name: string };

type User = { id: number; name: string; email: string; roles: number[]; status: string };

interface Props {
  user: User;
  roles: Role[];
}

const metadata = { title: `Edit User | Dashboard - ${CONFIG.appName}` };

export default function Edit({ user, roles }: Props) {
  const { __ } = useLang();
  const pathname = usePathname();
  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <Can permission="USERS_EDIT">
          <DashboardContent maxWidth="xl">
            <CustomBreadcrumbs
              heading={__('pages/users.edit_user')}
              links={[
                { name: __('pages/users.breadcrumbs.dashboard'), href: paths.dashboard.root },
                { name: __('pages/users.breadcrumbs.users'), href: paths.users },
                { name: __('pages/users.breadcrumbs.edit') },
              ]}
              sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Tabs value={removeLastSlash(pathname)} sx={{ mb: { xs: 3, md: 5 } }}>
              {NAV_ITEMS.map((tab) => (
                <Tab
                  component={RouterLink}
                  key={tab.href}
                  label={tab.label}
                  icon={tab.icon}
                  value={tab.href}
                  href={tab.href}
                />
              ))}
            </Tabs>
            <EditUserForm currentUser={user} roles={roles} />
          </DashboardContent>
        </Can>
      </DashboardLayout>
    </>
  );
}
