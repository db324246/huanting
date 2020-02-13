<template>
  <div>
    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="btn_group">
        <el-button icon="el-icon-arrow-left" size="mini" type='primary' @click="$router.go(-1)">返回</el-button>
      </div>
    </div>

    <!-- 歌单详情 -->
    <div class="detail_box">
      <div class="dl_title">
        基本信息
      </div>
      <div class="detal_message">
        <div class="imgBox">
          <img :src="slDetail.slImage" @click="previewImg" alt="" :onerror="defaultImg">
        </div>
        <div class="msgBox">
          <h3>{{slDetail.slTitle}}</h3>
          <p>{{slDetail.slDesc}}</p>
        </div>
      </div>

      <div class="dl_title">
        歌曲列表
      </div>
      <div class="ctr_row">
        <div></div>
        <div class="btn_group">
          <el-button icon="el-icon-plus" size="mini" type='primary' @click="showAddDialog">添加歌曲</el-button>
          <el-button icon="el-icon-delete" size="mini" type='danger' @click="batchRemove">批量移除</el-button>
        </div>
      </div>
      <el-table
        :data="slDetail.musicList"
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
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="removeMusic(scope.row.id)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页模块 -->
      <div class="paginationBox">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryDetail.pageNumber"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="queryDetail.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="slDetail.total">
        </el-pagination>
      </div>
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
import { getMusicList, addMusic, removeMusic } from '@/api/songList.js';
import { musicTable } from '@/api/music.js';
export default {
  data() {
    return {
      queryDetail: {
        id: '',
        pageSize: 10,
        pageNumber: 1
      },
      slDetail: {},
      imgPreviewConfig: { // 图片预览组件配置
        imageKeys: [], //  图片链接数组 / 必传
        currentIndex: 0, // 图片预览的当前索引号 / 可不传
        imageContent: [] // 图片对应标题的数组 / 可不传
      },
      dialogVisible: false,
      queryMusicList: {
        title: '',
        pageSize: 10,
        pageNumber: 1
      },
      ids: [],
      musicList: [],
      musicIds: [],
      musicTotal: 0
    }
  },
  created() {
    this.queryDetail.id = this.$route.query.slId
    this.getSongListDetail()
  },
  methods: {
    // 获取歌单详情
    getSongListDetail() {
      getMusicList(this.queryDetail).then(res => {
        if (res.success) {
          this.slDetail = res.data
          this.imgPreviewConfig.imageKeys = [res.data.slImage]
          this.imgPreviewConfig.imageContent = [res.data.slTitle]
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
    // 歌单新增歌曲
    addMusicFunc() {
      const queryObj = {
        listId: this.slDetail.slId,
        musicIds: this.musicIds
      }

      addMusic(queryObj).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getSongListDetail()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 多选框
    selectionChange(selection) {
      this.ids = []
      selection.forEach(e => {
        this.ids.push(e.id)
      })
    },
    // 移除歌曲
    removeMusic(musicId) {
      this.ids = []
      this.ids.push(musicId)

      this.batchRemove()
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
          listId: this.slDetail.slId,
          musicIds: this.ids
        }
        removeMusic(queryObj).then(res => {
          if (res.success) {
            this.$message.success('移除成功')
            this.getSongListDetail()
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
    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.musicIds = []
    },
    // 分页模块
    handleSizeChange(val) {
      this.queryDetail.pageSize = val
      this.queryDetail.pageNumber = 1
      this.getSongListDetail()
    },
    handleCurrentChange(val) {
      this.queryDetail.pageNumber = val
      this.getSongListDetail()
    },
    handleMusicCurrent(val) {
      this.queryMusicList.pageNumber = val
      this.showAddDialog()
    }
  }
}
</script>
<style lang='less' scoped>
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