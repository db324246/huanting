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
        prop="albumArt"
        label="专辑封面">
      </el-table-column>
      <el-table-column
        prop="musicSrc"
        label="歌曲外链">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
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
        <el-form-item label="名称" prop="title">
          <el-input v-model="musicForm.title"></el-input>
        </el-form-item>
        <el-form-item label="歌手名" prop="singerName">
          <el-input v-model="musicForm.singerName"></el-input>
        </el-form-item>
        <el-form-item label="专辑" prop="album">
          <el-input v-model="musicForm.album"></el-input>
        </el-form-item>
        <el-form-item label="专辑封面" prop="albumArt">
          <el-input v-model="musicForm.albumArt" ></el-input>
        </el-form-item>
        <el-form-item label="歌曲外链" prop="musicSrc">
          <el-input v-model="musicForm.musicSrc"></el-input>
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
import { musicTable, deleteMusic, addMusic, updataMusic } from '@/api/music.js';

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
        singerName: '',
        album: '',
        albumArt: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入歌手名称', trigger: 'blur' }
        ],
        musicSrc: [
          { required: true, message: '请输入歌曲外链', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  created() {
    this.getMusicList();
  },
  methods: {
    getMusicList() {
      musicTable(this.queryList).then(res => {
        this.musicList = res.data.records;
        this.total = res.data.total
      }).catch(err => {
        console.log(err);
      })
    },
    saveForm() {
      this.$refs.musicForm.validate(valide => {
        if (valide) {
          if (this.editFlag) this.updateMusic()
          else {
            if (!this.musicForm.singerName) {
              this.musicForm.singerName = '未知歌手'
            }
            this.addMusic()
          }
        }
      })
    },
    updateMusic() {
      updataMusic(this.musicForm).then(res => {
        if (res.success) {
          this.$message.success('编辑成功')
          this.getMusicList()
          this.handleClose()
        }
      }).catch(err => console.log(err))
    },
    addMusic() {
      addMusic(this.musicForm).then(res => {
        if (res.success) {
          this.$message.success('添加成功')
          this.getMusicList()
          this.handleClose()
        }
      }).catch(err => console.log(err)
      )
    },
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
    handleClose() {
      this.dialogVisible = false
      this.musicForm = {
        title: '',
        musicSrc: '',
        singerName: '',
        album: '',
        albumArt: ''
      }
      this.$refs.userForm.clearValidate()
    },
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.queryList.pageNumber = 1
      this.getMusicList()
    },
    handleCurrentChange(val) {
      this.queryList.pageNumber = val
      this.getMusicList()
    },
    handleEdit(row) {
      this.musicForm = Object.assign({}, this.musicForm, row)
      this.dialogVisible = true
      this.editFlag = true
    },
    handleDelete(id) {
      this.ids = []
      this.ids.push(id)
      this.batchDeletMusic()
    },
    selectionChange(selection) {
      selection.forEach(e => {
        this.ids.push(e.id)
      })
    }
  }
}
</script>
<style lang='less' scoped>

</style>