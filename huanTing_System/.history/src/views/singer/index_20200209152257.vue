<template>
  <div class="el-container">
    <!-- 左侧列表 -->
    <aside class="el-aside" style="width: 200px;">
      <ul class="cate_list">
        <li :class="['cate_item', currentId === '' ? 'currentItem' : '']" @click="currentId = ''">
          <i class="el-icon-arrow-right"></i>全部歌手
        </li>
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
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDeletsinger"> 批量删除 </el-button>
          </div>
          <div class="search_box">
            <el-input placeholder="请输入歌手名称" size="mini" @keydown.native.enter="getSingerList" v-model="queryList.name">
            </el-input>
            <el-button type="primary" size="mini" @click="getSingerList">搜索</el-button>
          </div>
        </div>

        <!-- 歌手列表 -->
        <el-table
          :data="singerList"
          style="width: 100%"
          @selection-change='selectionChange'>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名">
            <template slot-scope="scope">
              <span @click="checkDetail(scope.row)" class="table_title">{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="describtion"
            label="描述">
          </el-table-column>
          <el-table-column
            prop="imageSrc"
            label="照片">
            <template slot-scope="scope">
              <img :src="scope.row.imageSrc" alt="" class="table_img" :onerror="defaultImg">
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300">
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

        <!-- 歌手新增、编辑对话框 -->
        <el-dialog
          title="新增歌手"
          :visible.sync="dialogVisible"
          width="680px"
          :before-close="handleClose">
          <el-form style="padding-right: 50px;" ref="singerForm" :rules="rules" :model="singerForm" label-width="80px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="singerForm.name"></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="describtion">
              <el-input v-model="singerForm.describtion"></el-input>
            </el-form-item>
            <el-form-item label="照片" prop="imageSrc">
              <img class="table_img" :src="singerForm.imageSrc" alt="" :onerror="defaultImg">
              <el-upload
                class="upload-demo"
                :action="uploadApi"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleImgSuccess"
                :before-upload="beforeImgUpload">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传图片，大小不超过3M</div>
              </el-upload>
            </el-form-item>
            <el-form-item label="分类" prop="cateId">
              <el-select v-model="singerForm.cateId" placeholder="请选择">
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id">
                </el-option>
              </el-select>
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
import { singerCateList, singerTable, deleteSinger, addSinger, updataSinger } from '@/api/singer.js';

export default {
  data() {
    return {
      categories: [],
      currentId: undefined,
      singerList: [],
      queryList: {
        pageSize: 10,
        pageNumber: 1,
        name: '',
        cateId: undefined
      },
      total: 0,
      dialogVisible: false,
      editFlag: false,
      singerForm: {
        name: '',
        describtion: '',
        imageSrc: '',
        cateId: undefined
      },
      rules: {
        name: [
          { required: true, message: '请输入歌手名称', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  watch: {
    currentId(val) {
      this.queryList.cateId = val
      this.getSingerList()
      if (val) {
        this.singerForm.cateId = val
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取歌手分类列表
    getCateList() {
      singerCateList().then(res => {
        if (res.success) {
          this.categories = res.data
          const singerCateId = +sessionStorage.getItem('singerCate')
          if (singerCateId) {
            this.currentId = singerCateId
            sessionStorage.removeItem('singerCate')
          } else this.currentId = ''
        }
      }).catch(err => console.log(err))
    },
    // 获取全部歌手列表
    getSingerList() {
      singerTable(this.queryList).then(res => {
        this.singerList = res.data.records;
        this.total = res.data.total
      }).catch(err => {
        console.log(err);
      })
    },
    // 查看歌手详情
    checkDetail(row) {
      sessionStorage.setItem('singerCate', this.currentId);
      this.$router.push({
        path: 'singerDetail',
        query: {
          singerId: row.id
        }
      })
    },
    // 图片上传成功
    handleImgSuccess(res) {
      if (res.success) {
        this.$message.success('上传成功')
        this.singerForm.imageSrc = res.data.url
      }
    },
    // 保存编辑或新增表单
    saveForm() {
      this.$refs.singerForm.validate(valide => {
        if (valide) {
          if (this.editFlag) this.updateSinger()
          else {
            this.addSinger()
          }
        }
      })
    },
    // 更新歌手信息
    updateSinger() {
      const singerForm = Object.assign({}, this.singerForm)
      if (!this.singerForm.describtion) {
        singerForm.describtion = '新生代歌手'
      }
      updataSinger(singerForm).then(res => {
        if (res.success) {
          this.$message.success('编辑成功')
          this.getSingerList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 添加歌手信息
    addSinger() {
      const singerForm = Object.assign({}, this.singerForm)
      if (!this.singerForm.describtion) {
        singerForm.describtion = '新生代歌手'
      }
      addSinger(singerForm).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getSingerList()
          this.handleClose()
        }
      }).catch(err => console.log(err)
      )
    },
    // 批量删除歌手信息
    batchDeletsinger() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的歌手')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSinger({ ids: this.ids }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getSingerList()
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
      this.editFlag = false
      this.singerForm = {
        name: '',
        describtion: '',
        imageSrc: '',
        cateId: undefined
      }
      this.$refs.singerForm.clearValidate()
    },
    // 控制当前页大小
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getSingerList()
    },
    // 控制当前页
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getSingerList()
    },
    // 控制编辑按钮
    handleEdit(row) {
      this.singerForm = Object.assign({}, this.singerForm, row)
      if (!this.singerForm.cateId) this.singerForm.cateId = this.currentId
      this.dialogVisible = true
      this.editFlag = true
    },
    // 控制删除页面
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletsinger()
    },
    // 多选框
    selectionChange(selection) {
      this.ids = []
      selection.forEach(e => {
        this.ids.push(e.id)
      })
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