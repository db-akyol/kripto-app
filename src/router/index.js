import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue')
    },
    {
      path: '/markets',
      name: 'markets',
      component: () => import('../views/MarketsView.vue')
    },
    {
      path: '/ai-analyst',
      name: 'ai-analyst',
      component: () => import('../views/AIAnalystView.vue')
    }
  ]
})

export default router
