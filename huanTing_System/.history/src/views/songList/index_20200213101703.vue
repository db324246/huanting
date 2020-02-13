<template>
  <div>
    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="btn_group">
        <el-button icon="el-icon-plus" size="mini" type='primary' @click="dialogVisible = true">新增</el-button>
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDeletsong"> 批量删除 </el-button>
      </div>
      <div class="search_box">
        <el-input placeholder="请输入歌单名称" size="mini" @keydown.native.enter="getSongList" v-model="queryList.title">
        </el-input>
        <el-button type="primary" size="mini" @click="getSongList">搜索</el-button>
      </div>
    </div>

    <!-- 歌单列表 -->
    <el-table
      :data="songList"
      style="width: 100%"
      @selection-change='selectionChange'>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="title"
        label="名称">
        <template slot-scope="scope">
          <router-link :to="{ path: '/songListMusic', query: {'slId': scope.row.id}}">
            <span class="table_title">{{scope.row.title}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="describtion"
        label="描述">
        <template slot-scope="scope">
          <div class="tableRow_message">
            {{scope.row.describtion}}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="imageSrc"
        label="封面">
        <template slot-scope="scope">
          <img :src="scope.row.imageSrc" alt="" @click="previewImg(scope)" class="table_img" :onerror="defaultImg">
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <router-link :to="{ path: '/songListMusic', query: {'slId': scope.row.id}}">
            <el-button
              size="mini"
              type="primary">查看详情</el-button>
          </router-link>
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

    <!-- 歌单新增、编辑对话框 -->
    <el-dialog
      title="新增歌单"
      :visible.sync="dialogVisible"
      width="680px"
      :before-close="handleClose">
      <el-form style="padding-right: 50px;" ref="songForm" :rules="rules" :model="songForm" label-width="80px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="songForm.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="describtion">
          <el-input v-model="songForm.describtion"></el-input>
        </el-form-item>
        <el-form-item label="封面" prop="imageSrc">
          <el-input v-model="songForm.imageSrc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" style="padding-right: 50px;">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="saveForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { songList, addSongList, deleteSongList, updataSongList } from '@/api/songList.js';

export default {
  data() {
    return {
      songList: [],
      queryList: {
        pageSize: 10,
        pageNumber: 1,
        title: ''
      },
      total: 0,
      imgPreviewConfig: { // 图片预览组件配置
        imageKeys: [], //  图片链接数组 / 必传
        currentIndex: 0, // 图片预览的当前索引号 / 可不传
        imageContent: [] // 图片对应标题的数组 / 可不传
      },
      editFlag: true,
      dialogVisible: false,
      songForm: {
        title: '',
        describtion: '',
        imageSrc: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入歌单名称', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  created() {
    this.getSongList();
  },
  methods: {
    // 获取歌单列表
    getSongList() {
      songList(this.queryList).then(res => {
        this.songList = res.data.records;
        this.total = res.data.total
        this.imgPreviewConfig.imageKeys = res.data.records.map(item => item.imageSrc)
        this.imgPreviewConfig.imageContent = res.data.records.map(item => item.title)
      }).catch(err => {
        console.log(err);
      })
    },
    // 保存编辑或新增表单
    saveForm() {
      this.$refs.songForm.validate(valide => {
        if (valide) {
          if (this.editFlag) this.updateSong()
          else {
            this.addSong()
          }
        }
      })
    },
    // 更新歌单信息
    updateSong() {
      const songForm = Object.assign({}, this.songForm)
      if (!this.songForm.describtion) {
        songForm.describtion = '这是一个神奇的歌单'
      }

      updataSongList(songForm).then(res => {
        if (res.success) {
          this.$message.success('编辑成功')
          this.editFlag = false
          this.getSongList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    // 添加歌单信息
    addSong() {
      const songForm = Object.assign({}, this.songForm)
      if (!this.songForm.describtion) {
        songForm.describtion = '这是一个神奇的歌单'
      }
      addSongList(songForm).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getSongList()
          this.handleClose()
        }
      }).catch(err => console.log(err)
      )
    },
    // 批量删除歌单信息
    batchDeletsong() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的歌单')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSongList({ ids: this.ids }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getSongList()
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
      this.songForm = {
        name: '',
        describtion: '',
        imageSrc: ''
      }
      this.$refs.songForm.clearValidate()
    },
    // 控制当前页大小
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getSongList()
    },
    // 控制当前页
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getSongList()
    },
    // 控制编辑按钮
    handleEdit(row) {
      this.songForm = Object.assign({}, this.songForm, row)
      this.dialogVisible = true
      this.editFlag = true
    },
    // 控制删除页面
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletsong()
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

</style>