<template>
  <el-container class="home-container">
    <el-aside width="200px">
      <div class="logo">
        <!-- 系统logo -->
      </div>

      <!-- 数据维护列表 -->
      <ul class="root_list">
        <li :class="[currentRoot === 'index' ? 'currentRoot' : '']" @click="checkRootTable('index')">首页</li>
        <li :class="[currentRoot === item.rootRouter ? 'currentRoot' : '']" 
          :key="item.id" @click="checkRootTable(item.rootRouter)" v-for="item in rootList">
          {{item.rootName}}
        </li>
      </ul>
    </el-aside>
    <el-container>
      <right-container></right-container>
    </el-container>
  </el-container>
</template>
<script>
import rightContainer from '@/views/layout'
import { systemInit } from '@/api/login.js'
export default {
  components: {
    rightContainer
  },
  data() {
    return {
      rootList: [],
      currentRoot: 'index'
    }
  },
  mounted() {
    this.currentRoot = this.$route.path.split('/')[1]
    this.pageInit()
  },
  methods: {
    pageInit() {
      const id = this.$store.getters.userId
      systemInit(id).then(res => {
        if (res.success) {
          this.rootList = res.data.rootList
          this.$store.commit('saveUserRootList', res.data.rootList)
        }
      }).catch(err => console.log(err))
    },
    checkRootTable(rootRouter) {
      this.currentRoot = rootRouter
      this.$router.push('/' + this.currentRoot)
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-aside{
  background-color: #b3c8c9;
}
.logo{
  width: 150px;
  height: 150px;
  margin: 10px auto;
  background: url('~@/assets/image/avatar.jpeg') no-repeat center;
  background-size: cover;
  border-radius: 50%;
}
.root_list {
  margin-top: 50px;
  // background-color: #82a4a6;
  li {
    height: 40px;
    line-height: 40px;
    color: #eee;
    text-align: center;
    cursor: pointer;
    &:hover {
      background-color: #82a4a6;
    }
  }
  .currentRoot {
    background-color: #89a8aa;
  }
}
</style>