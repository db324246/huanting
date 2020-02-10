<template>
  <div class="el-container">
    <!-- 左侧列表 -->
    <aside class="el-aside" style="width: 200px;">
      <ul class="cate_list">
        <li :class="['cate_item', currentId === item.id ? 'currentItem' : '']" :key="item.id" v-for="item in categories" @click="currentId = item.id">
          <i class="el-icon-arrow-right"></i>{{item.title}}
        </li>
      </ul>
    </aside>

    <main class="el-main">
      <el-scrollbar style="height: 100%;">
        <!-- 操作栏 -->
        <div class="ctr_row">
          <div class="btn_group">
            <el-button icon="el-icon-plus" size="mini" type='primary' @click="dialogVisible = true">新增</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDeletCate"> 批量删除 </el-button>
          </div>
          <div class="search_box">
            <el-input placeholder="请输入分类名称" size="mini" @keydown.native.enter="getCateList" v-model="queryList.title">
            </el-input>
            <el-button type="primary" size="mini" @click="getCateList">搜索</el-button>
          </div>
        </div>

        <!-- 分类列表 -->
        <el-table
          :data="categoryTableList"
          style="width: 100%"
          v-loading="loading"
          @selection-change='selectionChange'>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="title"
            label="名称">
            <template slot-scope="scope">
              <span class="table_title" @click="checkDetail(scope.row)">{{scope.row.title}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="describtion"
            label="描述">
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="checkDetail(scope.row)">查看详情</el-button>
              <el-button
                size="mini"
                type="primary"
                @click="handleEdit(scope.row)">编辑</el-button>
              <el-button
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

        <!-- 分类新增、编辑对话框 -->
        <el-dialog
          title="新增歌曲分类"
          :visible.sync="dialogVisible"
          width="680px"
          :before-close="handleClose">
          <el-form style="padding-right: 50px;" ref="cateForm" :rules="rules" :model="cateForm" label-width="80px">
            <el-form-item label="名称" prop="title">
              <el-input v-model="cateForm.title"></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="describtion">
              <el-input v-model="cateForm.describtion"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" style="padding-right: 50px;">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="saveForm">确 定</el-button>
          </span>
        </el-dialog>
      </el-scrollbar>
    </main>
  </div>
</template>
<script>
import { getCategories, categoryList, addCategory, updataCategory, deleteCategory } from '@/api/category.js';
export default {
  data() {
    return {
      loading: true,
      categories: [],
      categoryTableList: [],
      currentId: undefined,
      queryList: {
        pageSize: 10,
        pageNumber: 1,
        title: '',
        cateId: undefined
      },
      total: 0,
      ids: [],
      dialogVisible: false,
      editFlag: false,
      cateForm: {
        title: '',
        describtion: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    currentId(val) {
      this.queryList.cateId = val
      this.getCateList()
    }
  },
  created() {
    this.getcategoriesFunc()
  },
  methods: {
    // 获取有一级分类
    getcategoriesFunc() {
      getCategories().then(res => {
        if (res.success) {
          this.categories = res.data
          const cate = JSON.parse(sessionStorage.getItem('category'))

          if (cate) this.currentId = cate.categoryId
          else this.currentId = res.data[0].id
          sessionStorage.removeItem('category')
        }
      }).catch(err => console.log(err))
    },
    // 获取二级分类列表
    getCateList() {
      this.loading = true
      categoryList(this.queryList).then(res => {
        if (res.success) {
          this.categoryTableList = res.data.records
          this.total = res.data.total
          this.loading = false
        }
      }).catch(err => console.log(err))
    },
    // 分类编辑
    handleEdit(row) {
      this.cateForm = Object.assign({}, this.cateForm, row)
      this.dialogVisible = true
      this.editFlag = true
    },
    // 对话框保存操作
    saveForm() {
      this.$refs.cateForm.validate(valide => {
        if (valide) {
          const queryForm = Object.assign({}, this.cateForm)
          queryForm.cateId = this.currentId

          if (!queryForm.describtion) queryForm.describtion = `精选${queryForm.title}歌曲`

          if (this.editFlag) this.updateCategory(queryForm)
          else {
            this.addCategory(queryForm)
          }
        }
      })
    },
    // 新建分类
    addCategory(queryForm) {
      addCategory(queryForm).then(res => {
        if (res.success) {
          this.$message.success('新增成功')
          this.getCateList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 分类更新
    updateCategory(queryForm) {
      updataCategory(queryForm).then(res => {
        if (res.success) {
          this.$message.success('编辑成功')
          this.editFlag = false
          this.getCateList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 分类删除
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletCate()
    },
    // 表格多选
    selectionChange(selection) {
      this.ids = []
      selection.forEach(e => {
        this.ids.push(e.id)
      })
    },
    // 批量删除
    batchDeletCate() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的分类')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCategory({ ids: this.ids }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getCateList()
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
    // 控制弹窗隐藏
    handleClose() {
      this.dialogVisible = false
      this.cateForm = {
        title: '',
        describtion: ''
      }
      this.$refs.cateForm.clearValidate()
    },
    // 查看分类音乐
    checkDetail(row) {
      row.categoryId = this.currentId
      row.category = this.categories.filter(item => item.id === this.currentId)[0].title
      sessionStorage.setItem('category', JSON.stringify(row))
      this.$router.push({
        path: '/categoryMusic'
      })
    },
    // 分页模块
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getCateList()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getCateList()
    }
  }
}
</script>
<style lang='less' scoped>
.el-aside {
  margin-right: 10px;
  border-right: 1px solid #ebeef5;
}
.el-main {
  height: calc(100vh - 120px);
  padding: 0;
}
.cate_list {
  padding-right: 20px;
}
.cate_item {
  height: 40px;
  line-height: 40px;
  padding-left: 5px;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
  color: #12729a;
  cursor: pointer;
  &:hover {
    color: #45abd5;
  }
}
.currentItem {
  padding-left: 15px;
  color: #ebf5ff;
}
</style>