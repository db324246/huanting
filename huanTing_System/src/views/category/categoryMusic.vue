<template>
  <div>
    <!-- 头部导航 -->
    <div class="top_nav">
      <div class="back_btn">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="bread_nav">
        <span>{{ cate.category }}</span>
        <i class="el-icon-arrow-right"></i>
        <span>{{ cate.title }}</span>
        <span class="desc_box">{{ cate.describtion }}</span>
      </div>
      <div class="btn_group">
        <el-button icon="el-icon-plus" size="mini" type='primary' @click="showAddDialog">新增</el-button>
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchRemove"> 批量移除 </el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <el-table
      :data="cateMusicList"
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
      </el-table-column>
      <el-table-column
        prop="singerName"
        label="歌手">
      </el-table-column>
      <el-table-column
        prop="album"
        label="专辑">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row.musicId)">移除</el-button>
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

    <!-- 歌曲新增对话框 -->
    <el-dialog
      title="新增歌曲"
      :visible.sync="dialogVisible"
      width="680px"
      :before-close="handleClose">
      <!-- 操作栏 -->
      <div class="ctr_row">
        <div class="btn_group">
          <el-button size="mini" type="primary" @click="addMusicFunc">确 定</el-button>
          <el-button size="mini" @click="handleClose">取 消</el-button>
        </div>
        <div class="search_box">
          <el-input placeholder="请输入歌曲名称" size="mini" @keydown.native.enter="showAddDialog" v-model="queryMusicList.name">
          </el-input>
          <el-button type="primary" size="mini" @click="showAddDialog">搜索</el-button>
        </div>
      </div>
      <el-table
        :data="musicList"
        border
        @selection-change='musciSelectionChange'>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="title"
          label="名称">
        </el-table-column>
        <el-table-column
          prop="singerName"
          label="歌手">
        </el-table-column>
        <el-table-column
          prop="album"
          label="专辑">
        </el-table-column>
      </el-table>

      <div class="paginationBox">
        <el-pagination
          @current-change="handleMusicCurrent"
          :current-page="queryMusicList.pageNumber"
          :page-size="queryMusicList.pageSize"
          layout="prev, pager, next"
          :total="musicTotal">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { cateMusicList, addCateMusic, removeCateMusic } from '@/api/category.js';
import { musicTable } from '@/api/music.js';
export default {
  data() {
    return {
      loading: true,
      cate: {},
      queryList: {
        scateId: undefined,
        pageSize: 10,
        pageNumber: 1
      },
      cateMusicList: [],
      total: 0,
      ids: [],
      dialogVisible: false,
      queryMusicList: {
        title: '',
        pageSize: 10,
        pageNumber: 1
      },
      musicList: [],
      musicTotal: 0,
      musicIds: []
    }
  },
  created() {
    this.cate = JSON.parse(sessionStorage.getItem('category')) || {}
    this.queryList.scateId = this.cate.id
    this.getMusicList()
  },
  methods: {
    // 获取分类音乐列表
    getMusicList() {
      this.loading = true
      cateMusicList(this.queryList).then(res => {
        if (res.success) {
          this.cateMusicList = res.data.musicList
          this.total = res.data.total
          this.loading = false
        }
      }).catch(err => console.log(err))
    },
    // 弹出音乐新增对话框
    showAddDialog() {
      musicTable(this.queryMusicList).then(res => {
        if (res.success) {
          this.musicTotal = res.data.total
          this.musicList = res.data.records
          this.dialogVisible = true
        }
      }).catch(err => console.log(err))
    },
    // 新增歌曲多选
    musciSelectionChange(selection) {
      this.musicIds = []
      selection.forEach(e => {
        this.musicIds.push(e.id)
      })
    },
    // 移除歌曲
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchRemove()
    },
    // 表格多选
    selectionChange(selection) {
      this.ids = []
      selection.forEach(e => {
        this.ids.push(e.musicId)
      })
    },
    // 批量移除
    batchRemove() {
      if (this.ids.length === 0) return this.$message.error('请选择移除的歌曲')

      this.$confirm('确认移除歌曲?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const queryObj = {
          scateId: this.cate.id,
          musicIds: this.ids
        }

        removeCateMusic(queryObj).then(res => {
          if (res.success) {
            this.$message.success('移除成功')
            this.getMusicList()
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
    // 分类新增歌曲
    addMusicFunc() {
      const queryObj = {
        scateId: this.cate.id,
        musicIds: this.musicIds
      }

      addCateMusic(queryObj).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getMusicList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.musicIds = []
    },
    // 分页功能
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getMusicList()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getMusicList()
    },
    handleMusicCurrent(val) {
      this.queryMusicList.pageNumber = val
      this.showAddDialog()
    }
  }
}
</script>
<style lang='less' scoped>
.top_nav {
  padding-left: 10px;
  padding-bottom: 10px;
  /* margin-bottom: 5px; */
  border-bottom: 1px solid #eee;
}
.bread_nav {
  padding-left: 20px;
  color: #625d5d;
  .desc_box {
    margin-left: 10px;
    font-size: 12px;
    color: #817777;
  }
}
</style>