<template>
  <div>
    <div class="btn_nav">
      <el-button size="mini" type="warning" @click="refreshList">！刷新今日推荐</el-button>
      <span>每日精选15首歌曲</span>
    </div>
    <el-table
      ref="musicTable"
      :data="musicList"
      style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        property="title"
        label="名称">
      </el-table-column>
      <el-table-column
        property="singerName"
        label="歌手">
      </el-table-column>
      <el-table-column
        property="album"
        label="专辑">
      </el-table-column>
    </el-table>
    
  </div>
</template>
<script>
import { recommendList, refreshCommend } from '@/api/login.js';
export default {
  data() {
    return {
      musicList: []
    }
  },
  created() {
    this.getMusicList()
  },
  methods: {
    // 获取今日推荐列表
    getMusicList() {
      recommendList().then(res => {
        if (res.success) {
          this.musicList = res.data
        }
      }).catch(err => console.log(err))
    },
    // 刷新今日推荐
    refreshList() {
      refreshCommend().then(res => {
        if (res.success) {
          this.$message.success('刷新成功')
          this.getMusicList()
        }
      }).catch(err => console.log(err))
    }
  }
}
</script>
<style lang='less' scoped>
.btn_nav {
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  padding-left: 15px;
  span {
    margin-left: 10px;
    font-size: 14px;
    color: #365f89;
  }
}
</style>