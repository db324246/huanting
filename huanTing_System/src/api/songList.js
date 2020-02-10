import request from '@utils/request.js'

// 获取歌单表格
export function songList(data) {
  return request({
    url: '/songListList',
    method: 'post',
    data: data
  })
}

// 新建歌单
export function addSongList(data) {
  return request({
    url: '/addSongList',
    method: 'post',
    data: data
  })
}

// 歌单删除
export function deleteSongList(data) {
  return request({
    url: '/deleteSongList',
    method: 'get',
    params: data
  })
}

// 歌单更新
export function updataSongList(data) {
  return request({
    url: '/updataSongList',
    method: 'post',
    data: data
  })
}

// 歌单歌曲列表
export function getMusicList(data) {
  return request({
    url: '/songList/MusicList',
    method: 'post',
    data: data
  })
}

// 歌单歌曲新增
export function addMusic(data) {
  return request({
    url: '/songList/AddMusic',
    method: 'post',
    data: data
  })
}

// 歌单歌曲移除
export function removeMusic(data) {
  return request({
    url: '/songList/RemoveMusic',
    method: 'post',
    data: data
  })
}
