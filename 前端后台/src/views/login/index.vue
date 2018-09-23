<template>
  <div class="login-container">
    <el-form class="login-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
      <div class="title-container">
        <h3 class="title">{{$t('login.title')}}</h3>
        <lang-select class="set-language"></lang-select>
      </div>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on" placeholder="username" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on" placeholder="password" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>

      <el-button type="primary" style="width:100%;margin-bottom:30px;" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>
      <br>
      <br>
      <br>
      <br>
      <el-button class="thirdparty-button" style="width:20%;margin-bottom:20px;" type="primary" @click="showDialog=true">{{$t('signup.signUp')}}</el-button>
    </el-form>

    <el-dialog :title="$t('signup.signUp')" :visible.sync="showDialog" append-to-body>
      <el-form  class="login-form" autoComplete="on" :model="signupForm" :rules="signupRules" ref="signupForm" label-position="left" label-width="200px">
        <div class="title-container" align="right">
         <lang-select  class="set-language"></lang-select>{{$t('signup.language')}}
        </div>

        <el-form-item style="margin-left:100px;" :label="$t('signup.id')" prop="id">
          <el-input style="width:50%;" v-model="signupForm.id"  placeholder="Please input"></el-input>
        </el-form-item>

        <el-form-item style="margin-left:100px;"  :label="$t('signup.username')" prop="username">
         <el-input style="width:50%;" v-model="signupForm.username"  placeholder="Please input"></el-input>
        </el-form-item>

        <el-form-item style="margin-left:100px;" :label="$t('signup.password')" prop="password">
        <el-input style="width:50%;" :type="passwordType" @keyup.enter.native="handleLogin" v-model="signupForm.password" autoComplete="on" placeholder="Please input" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
        </el-form-item>

        <el-form-item style="margin-left:100px;" :label="$t('signup.mobileNumber')" prop="mobileNumber">
          <el-input style="width:50%;" v-model="signupForm.mobileNumber"  placeholder="Please input"></el-input>
        </el-form-item>

        <el-form-item style="margin-left:100px;" :label="$t('signup.job')" prop="job">
          <el-select style="width:50%;" v-model="signupForm.job" class="filter-item" placeholder="Please select">
            <el-option v-for="item in jobOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>

        <el-form-item style="margin-left:100px;" :label="$t('signup.department')" prop="department">
          <el-select style="width:50%;" v-model="signupForm.department" class="filter-item" placeholder="Please select">
            <el-option v-for="item in departOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>

        <el-form-item style="margin-left:100px;" :label="$t('signup.avator')" prop="avator">
          <el-button type="primary" icon="upload" style="width:50%;margin-left;" @click="imagecropperShow=true">{{ $t('signup.uploadAvator') }}
        </el-button>
        <image-cropper
           v-show="imagecropperShow"
          :width="300"
          :height="300"
          :key="imagecropperKey"
          url="https://httpbin.org/post"
          lang-type="en"
          @close="close"
          @crop-upload-success="cropSuccess"/>
        </el-form-item>

        <div style = "text-align:center;">
        <el-button type="primary" style="width:50%;margin-top:30px;" @click="createData">{{ $t('signup.confirm') }}
        </el-button>
        </div>
      
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import axios from 'axios'
import createUserWithPic from '@/api/user'
import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import ImageCropper from '@/components/ImageCropper'


export default {
  components: { LangSelect, SocialSign, ImageCropper },
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    const validateMobileNumber = (rule, value, callback) => {
      if (value.length != 11) {
        callback(new Error('The mobile number should be 11 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'Hiro',
        password: 'code016'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      signupForm: {
        id: '122',
        username: 'wwwwwww',
        password: '111111',
        job: 'coder',
        department: 'Delphinium',
        roles: 'editor',
        mobileNumber: '11111111111'
      },
      signupRules:{
        id: [{required: true, trigger: 'blur'}],
        username: [{required: true, trigger: 'blur', validator: validateUsername }],
        password: [{required: true, trigger: 'blur', validator: validatePassword }],
        mobileNumber: [{required: true, trigger: 'blur', validator: validateMobileNumber}],
        job: [{required: true, trigger: 'blur'}],
        department: [{required: true, trigger: 'blur'}],
        //avator: [{required: true, trigger: 'blur'}]
      },
      jobOptions: ['manager', 'coder'],
      departOptions: ['Strelizia','Delphinium','Argentea','Genista','Chlorophytum'],
      passwordType: 'password',
      loading: false,
      showDialog: false,
      imagecropperShow: false,
      imagecropperKey: 0
    }
  },
  methods: {
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {
        type: mime
      });
    },
    createData() {
      var form = this.signupForm;
      var file = this.dataURLtoFile(this.image, 'takenFromCamera.png')
      // this.temp.author = 'vue-element-admin'
      var formdata = new FormData(); // 创建form对象
      formdata.append('id',form.id);
      formdata.append('username',form.username);
      formdata.append('password',form.password);
      formdata.append('mobileNumber',form.mobileNumber);
      formdata.append('roles',form.roles);
      formdata.append('department',form.department);
      formdata.append('job',form.job);
      formdata.append('', file); // 通过append向form对象添加数据,可以通过append继续添加数据或formdata.append('img',file)
      //console.log(this.image)
      //console.log(formdata)
      let config = {
              headers: {
                'enctype': 'multipart/form-data'
              },
              processData: false,
              contentType: false,
            };
      axios.post('http://localhost:4041/api/users/createWithPic', formdata, config).then((response) =>{
        console.log("res: " + response)
        this.showDialog = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
      /*
      createUserWithPic(formdata).then(() => {
        //this.list.unshift(formdata)
        console.log("111111111111")
        showDialog = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
      */
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    },
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      this.image = resData //.files.avatar
      //console.log("image: ",this.image);
    },
    close() {
      this.imagecropperShow = false
    }
  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  }
}
</script>

<style scoped>
  .avatar{
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
</style>

<style rel="stylesheet/scss" lang="scss">
$bg:#2d3a4b;
$light_gray:#eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
