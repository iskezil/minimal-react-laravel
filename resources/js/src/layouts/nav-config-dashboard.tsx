import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { useLang } from 'src/hooks/useLang';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData(): NavSectionProps['data'] {
  const { __ } = useLang();

  return useMemo(
    () => [
      {
        subheader: __('navigation.overview.subheader'),
        items: [
          {
            title: __('navigation.overview.one'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
            info: <Label>v{CONFIG.appVersion}</Label>,
          },
          {
            title: __('navigation.overview.test'),
            path: paths.dashboard.two,
            icon: ICONS.ecommerce,
          },
          {
            title: __('navigation.overview.three'),
            path: paths.dashboard.three,
            icon: ICONS.analytics,
          },
        ],
      },
      {
        subheader: __('navigation.management.subheader'),
        items: [
          {
            title: __('navigation.management.users'),
            path: paths.users,
            icon: ICONS.user,
            allowedRoles: ['admin'],
          },
          {
            title: __('navigation.management.group'),
            path: paths.dashboard.group.root,
            icon: ICONS.user,
            children: [
              {
                title: __('navigation.management.four'),
                path: paths.dashboard.group.root,
              },
              {
                title: __('navigation.management.five'),
                path: paths.dashboard.group.five,
              },
              {
                title: __('navigation.management.six'),
                path: paths.dashboard.group.six,
              },
            ],
          },
        ],
      },
      {
        subheader: __('navigation.auth.subheader'),
        items: [
          { title: __('navigation.auth.sign_in'), path: '/sign-in' },
          { title: __('navigation.auth.sign_up'), path: '/sign-up' },
        ],
      },
    ],
    [__]
  );
}
