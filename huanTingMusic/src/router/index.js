import Vue from 'vue'
import Router from 'vue-router'
import home from '@/views/home/index'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'HelloWorld',
    component: home
  }]
})