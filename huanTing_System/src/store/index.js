import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    userInfo: {}
  },
  getters: {
    userInfo(state) {
      return state.userInfo
    },
    userName(state) {
      return state.userInfo.userName
    },
    userId(state) {
      return state.userInfo.userId
    },
    userIdentityId(state) {
      return state.userInfo.identityId
    },
    userIdentityName(state) {
      return state.userInfo.identityName
    },
    userRootList(state) {
      return state.userRootList
    }
  },
  mutations: {
    // 储存登录的用户信息
    saveLoginInfo(state, data) {
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('user', JSON.stringify(data.userInfo))
      state.token = data.token
      state.userInfo = data.userInfo
    },
    // 刷新重新存储用户信息
    refreshUserMessage(state) {
      const token = sessionStorage.getItem('token') || ''
      const user = JSON.parse(sessionStorage.getItem('user')) || {}

      state.token = token
      state.userInfo = user
    },
    // 移除用户信息
    removeLoginInfo(state) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      state.token = ''
      state.userInfo = {}
      router.push('/login')
    },
    // 存储用户权限列表
    saveUserRootList(state, data) {
      state.userInfo.rootList = data
      state.userRootList = data
    }
  }
})

export default store