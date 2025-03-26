import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProfileView from '@/views/ProfileView.vue'
import LotesView from '@/views/LotesView.vue'
import MuestreoView from '@/views/MuestreoView.vue'
import ResumenPrevioView from '@/views/resumenPrevioView.vue'
import TestView from '@/views/TestView.vue'
import RegisterView from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
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
      path: '/examenes',
      name: 'examenes',
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
    {
      path: '/test/:testId',
      name: 'test',
      component: TestView,
    },
  ],
})

export default router
