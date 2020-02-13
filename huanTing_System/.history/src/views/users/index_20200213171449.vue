<template>
  <!-- 首页展示 -->
  <div v-if="$route.path === '/index'" class="index_tips">
    欢迎进入幻听音乐管理系统
  </div>
  <!-- 用户管理 -->
  <div v-else-if="$route.path === '/userManage'" >
    <div class="nav_top">
        <el-button-group>
          <el-button size="mini" :type="userFlag ? '' : 'primary'" @click="changePage(false)">管理员</el-button>
          <el-button size="mini" :type="userFlag ? 'primary' : ''" @click="changePage(true)">用户管理</el-button>
        </el-button-group>
    </div>

    <div v-if="!userFlag">
      <!-- 操作栏 -->
      <div class="ctr_row">
        <div class="btn_group">
          <el-button icon="el-icon-plus" size="mini" type='primary' @click="dialogVisible = true">新增</el-button>
          <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDeletUsers"> 批量删除 </el-button>
        </div>
        <div class="search_box">
          <el-input placeholder="请输入姓名" size="mini" @keydown.native.enter="getAdminList" v-model="queryList.userName">
          </el-input>
          <el-button type="primary" size="mini" @click="getAdminList">搜索</el-button>
        </div>
      </div>

      <!-- 管理员列表 -->
      <el-table
        :data="userList"
        style="width: 100%"
        ref="userTable"
        row-key="id"
        v-loading="loading"
        :expand-row-keys="expandRows"
        @selection-change='selectionChange'
        @expand-change="recordExpandRows">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column type="expand" width="1">
          <template slot-scope="scope">
            <div class="expandBox">
              <el-tag 
                :key="item.id" 
                v-for="item in scope.row.rootList" 
                :closable="scope.row.identity_id === '2'" 
                @close='handleTagClose(scope.row.id,item.id)' 
                type="success">
                {{item.root_name}}
              </el-tag>
              <el-button v-if="$store.getters.userIdentityId === '1' && scope.row.identity_id === '2'" @click="showBindRootDialog(scope.row)" size="small">添加权限</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="姓名">
          <template slot-scope="scope">
            <span @click="expandRootList(scope.row)" class="table_title">{{scope.row.userName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="nickName"
          label="登录名">
        </el-table-column>
        <el-table-column
          prop="identityName"
          label="身份">
        </el-table-column>
        <el-table-column
          prop="phoneNumber"
          label="手机号">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.id === $store.getters.userId"
              size="mini"
              type="primary"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.id === $store.getters.userId || $store.getters.userIdentityId === '1' && scope.row.identity_id !== '1'"
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.id)">删除</el-button>
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

      <!-- 用户新增、编辑对话框 -->
      <el-dialog
        title="新增管理员"
        :visible.sync="dialogVisible"
        width="680px"
        :before-close="handleClose">
        <el-form style="padding-right: 50px;" ref="userForm" :rules="rules" :model="userForm" label-width="80px">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="userForm.userName"></el-input>
          </el-form-item>
          <el-form-item label="登录名" prop="nickName">
            <el-input v-model="userForm.nickName"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userForm.password"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="phoneNumber">
            <el-input v-model.number="userForm.phoneNumber" type="tel"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" style="padding-right: 50px;">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="saveForm">确 定</el-button>
        </span>
      </el-dialog>

      
      <el-dialog
        title="管理员权限管理"
        :visible.sync="rootDialogVisible"
        width="500px"
        :before-close="handleCloseRoot">
        <el-select v-model="bindForm.rootIds" multiple placeholder="请选择">
          <el-option
            v-for="item in rootOptions"
            :key="item.id"
            :label="item.root_name"
            :value="item.id">
          </el-option>
        </el-select>
        <span slot="footer" style="padding-right: 50px;">
          <el-button @click="handleCloseRoot">取 消</el-button>
          <el-button type="primary" @click="confirmBind">确 定</el-button>
        </span>
      </el-dialog>
    </div>

    <users v-else></users>
  </div>
</template>
<script>
import { userManageTable, addAdministrator, batchDeletAdmin, updateAdministrator, rootList, deleteUserRoot, addUserRoot } from '@/api/user.js';
import { validateIdCode, validatePassword, validatePhone } from '@utils/valide.js';
import users from './users'
export default {
  components: {
    users
  },
  data() {
    return {
      userFlag: false,
      loading: true,
      userList: [],
      rootList: [],
      expandRows: [], // 存储表格展开行
      queryList: {
        pageNumber: 1,
        pageSize: 10,
        userName: ''
      },
      total: 0,
      dialogVisible: false, // 管理员对话框
      rootDialogVisible: false, // 权限对话框
      editFlag: false,
      ids: [], // 批量删除id
      userForm: { // 管理员新建
        userName: '',
        nickName: '',
        password: '',
        phoneNumber: ''
      },
      rootOptions: [],
      bindForm: {
        userId: '',
        rootIds: []
      },
      rules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '请输入3 ~ 5个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { validator: validateIdCode, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        phoneNumber: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    '$route.path': {
      handler(val) {
        if (val === '/userManage') {
          this.getAdminList()
          this.getRootList()
        }
      },
      immediate: true
    }
  },
  created() {
    const flag = sessionStorage.getItem('userFlag')

    if (flag) this.userFlag = flag
    else this.userFlag = false
  },
  methods: {
    changePage(flag) {
      sessionStorage.setItem('userFlag', flag)
      this.userFlag = flag
    },
    // 获取管理员列表
    getAdminList() {
      this.loading = true
      userManageTable(this.queryList).then(res => {
        if (res.success) {
          this.userList = res.data.records
          this.total = res.data.total
          setTimeout(() => {
            this.loading = false
          });
        }
      }).catch(err => {
        console.log(err);
      })
    },
    // 获取权限列表
    getRootList() {
      rootList().then(res => {
        if (res.success) {
          this.rootList = res.data
        }
      }).catch(err => console.log(err))
    },
    // 管理员表单保存
    saveForm() {
      this.$refs.userForm.validate(valide => {
        if (valide) {
          if (this.editFlag) this.updateUser()
          else this.addUser()
        }
      })
    },
    // 新增管理员
    addUser() {
      addAdministrator(this.userForm).then(res => {
        if (res.success) {
          this.$message.success('管理员新增成功')
          this.getAdminList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 编辑管理员
    handleEdit(row) {
      this.userForm = Object.assign({}, this.userForm, row)
      this.dialogVisible = true
      this.editFlag = true
    },
    // 更新管理员
    updateUser() {
      updateAdministrator(this.userForm).then(res => {
        if (res.success) {
          this.$message.success('管理员更新成功')
          this.editFlag = false
          this.getAdminList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 批量删除管理员
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletUsers()
    },
    batchDeletUsers() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的用户')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deleteCurrentUserFlag = this.ids.some(item => item === this.$store.getters.userId)
        const ids = this.ids.join(',')

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
      this.getAdminList()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getAdminList()
    },
    // 关闭管理员对话框
    handleClose() {
      this.dialogVisible = false
      this.userForm = {
        userName: '',
        nickName: '',
        password: '',
        phoneNumber: ''
      }
      this.$refs.userForm.clearValidate()
    },
    // 关闭权限对话框
    handleCloseRoot() {
      this.rootDialogVisible = false
      this.rootOptions = []
      this.bindForm = {
        userId: '',
        rootIds: []
      }
    },
    // 列表多选功能
    selectionChange(selection) {
      this.ids = []
      let msg = false
      selection.forEach(e => {
        if (e.identity_id === '1' && e.identity_id !== this.$store.getters.userIdentity) {
          msg = true
          this.$refs.userTable.toggleRowSelection(e, false)
        } else {
          this.ids.push(e.id)
        }
      })

      if (msg) this.$message.error('禁止删除超级管理员')
    },
    // 记录表格展开行
    recordExpandRows(row, expandRows) {
      this.expandRows = expandRows.map(item => item.id)
    },
    // 展开用户权限列表
    expandRootList(row) {
      this.$refs.userTable.toggleRowExpansion(row)
    },
    // 弹出权限绑定对话框
    showBindRootDialog(row) {
      this.bindForm.userId = row.id
      const userRootList = row.rootList

      this.rootList.forEach(item => {
        const flag = userRootList.some(rootItem => rootItem.id === item.id)

        if (!flag) {
          this.rootOptions.push(item)
        }
      })

      this.rootDialogVisible = true
    },
    // 确认绑定用户权限
    confirmBind() {
      addUserRoot(this.bindForm).then(res => {
        if (res.success) {
          this.$message.success('绑定成功')
          this.getAdminList()
          this.handleCloseRoot()
        }
      }).catch(err => console.log(err))
    },
    // 控制tag关闭tag
    handleTagClose(userId, rootId) {
      deleteUserRoot({ userId, rootId }).then(res => {
        if (res.success) {
          this.$message.success('删除成功')
          this.getAdminList()
        }
      }).catch(err => console.log(err))
    }
  }

}
</script>
<style lang='less' scoped>
.nav_top {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 10px;
  border-bottom: 1px solid #ccc;
}
.index_tips {
  margin-top: 40px;
  font-size: 28px;
  color: #eee;
  text-align: center;
}
.el-row {
  margin: 0 10px 10px;
}
.expandBox {
  .el-tag {
    margin: 0 10px 10px;
  }
}
</style>
<style scoped>
.el-table>>>.el-table__expand-column {
  overflow: hidden;
}
</style>