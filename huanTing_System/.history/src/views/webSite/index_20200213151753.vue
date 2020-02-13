<template>
  <div>
    <div class="btn_nav">
      <el-button type="primary" size="mini" icon="el-icon-edit" @click="editForm">编辑</el-button>
    </div>
    <el-form class="webForm" ref="webForm" :model="webForm" label-width="120px" disabled>
      <el-form-item label="网站名称：">
        {{webForm.webName}}
      </el-form-item>
      <el-form-item label="网站logo：">
        <img :src="webForm.webLogo" alt="" class="table_img" :onerror="defaultImg">
      </el-form-item>
      <el-form-item label="作者：">
        {{webForm.author}}
      </el-form-item>
      <el-form-item label="开发时间：">
        {{webForm.developTime}}
      </el-form-item>
      <el-form-item label="作者邮箱：">
        {{webForm.email}}
      </el-form-item>
      <el-form-item label="作者微信：">
        <img :src="webForm.weChat" alt="" class="table_img" :onerror="defaultImg">
      </el-form-item>
      <el-form-item label="作者博客：">
        {{webForm.blog}}
      </el-form-item>
    </el-form>

    <el-dialog
      title="网站信息"
      :visible.sync="dialogVisible"
      width="680px"
      :before-close="handleClose">
      <el-form style="padding-right: 50px;" ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="网站名称" prop="webName">
          <el-input v-model="form.webName"></el-input>
        </el-form-item>
        <el-form-item label="网站logo" prop="webLogo">
          <image-upload v-model="form.webLogo"></image-upload>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author"></el-input>
        </el-form-item>
        <el-form-item label="开发时间" prop="developTime">
          <el-input v-model="form.developTime"></el-input>
        </el-form-item>
        <el-form-item label="作者邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="作者微信" prop="weChat">
          <img class="table_img" :src="form.weChat" alt="" :onerror="defaultImg">
          <el-upload
            class="upload-demo"
            :action="uploadApi"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleWechatSuccess"
            :before-upload="beforeImgUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传图片，大小不超过3M</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="作者博客" prop="blog">
          <el-input v-model="form.blog"></el-input>
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
import ImageUpload from '@/components/ImageUpload.vue'
import { webMessage, updateWebMsg } from '@/api/login.js';
import { validateEMail } from '@utils/valide.js';
export default {
  components: {
    ImageUpload
  },
  data() {
    return {
      webForm: {},
      dialogVisible: false,
      form: {},
      rules: {
        webName: [
          { required: true, message: '请输入网站名称', trigger: 'blur' }
        ],
        webLogo: [
          { required: true, message: '请上传网站Logo', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者姓名', trigger: 'blur' }
        ],
        developTime: [
          { required: true, message: '请输入开发时间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入作者邮箱', trigger: 'blur' },
          { validator: validateEMail, trigger: 'blur' }
        ],
        blog: [
          { required: true, message: '请输入作者博客', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getWebMessage()
  },
  methods: {
    // 获取网站信息
    getWebMessage() {
      webMessage().then(res => {
        if (res.success) {
          this.webForm = res.data
        }
      }).catch(err => console.log(err))
    },
    // 编辑网站信息
    editForm() {
      this.form = Object.assign({}, this.webForm)
      this.dialogVisible = true
    },
    // logo上传成功
    handleLogoSuccess(res) {
      if (res.success) {
        this.$message.success('上传成功')
        this.form.webLogo = res.data.url
      }
    },
    // 微信上传成功
    handleWechatSuccess(res) {
      if (res.success) {
        this.$message.success('上传成功')
        this.form.weChat = res.data.url
      }
    },
    // 更新网站信息
    saveForm() {
      this.$refs.form.validate(valide => {
        if (valide) {
          updateWebMsg(this.form).then(res => {
            if (res.success) {
              this.$message.success('更新成功')
              this.getWebMessage()
              this.handleClose()
            }
          }).catch(err => console.log(err))
        }
      })
    },
    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
    }
  }
}
</script>
<style lang='less' scoped>
.btn_nav {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.webForm {
  width: 600px;
  padding-left: 200px;
  .el-form-item {
    margin-bottom: 5px;
  }
}

.table_img {
  width: 120px;
  height: 120px;
  margin-top: 5px;
}
</style>