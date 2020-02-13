<template>
  <div>
    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="btn_group">
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDisabledUsers"> 批量禁用 </el-button>
      </div>
      <div class="search_box">
        <el-input placeholder="请输入姓名" size="mini" @keydown.native.enter="getUsersList" v-model="queryList.userName">
        </el-input>
        <el-button type="primary" size="mini" @click="getUsersList">搜索</el-button>
      </div>
    </div>

    <!-- 管理员列表 -->
    <el-table
      :data="userList"
      style="width: 100%"
      ref="userTable"
      row-key="id"
      v-loading="loading">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="loginName"
        label="登录名">
      </el-table-column>
      <el-table-column
        prop="sex"
        label="性别">
      </el-table-column>
      <el-table-column
        prop="age"
        label="年龄">
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="手机号">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDisabled(scope.row.id)">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { userList } from '@/api/user.js';
export default {
  data() {
    return {
      queryList: {
        name: '',
        pageSize: 10,
        pageNumber: 1
      }
    }
  },
  methods: {
    getUsersList() {
      userList(this.queryList).then(res => {
        if (res.success) {
          this.userList = res.data.userList
          this.total = res.data.total
        }
      }).catch(err => console.log(err))
    },
    handleDisabled(id) {

    },
    batchDisabledUsers() {

    }
  }
}
</script>
<style lang='less' scoped>

</style>