<template>
  <div>
    
    <el-upload
      class="upload-demo"
      :action="uploadApi"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeImgUpload">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>
<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    // 上传成功触发事件
    handleSuccess(res) {
      console.log(res)
    }
  }
}
</script>
<style lang='less' scoped>

</style>