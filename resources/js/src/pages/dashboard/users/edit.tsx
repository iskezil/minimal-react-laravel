import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { Can } from 'src/components/Can';
import { UserForm } from 'src/sections/users/user-form';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

type User = { id: number; name: string; email: string; roles: number[] };

interface Props {
  user: User;
  roles: Role[];
}

const metadata = { title: `Edit User | Dashboard - ${CONFIG.appName}` };

export default function Edit({ user, roles }: Props) {
  const { __ } = useLang();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <Can permission="USERS_EDIT">
          <DashboardContent maxWidth="md">
            <CustomBreadcrumbs
              heading={__('pages/users.edit_user')}
              links={[
                { name: __('pages/users.breadcrumbs.dashboard'), href: paths.dashboard.root },
                { name: __('pages/users.breadcrumbs.users'), href: paths.users },
                { name: __('pages/users.breadcrumbs.edit') },
              ]}
              sx={{ mb: { xs: 3, md: 5 } }}
            />
            <UserForm currentUser={user} roles={roles} />
          </DashboardContent>
        </Can>
      </DashboardLayout>
    </>
  );
}

