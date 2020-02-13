import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui';
import store from '@/store'

// 环境的切换
if (process.env.NODE_ENV == 'development') {
  // axios.defaults.baseURL = 'http://192.168.0.112:3000'
  // axios.defaults.baseURL = 'http://192.168.199.141:3000'
  axios.defaults.baseURL = '/system'
}
// else if (process.env.NODE_ENV == 'debug') {
//   axios.defaults.baseURL = ''
// } else if (process.env.NODE_ENV == 'production') {
//   axios.defaults.baseURL = 'http://api.123dailu.com/'
// }

const http = axios.create({
  // 请求超时时间
  timeout: 10000,
  // withCredentials: true,
  // withCredentials: true,
  transformRequest: [function(data) {
    data = JSON.stringify(data)
    return data
  }],
  // 在传递给 then/catch 前，修改响应数据
  transformResponse: [function(data) {
    if (typeof data === 'string' && data.startsWith('{')) {
      data = JSON.parse(data)
    }
    return data
  }]
})

// 请求超时时间
// axios.defaults.timeout = 10000

// post请求头
http.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
http.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

const errorHandle = (status, message) => {
  switch (status) {
    // 401: 未登录
    // 未登录则跳转登录页面，并携带当前页面的路径
    // 在登录成功后返回当前页面，这一步需要在登录页操作。
    case 401:
      router.replace({
        path: '/login',
        query: { redirect: router.currentRoute.fullPath }
      });
      break;
      // 403 token过期
      // 登录过期对用户进行提示
      // 清除本地token和清空vuex中token对象
      // 跳转登录页面
    case 403:
      this.confirm('登录过期，请重新登录', '提示', {
        confirmButtonText: '确定',
        type: 'error'
      }).then(() => {
        // // 清除token
        // localStorage.removeItem('token');
        // store.commit('loginSuccess', null);
        // // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
        // setTimeout(() => {
        //   router.replace({
        //     path: '/login',
        //     query: {
        //       redirect: router.currentRoute.fullPath
        //     }
        //   })
        // }, 1000)
      })
      break;
      // 404请求不存在
    case 404:
      this.$message.error('网络请求不存在')
      break;
      // 其他错误，直接抛出错误提示
    default:
      Message({
        type: 'error',
        message
      })
  }
}

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    const token = sessionStorage.getItem('token');
    // const token = store.state.token;
    token && (config.headers.Authorization = token);
    return config;
  },
  error => {
    return Promise.error(error);
  })

// 响应拦截器
http.interceptors.response.use(
  response => {
    if (response.data.status === 200) {
      const data = response.data
      return Promise.resolve(data);
    }
    errorHandle(response.data.status, response.data.message)
    return Promise.resolve(data)
  },
  // 服务器状态码不是200的情况
  // eslint-disable-next-line consistent-return
  error => {
    if (error.response.status) {
      errorHandle(error.response.status, error.response.msg)
      return Promise.reject(response)
      // eslint-disable-next-line no-else-return
    } else {
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      if (!window.navigator.onLine) {
        // store.commit('changeNetwork', false)
      } else {
        return Promise.reject(error)
      }
    }
  }
)

export default http