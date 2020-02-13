import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    token: '',
    userInfo: {},
    audioDialog: false,
    audioSrc: '',
    audioTitle: '',
    audioAlbum: '',
    previewPicFlag: false, // 图片预览显示布尔值
    commonShowImgBaseUrl: '', // 默认的图片基础地址
    imgPreviewConfig: { // 图片预览组件配置
      imageKeys: [], //  图片链接数组 / 必传
      currentIndex: 0, // 图片预览的当前索引号 / 可不传
      imageContent: [] // 图片对应标题的数组 / 可不传
    }
  },
  getters: {
    userToken(state) {
      return state.token
    },
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
      sessionStorage.removeItem('userFlag')
      state.token = ''
      state.userInfo = {}
      router.push('/login')
    },
    // 存储用户权限列表
    saveUserRootList(state, data) {
      state.userInfo.rootList = data
      state.userRootList = data
    },
    // 弹出全局音乐对话框
    showDialog(state, music) {
      state.audioDialog = true
      state.audioSrc = music.musicSrc
      state.audioAlbum = music.albumArt
      state.audioTitle = `${music.title} - ${music.singerName}`
    },
    // 关闭全局音乐对话框
    closeDialog(state) {
      state.audioSrc = ''
      state.audioTitle = ''
      state.audioDialog = false
    },
    // 全局预览图片
    previewImg(state, data) {
      state.imgPreviewConfig.imageKeys = data.images
      state.imgPreviewConfig.currentIndex = data.index
      state.imgPreviewConfig.imageContent = data.albums
      state.previewPicFlag = true
    }
  }
})

export default store