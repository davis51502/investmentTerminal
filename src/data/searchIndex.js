const routes = [
  {
    id: 'route-home',
    label: 'Home',
    description: 'Dashboard overview and quick status',
    path: '/',
    kind: 'page',
  },
  {
    id: 'route-markets',
    label: 'Markets',
    description: 'Live pricing and watchlist movers',
    path: '/markets',
    kind: 'page',
  },
  {
    id: 'route-portfolio',
    label: 'Portfolio',
    description: 'Your holdings and allocation',
    path: '/portfolio',
    kind: 'page',
  },
  {
    id: 'route-settings',
    label: 'Settings',
    description: 'Profile, API keys, and preferences',
    path: '/settings',
    kind: 'page',
  },
]

export default routes
