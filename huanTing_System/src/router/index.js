import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/loginSys/index.vue'
import Home from '@/views/home/Home.vue'
import Index from '@/views/home/index.vue'
import MusicLibary from '@/views/musicLibary/index.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: '幻听后台管理系统',
    component: Login,
    children: [{
      path: '/login',
      name: '登陆系统',
      component: Login
    }]
  }, {
    path: '/home',
    name: '系统主页',
    component: Home,
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: '系统首页',
        component: Index
      },
      {
        path: '/userManage',
        name: '用户管理',
        component: Index
      },
      {
        path: '/musicLibary',
        name: '曲库管理',
        component: MusicLibary
      }
    ]
  }]
})

// eslint-disable-next-line consistent-return
router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/') return next()

  const token = sessionStorage.getItem('token')

  if (!token) return next('/login')

  next()
})

export default router