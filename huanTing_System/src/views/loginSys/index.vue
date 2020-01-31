<template>
  <div class="login_container">
    <div class="login_box">
      <div class="login_title">幻听音乐</div>
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="nickName">
          <el-input v-model.number="ruleForm.nickName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="passwordword" v-model="ruleForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { loginSys } from '@/api/login.js';
export default {
  data() {
    var checknickName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('用户名不能为空'));
      }
      return callback()
    };
    var validatepassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleForm.checkpassword !== '') {
          this.$refs.ruleForm.validateField('checkpassword');
        }
        callback();
      }
    };

    return {
      ruleForm: {
        password: '123123',
        nickName: 'tingting'
      },
      rules: {
        password: [
          { validator: validatepassword, trigger: 'blur' }
        ],
        nickName: [
          { validator: checknickName, trigger: 'blur' }
        ]
      }
    };
  },
  created() {
  },
  methods: {
    // 登录提交
    submitForm(formName) {
      // eslint-disable-next-line consistent-return
      this.$refs[formName].validate((valid) => {
        if (valid) {
          loginSys(this.ruleForm).then(res => {
            if (res.success) {
              this.$store.commit('saveLoginInfo', res.data)
              this.$router.push('/home')
            }
          }).catch(err => console.log(err))
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
}

</script>

<style lang="less" scoped>

.login_container {
  position: relative;
  height: 100%;
  background: url('~@/assets/image/beijing.jpeg') no-repeat center;
  background-size: cover;
}
.login_box{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 400px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,.7);
  background-color: #ffffff80;
}
.login_title {
  margin-top: 40px;
  font-size: 48px;
  text-align: center;
  color: #33333390;
}
.el-form{
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-60%, -50%);
  width: 400px;
}
</style>