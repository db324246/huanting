import request from '@utils/request.js'

// 系统登录
export function loginSys(data) {
  return request({
    url: '/loginSys',
    method: 'post',
    data: data
  })
}

// 系统初始化 --- 获取用户权限列表
export function systemInit(id) {
  return request({
    url: '/systemInit/' + id,
    method: 'get'
  })
}

// 系统退出登录
export function loginOutSys() {
  return request({
    url: '/loginOutSys',
    method: 'get'
  })
}
