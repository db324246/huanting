<template>
  <div>
    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="btn_group">
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDisabledUsers"> 批量禁用 </el-button>
      </div>
      <div class="search_box">
        <el-input placeholder="请输入姓名" size="mini" @keydown.native.enter="getUsersList" v-model="queryList.name">
        </el-input>
        <el-button type="primary" size="mini" @click="getUsersList">搜索</el-button>
      </div>
    </div>

    <!-- 管理员列表 -->
    <el-table
      :data="userList"
      style="width: 100%"
      ref="userTable"
      v-loading="loading"
      @selection-change='selectionChange'>
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
        <template slot-scope="scope">
          {{ scope.row.sex | returnSex }}
        </template>
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

    <!-- 分页模块 -->
    <div class="paginationBox">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryList.pageNumber"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryList.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import { userList } from '@/api/user.js';
export default {
  data() {
    return {
      loading: true,
      queryList: {
        name: '',
        pageSize: 10,
        pageNumber: 1
      },
      userList: []
    }
  },
  filters: {
    returnSex(val) {
      const sex = {
        0: '男',
        1: '女'
      }
      return sex[val]
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    getUsersList() {
      this.loading = true
      userList(this.queryList).then(res => {
        if (res.success) {
          this.userList = res.data.records
          this.total = res.data.total
          this.loading = false
        }
      }).catch(err => console.log(err))
    },
    handleDisabled(id) {
      this.ids = []
      this.ids.push(id)
    },
    selectionChange(selection) {
      this.ids = selection.map(item => item.id)
    },
    batchDisabledUsers() {

    },
    // 分页模块
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getUsersList()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getUsersList()
    }
  }
}
</script>
<style lang='less' scoped>

</style>