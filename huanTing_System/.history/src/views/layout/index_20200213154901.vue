<template>
  <div class="right_container">
    <!-- 头部栏 -->
    <el-header>
      <div class="localtime">
        <span>{{localtime}}</span>
      </div>
      <div class="userinfo">
        <span style="margin-right: 20px;">
          <i class="el-icon-s-custom"></i>{{$store.getters.userName}}
        </span>
        <el-button type="danger" size="mini" @click="logout"> 退出 </el-button>
      </div>
    </el-header>

    <el-main :style="{'height': $store.state.audioDialog ? 'calc(100vh - 140px)': 'calc(100vh - 80px)'}">
      <el-scrollbar style="height: 100%;">
        <router-view></router-view>
      </el-scrollbar>
    </el-main>

    <!-- 全局图片预览组件 -->
    <image-previewer 
    v-if="$store.state.previewPicFlag" 
    :imgPreviewConfig="$store.state.imgPreviewConfig"
    :baseUrl="$store.state.commonShowImgBaseUrl"
    @closePreview="closePreview"
    :onerror="defaultImg">
    </image-previewer>

    <!-- 全局音乐播放 -->
    <transition name="el-zoom-in-bottom">
      <div v-show="$store.state.audioDialog" class="transition-box">
        <img class="audioImage" @click="previewImg" :src="$store.state.audioAlbum" alt="" :onerror="defaultImg">
        <div class="audioBox">
          <span>{{$store.state.audioTitle}}</span>
          <audio style="outline: none;" :src="$store.state.audioSrc" controls="controls" autoplay ></audio>
        </div>
        <span @click="closeAudioDialog" class="closeBtn">
          <i class="el-icon-close"></i>
        </span>
      </div>
    </transition>
  </div>
</template>
<script>
import { loginOutSys } from '@/api/login.js';
import ImagePreviewer from '@/components/myPreview.vue';
export default {
  components: {
    ImagePreviewer
  },
  data() {
    return {
      imgPreviewConfig: { // 图片预览组件配置
        imageKeys: [], //  图片链接数组 / 必传
        currentIndex: 0, // 图片预览的当前索引号 / 可不传
        imageContent: [] // 图片对应标题的数组 / 可不传
      }
    }
  },
  computed: {
    localtime() {
      console.log(new Date())
      // return this.$moment().utc().format('YYYY年MM月DD日 hh:mm:ss') + ' ' + this.$moment().utc().format('dddd')
      return this.$moment().format('YYYY年MM月DD日 hh:mm:ss')
    }
  },
  created() {
    if (!this.$store.state.token) {
      this.$store.commit('refreshUserMessage')
    }
  },
  methods: {
    // 退出登录
    logout() {
      this.$confirm('确认退出当前账号', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        loginOutSys().then(res => {
          if (res.success) {
            this.$store.commit('removeLoginInfo')
          }
        }).catch(err => console.log(err))
      }).catch(() => {
        this.message({
          type: 'info',
          message: '已取消退出'
        })
      })
    },
    previewImg() {
      this.imgPreviewConfig.imageKeys = [this.$store.state.audioAlbum]
      this.imgPreviewConfig.imageContent = [this.$store.state.audioTitle]
      this.imgPreviewConfig.currentIndex = 0
      this.$store.commit('previewImg', this.imgPreviewConfig)
    },
    // 监听图片预览组件的传值 关闭图片预览
    closePreview(flag) {
      this.$store.commit('closeImgPreview', flag)
    }
  }
}
</script>
<style lang='less' scoped>
.right_container {
  width: 100%;
}
.el-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #9ec8d8;
}
.el-main{
  margin: 10px;
  border-radius: 5px;
  background: url('~@/assets/image/index.jpeg') no-repeat center;
  background-size: cover;
}
.transition-box {
  position: relative;
  height: 60px;
  padding-left: 100px;
  background-color: #f1f3f4;
  display: flex;
  align-items: center;
  overflow: hidden;
  .audioImage {
    width: 55px;
    height: 55px;
    cursor: pointer;
  }
  .audioBox {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin-left: 50px;
    padding-top: 10px;
    font-size: 14px;
    overflow: hidden;
    span {
      padding-left: 40px;
    };
  }
  .closeBtn {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 30px;
    color: #999;
    cursor: pointer;
  }
}
/deep/.el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>