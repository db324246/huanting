import request from '@utils/request.js'

// 获取歌手分类列表
export function singerCateList() {
  return request({
    url: '/singerCateList',
    method: 'get'
  })
}

// 获取歌手表格
export function singerTable(data) {
  return request({
    url: '/singerList',
    method: 'post',
    data: data
  })
}

// 删除歌手
export function deleteSinger(data) {
  return request({
    url: '/deleteSinger',
    method: 'get',
    params: data
  })
}

// 添加歌手
export function addSinger(data) {
  return request({
    url: '/addSinger',
    method: 'post',
    data: data
  })
}

// 更新歌手
export function updataSinger(data) {
  return request({
    url: '/updataSinger',
    method: 'post',
    data: data
  })
}

// 歌手详情 - 专辑列表
export function singerDetail(data) {
  return request({
    url: '/singerDetail',
    method: 'post',
    data: data
  })
}

// 新建专辑
export function addAlbum(data) {
  return request({
    url: '/addAlbum',
    method: 'post',
    data: data
  })
}

// 更新专辑
export function updateAlbum(data) {
  return request({
    url: '/updateAlbum',
    method: 'post',
    data: data
  })
}

// 删除专辑
export function deleteAlbum(data) {
  return request({
    url: '/deleteAlbum',
    method: 'get',
    params: data
  })
}