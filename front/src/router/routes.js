
const routes = [
  {
    path: '/',
    component: () => import('components/MapBoxContainer.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('components/Error404.vue')
  }
]

export default routes
