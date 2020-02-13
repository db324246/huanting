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
    // 用户禁用
    handleDisabled(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDisabledUsers()
    },
    // 表格多选
    selectionChange(selection) {
      const length = selection.length
      if (selection.length !== 0) {
        const disabled = selection[0].disabled
        const disabledLength = selection.filters(item => item.disabled === disabled)
      }
      this.ids = selection.map(item => item.id)
    },
    // 批量禁用
    batchDisabledUsers() {
      if (this.ids.length === 0) return this.$message.error('请选择需要禁用的用户')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchDeletAdmin({ ids }).then(res => {
          if (res.success) {
            if (deleteCurrentUserFlag) {
              this.$message.success('删除成功, 请重新登录')
              this.$store.commit('removeLoginInfo')
            } else {
              this.$message.success('删除成功')
              this.ids = []
              this.getAdminList()
            }
          }
        }).catch(err => console.log(err))
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      return false
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