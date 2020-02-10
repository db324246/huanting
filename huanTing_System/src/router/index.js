import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/loginSys/index.vue'

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
      component: () => import('@/views/loginSys/index.vue')
    }]
  }, {
    path: '/home',
    name: '系统主页',
    component: () => import('@/views/home/Home.vue'),
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: '系统首页',
        component: () => import('@/views/users')
      },
      {
        path: '/userManage',
        name: '用户管理',
        component: () => import('@/views/users')
      },
      {
        path: '/musicLibary',
        name: '曲库管理',
        component: () => import('@/views/musicLibary/index.vue')
      },
      {
        path: '/singer',
        name: '歌手管理',
        component: () => import('@/views/singer')
      },
      {
        path: '/singerDetail',
        name: '歌手详情',
        component: () => import('@/views/singer/detail.vue')
      },
      {
        path: '/songList',
        name: '歌单管理',
        component: () => import('@/views/songList')
      },
      {
        path: '/songListMusic',
        name: '歌单歌曲管理',
        component: () => import('@/views/songList/detail.vue')
      },
      {
        path: '/categories',
        name: '歌曲分类管理',
        component: () => import('@/views/category')
      },
      {
        path: '/categoryMusic',
        name: '分类音乐管理',
        component: () => import('@/views/category/categoryMusic.vue')
      },
      {
        path: '/recommend',
        name: '今日推荐',
        component: () => import('@/views/recommend')
      },
      {
        path: '/webMessage',
        name: '网站管理',
        component: () => import('@/views/webSite')
      },
      {
        path: '/test',
        name: '测试',
        component: () => import('@/views/test.vue')
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