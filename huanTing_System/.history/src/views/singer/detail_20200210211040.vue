<template>
  <div>
    <!-- 头部导航 -->
    <div class="top_nav">
      <div class="back_btn">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="goback">返回</el-button>
      </div>
    </div>

    <!-- 歌手信息栏 -->
    <div class="dl_title">
      歌手信息
    </div>
    <div class="detal_message">
      <div class="imgBox">
        <img :src="singer.imageSrc" alt="" :onerror="defaultImg">
      </div>
      <div class="msgBox">
        <h3>{{singer.singerName}}</h3>
        <p>{{singer.describtion}}</p>
      </div>
    </div>
    <div class="dl_title">
      专辑列表
    </div>

    <!-- 操作栏 -->
    <div class="ctr_row">
      <div></div>
      <div class="btn_group">
        <el-button icon="el-icon-plus" size="mini" type='primary' @click="dialogVisible = true">新增专辑</el-button>
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchRemove"> 批量删除 </el-button>
      </div>
    </div>

    <!-- 专辑列表 -->
    <el-table
      :data="singer.albumList"
      style="width: 100%"
      v-loading="loading"
      @selection-change='selectionChange'>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="album"
        label="专辑名称">
      </el-table-column>
      <el-table-column
        prop="albumArt"
        label="专辑封面">
        <template slot-scope="scope">
          <img class="table_img" :src="scope.row.albumArt" alt="" :onerror="defaultImg">
        </template>
      </el-table-column>
      <el-table-column
        prop="albumDesc"
        label="专辑描述">
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showAddDialog(scope.row)">
            编辑
          </el-button>
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

    <!-- 专辑新增、编辑对话框 -->
    <el-dialog
      title="新增专辑"
      :visible.sync="dialogVisible"
      width="680px"
      :before-close="handleClose">
      <el-form style="padding-right: 50px;" ref="albumForm" :rules="rules" :model="albumForm" label-width="80px">
        <el-form-item label="专辑名称" prop="album">
          <el-input v-model="albumForm.album"></el-input>
        </el-form-item>
        <el-form-item label="专辑封面" prop="albumArt">
          <img class="table_img" :src="albumForm.albumArt" alt="" :onerror="defaultImg">
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
        <el-form-item label="专辑描述" prop="albumDesc">
          <el-input v-model="albumForm.albumDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="saveForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { singerDetail, addAlbum, updateAlbum, deleteAlbum } from '@/api/singer.js'
export default {
  data() {
    return {
      singerCateId: undefined,
      loading: true,
      queryList: {
        singerId: undefined,
        pageSize: 10,
        pageNumber: 1
      },
      singer: {},
      total: 0,
      dialogVisible: false,
      editFlag: false,
      albumForm: {
        singerId: undefined,
        album: '',
        albumArt: '',
        albumDesc: ''
      },
      rules: {
        album: [
          { required: true, message: '请输入专辑名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.singerCateId = sessionStorage.getItem('singerCate')
    if (!this.singerCateId && this.singerCateId !== '') {
      this.$router.push({
        path: '/singer'
      })
    }
    sessionStorage.removeItem('singerCate')
    this.queryList.singerId = +this.$route.query.singerId
    this.getSingerDetail()
  },
  methods: {
    goback() {
      sessionStorage.setItem('singerCate', this.singerCateId)
      this.$router.go(-1)
    },
    // 获取歌手详情
    getSingerDetail() {
      this.loading = true
      singerDetail(this.queryList).then(res => {
        if (res.success) {
          this.loading = false
          this.singer = res.data
          this.total = res.data.total
          this.albumForm.singerId = res.data.singerId
        }
      }).catch(err => console.log(err))
    },
    // 图片上传成功的回调
    handleImgSuccess(res) {
      if (res.success) {
        this.$message.success('上传成功')
        this.albumForm.albumArt = res.data.url
      }
    },
    // 保存添加或编辑表单
    saveForm() {
      this.$refs.albumForm.validate(valide => {
        if (valide) {
          this.albumForm.singerId = this.$route.query.singerId
          if (this.editFlag) this.updateAlbum()
          else {
            this.addAlbum()
          }
        }
      })
    },
    // 更新专辑
    updateAlbum() {
      updateAlbum(this.albumForm).then(res => {
        if (res.success) {
          this.$message.success('更新成功')
          this.getSingerDetail()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 新增专辑
    addAlbum() {
      addAlbum(this.albumForm).then(res => {
        if (res.success) {
          this.$message.success('新建成功')
          this.getSingerDetail()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 专辑删除
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchRemove()
    },
    // 多选框
    selectionChange(selection) {
      this.ids = []
      selection.forEach(e => {
        this.ids.push(e.id)
      })
    },
    // 批量删除
    batchRemove() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的专辑')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAlbum({ ids: this.ids }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getSingerDetail()
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
    // 弹出对话框
    showAddDialog(row) {
      this.albumForm = Object.assign({}, this.albumForm, row)
      this.editFlag = true
      this.dialogVisible = true
    },
    // 控制弹框关闭
    handleClose() {
      this.dialogVisible = false
      this.editFlag = false
      this.albumForm = {
        singerId: undefined,
        album: '',
        albumArt: '',
        albumDesc: ''
      }
      this.$refs.albumForm.clearValidate()
    },
    // 分页功能
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getSingerDetail()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getSingerDetail()
    }
  }
}
</script>
<style lang='less' scoped>
.top_nav {
  margin-bottom: 20px;
}
.detal_message {
  display: flex;
  padding: 0 50px;
  margin-bottom: 40px;
  .imgBox {
    width: 250px;
    margin-right: 20px;
    img {
      width: 100%;
    }
  }
  .msgBox {
    h3 {
      margin-bottom: 10px;
    }
    p {
      font-size: 14px;
    }
  }
}
</style>