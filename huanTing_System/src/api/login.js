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

// 今日推荐列表
export function recommendList() {
  return request({
    url: '/recommendMusic',
    method: 'get'
  })
}

// 刷新今日推荐
export function refreshCommend() {
  return request({
    url: '/refreshRecommend',
    method: 'get'
  })
}

// 获取网站信息
export function webMessage() {
  return request({
    url: '/webMessage',
    method: 'get'
  })
}

// 更新网站信息
export function updateWebMsg(data) {
  return request({
    url: '/updateWebMsg',
    method: 'post',
    data: data
  })
}