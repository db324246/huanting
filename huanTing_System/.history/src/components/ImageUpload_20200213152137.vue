<template>
  <div class="imgUpload">
    <img class="upload_img" :src="value" alt="" :onerror="defaultImg">
    <el-upload
      class="upload-demo"
      :action="uploadApi"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="onSuccess"
      :before-upload="beforeImgUpload">
      <el-button class="uploadBtn" size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传图片，大小不超过3M</div>
    </el-upload>
  </div>
</template>
<script>
export default {
  name: 'ImageUpload',
  props: {
    value: {
      type: String,
      default: ''
    },
    onSuccess: {
      type: Function
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang='less' scoped>
.imgUpload {
  display: flex;
  .upload_img {
    display: block;
    width: 120px;
    height: 120px;
    margin-right: 50px;
  }
  .uploadBtn {
    margin-top: 35px;
  }
}
</style>