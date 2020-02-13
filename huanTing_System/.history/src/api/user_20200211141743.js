import request from '@utils/request.js'

// 获取用户管理表格
export function userManageTable(data) {
  return request({
    url: '/administratorList',
    method: 'post',
    data: data
  })
}

// 新增管理员
export function addAdministrator(data) {
  return request({
    url: '/addAdministrator',
    method: 'post',
    data: data
  })
}

// 批量删除管理员
export function batchDeletAdmin(data) {
  return request({
    url: '/batchDeletAdmin',
    method: 'get',
    params: data
  })
}

// 更新管理员
export function updateAdministrator(data) {
  return request({
    url: '/updateAdministrator',
    method: 'post',
    data: data
  })
}

// 获取权限列表
export function rootList() {
  return request({
    url: '/rootList',
    method: 'get'
  })
}

// 删除管理员权限
export function deleteUserRoot(data) {
  return request({
    url: '/deleteUserRoot',
    method: 'get',
    params: data
  })
}

// 添加管理员权限
export function addUserRoot(data) {
  return request({
    url: '/bindUserRoot',
    method: 'post',
    data: data
  })
}

// 用户列表
export function userList(data) {
  return request({
    url: '/userList',
    method: 'post',
    data: data
  })
}

// 用户禁用/解禁
export function userDisabled(data) {
  return request({
    url: '/userDisabled',
    method: 'get',
    params: data
  })
}