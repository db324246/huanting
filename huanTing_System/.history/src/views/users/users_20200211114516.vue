<template>
  <div>
    <div class="ctr_row">
        <div class="btn_group">
          <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDisabledUsers"> 批量禁用 </el-button>
        </div>
        <div class="search_box">
          <el-input placeholder="请输入姓名" size="mini" @keydown.native.enter="getAdminList" v-model="queryList.userName">
          </el-input>
          <el-button type="primary" size="mini" @click="getAdminList">搜索</el-button>
        </div>
      </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  }
}
</script>
<style lang='less' scoped>

</style>