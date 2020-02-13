<template>
  <div>
    <!-- 操作栏 -->
    <div class="ctr_row">
      <div class="btn_group">
        <el-button icon="el-icon-plus" size="mini" type='primary' @click="dialogVisible = true">新增</el-button>
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="batchDeletMusic"> 批量删除 </el-button>
      </div>
      <div class="search_box">
        <el-input placeholder="请输入歌曲名称" size="mini" @keydown.native.enter="getMusicList" v-model="queryList.title">
        </el-input>
        <el-button type="primary" size="mini" @click="getMusicList">搜索</el-button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <el-table
      :data="musicList"
      style="width: 100%"
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
        label="是否有歌词">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.musicLrc">有歌词</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="showAudioDialog(scope.row)">试听</el-button>
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

    <!-- 歌曲新增、编辑对话框 -->
    <el-dialog
      title="新增歌曲"
      :visible.sync="dialogVisible"
      width="680px"
      :before-close="handleClose">
      <el-form style="padding-right: 50px;" ref="musicForm" :rules="rules" :model="musicForm" label-width="80px">
        <el-form-item label="歌曲上传" prop="musicSrc">
          <audio :src="musicForm.musicSrc" controls="controls"></audio>
          <el-upload
            class="upload-demo"
            :action="uploadApi"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleMusicSuccess"
            :before-upload="beforeMusicUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传音乐文件，且不超过500M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="musicForm.title"></el-input>
        </el-form-item>
        <el-form-item label="歌手名" prop="singerName">
          <el-input @blur="checkSingerFunc" v-model="musicForm.singerName"></el-input>
        </el-form-item>
        <el-form-item label="专辑名称" prop="albumId">
          <el-select v-model="musicForm.albumId" :disabled="albumList.length === 0" :placeholder="albumList.length === 0 ? '歌手专辑未维护' : '请选择'">
            <el-option
              v-for="item in albumList"
              :key="item.id"
              :label="item.album"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="歌词上传" prop="musicLrc">
          <el-upload
            class="upload-demo"
            :action="uploadApi"
            :headers="uploadHeaders"
            :show-file-list="true"
            :file-list="fileList"
            :on-success="handleLrcSuccess"
            :before-upload="beforeLrcUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传.lrc文件</div>
          </el-upload>
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
import { musicTable, checkSinger, deleteMusic, addMusic, updataMusic } from '@/api/music.js';

export default {
  data() {
    return {
      musicList: [],
      queryList: {
        title: '',
        pageSize: 10,
        pageNumber: 1,
        singerName: ''
      },
      total: 0,
      dialogVisible: false,
      musicForm: {
        title: '',
        musicSrc: '',
        musicLrc: '',
        singerName: '',
        singerId: undefined,
        album: '',
        albumId: undefined
      },
      albumList: [],
      fileList: [],
      rules: {
        title: [
          { required: true, message: '请输入歌曲名称', trigger: 'blur' }
        ],
        musicSrc: [
          { required: true, message: '请上传歌曲', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  created() {
    this.getMusicList();
  },
  methods: {
    // 获取曲库列表
    getMusicList() {
      musicTable(this.queryList).then(res => {
        this.musicList = res.data.records;
        this.total = res.data.total
      }).catch(err => {
        console.log(err);
      })
    },
    // 音乐上传成功的回调
    handleMusicSuccess(res, file) {
      if (res.success) {
        this.$message.success('上传成功')
        const nameArr = file.name.split('.')[0].split(' - ')
        this.musicForm.musicSrc = res.data.url
        this.musicForm.title = nameArr[0]
        this.musicForm.singerName = nameArr[1]
        this.checkSingerFunc()
      }
    },
    // 歌词上传成功的回调
    handleLrcSuccess(res) {
      if (res.success) {
        this.$message.success('上传成功')
        this.musicForm.musicLrc = res.data.url
      }
    },
    // 歌手信息查询
    checkSingerFunc() {
      if (this.musicForm.singerName) {
        const queryObj = {
          singerName: this.musicForm.singerName
        }
        checkSinger(queryObj).then(res => {
          if (res.success) {
            this.musicForm.singerId = res.data.singerId
            this.albumList = res.data.albumList
          }
        }).catch(err => console.log(err))
      }
    },
    // 保存添加或编辑表单
    saveForm() {
      this.$refs.musicForm.validate(valide => {
        if (valide) {
          if (this.musicForm.albumId) {
            this.musicForm.album = this.albumList.filter(item => item.id === this.musicForm.albumId)[0].album
          }
          if (this.editFlag) this.updateMusic()
          else {
            this.addMusic()
          }
        }
      })
    },
    // 编辑歌曲信息
    updateMusic() {
      updataMusic(this.musicForm).then(res => {
        if (res.success) {
          this.$message.success('编辑成功')
          this.getMusicList()
          this.handleClose()
          this.editFlag = false
        }
      }).catch(err => console.log(err))
    },
    // 添加歌曲
    addMusic() {
      const musicForm = Object.assign({}, this.musicForm)
      if (!this.musicForm.singerName) {
        musicForm.singerName = '未知歌手'
      }
      addMusic(musicForm).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getMusicList()
          this.handleClose()
        }
      }).catch(err => console.log(err)
      )
    },
    // 批量删除
    batchDeletMusic() {
      if (this.ids.length === 0) return this.$message.error('请选择需要删除的歌曲')

      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMusic({ ids: this.ids }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
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
    // 控制弹框关闭
    handleClose() {
      this.dialogVisible = false
      this.fileList = []
      this.musicForm = {
        title: '',
        musicSrc: '',
        musicLrc: '',
        singerName: '',
        singerId: undefined,
        album: '',
        albumId: undefined
      }
      this.$refs.musicForm.clearValidate()
    },
    // 页码大小控制
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getMusicList()
    },
    // 当前页码控制
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getMusicList()
    },
    // 编辑按钮的控制
    handleEdit(row) {
      this.musicForm = Object.assign({}, this.musicForm, row)
      if (this.musicForm.singerName) {
        this.checkSingerFunc()
      }
      this.dialogVisible = true
      this.editFlag = true
    },
    // 删除按钮的控制
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletMusic()
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