import request from '@utils/request.js'

// 获取歌曲一级分类
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

// 获取歌二级分类列表
export function categoryList(data) {
  return request({
    url: '/categoryList',
    method: 'post',
    data: data
  })
}

// 新建歌曲二级分类
export function addCategory(data) {
  return request({
    url: '/addCategory',
    method: 'post',
    data: data
  })
}

// 编辑歌曲二级分类
export function updataCategory(data) {
  return request({
    url: '/updataCategory',
    method: 'post',
    data: data
  })
}

// 删除歌曲二级分类
export function deleteCategory(data) {
  return request({
    url: '/deleteCategory',
    method: 'get',
    params: data
  })
}

// 分类歌曲列表
export function cateMusicList(data) {
  return request({
    url: '/category/MusicList',
    method: 'post',
    data: data
  })
}

// 新增分类歌曲
export function addCateMusic(data) {
  return request({
    url: '/category/AddMusic',
    method: 'post',
    data: data
  })
}

// 移除分类歌曲
export function removeCateMusic(data) {
  return request({
    url: '/category/RemoveMusic',
    method: 'post',
    data: data
  })
}