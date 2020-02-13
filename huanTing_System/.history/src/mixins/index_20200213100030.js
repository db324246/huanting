// import defaultImg from '../assets/image/avatar.jpeg'

import store from '@/store'
const mixin = {
  data() {
    return {
      // 默认图片
      defaultImg: 'this.src="' + require('@/assets/image/default.jpeg') + '"',
      // 文件上传接口地址
      uploadApi: '/system/Upload',
      // 文件上传的请求头
      uploadHeaders: {
        Authorization: store.getters.userToken
      }
    }
  },
  methods: {
    mixinTest() {
      console.log('mixinTest success');
    },
    // 上传图片之前的触发事件
    beforeImgUpload(file) {
      const typeList = ['jpg', 'gif', 'bmp', 'png', 'jpeg', 'jfif']
      const fileType = file.name.split('.')[1]
      const fileMaxSize = 3 * 1024 * 1024
      if (typeList.indexOf(fileType) === -1) {
        this.$message.error('请上传图片文件')
        return false
      }
      if (file.size > fileMaxSize) {
        this.$message.error('图片大小不能超过3M')
        return false
      }
      this.$message.success('图片上传中')
      return true
    },
    // 上传音乐之前的触发事件
    beforeMusicUpload(file) {
      // const typeList = ['jpg', 'gif', 'bmp', 'png', 'jpeg']
      // const fileType = file.name.split('.')[1]
      // const fileMaxSize = 3 * 1024 * 1024
      // if (typeList.indexOf(fileType) === -1) {
      //   this.$message.error('请上传图片文件')
      //   return false
      // }
      // if (file.size > fileMaxSize) {
      //   this.$message.error('图片大小不能超过3M')
      //   return false
      // }
      // return true
      this.$message.success('音乐上传中')
      return true
    },
    // 上传歌词之前的触发事件
    beforeLrcUpload(file) {
      // const typeList = ['jpg', 'gif', 'bmp', 'png', 'jpeg']
      // const fileType = file.name.split('.')[1]
      // const fileMaxSize = 3 * 1024 * 1024
      // if (typeList.indexOf(fileType) === -1) {
      //   this.$message.error('请上传图片文件')
      //   return false
      // }
      // if (file.size > fileMaxSize) {
      //   this.$message.error('图片大小不能超过3M')
      //   return false
      // }
      // return true
      this.$message.success('歌词上传中')
      return true
    },
    showAudioDialog(music) {
      store.commit('showDialog', music)
    },
    closeAudioDialog() {
      store.commit('closeDialog')
    }
  }
}

export default mixin