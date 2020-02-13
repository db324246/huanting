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

      <!-- <el-dialog
        :title="$store.state.audioTitle"
        :visible.sync="$store.state.audioDialog"
        width="680px"
        :before-close="closeAudioDialog">
        <audio style="margin-left: 50px;" :src="$store.state.audioSrc" controls="controls" autoplay ></audio>
      </el-dialog> -->
    </el-header>
    <el-main :style="{'height': $store.state.audioDialog ? 'calc(100vh - 140px)': 'calc(100vh - 80px)'}">
      <el-scrollbar style="height: 100%;">
        <router-view></router-view>
      </el-scrollbar>
    </el-main>

    <transition name="el-zoom-in-bottom">
      <div v-show="audioDialog" class="transition-box">
        <audio style="margin-left: 50px;" :src="$store.state.audioSrc" controls="controls" autoplay ></audio>
      </div>
    </transition>
  </div>
</template>
<script>
import { loginOutSys } from '@/api/login.js';
export default {
  data() {
    return {}
  },
  computed: {
    localtime() {
      console.log(new Date())
      return this.$moment().utc().format('YYYY年MM月DD日 hh:mm:ss') + ' ' + this.$moment().utc().format('dddd')
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
/deep/.el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>