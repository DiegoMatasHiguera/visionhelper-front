import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProfileView from '@/views/ProfileView.vue'
import LotesView from '@/views/LotesView.vue'
import MuestreoView from '@/views/MuestreoView.vue'
import ResumenPrevioView from '@/views/resumenPrevioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: DashboardView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/lotes',
      name: 'lotes',
      component: LotesView,
    },
    {
      path: '/muestreo/:testId',
      name: 'muestreo',
      component: MuestreoView,
    },
    {
      path: '/resumenPrevio/:testId',
      name: 'resumenPrevio',
      component: ResumenPrevioView,
    },
  ],
})

export default router
