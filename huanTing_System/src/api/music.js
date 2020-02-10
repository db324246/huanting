import request from '@utils/request.js'

// 获取歌曲表格
export function musicTable(data) {
  return request({
    url: '/musicList',
    method: 'post',
    data: data
  })
}

// 删除歌曲
export function deleteMusic(data) {
  return request({
    url: '/deleteMusic',
    method: 'get',
    params: data
  })
}

// 歌手查询
export function checkSinger(data) {
  return request({
    url: '/checkSinger',
    method: 'get',
    params: data
  })
}

// 添加歌曲
export function addMusic(data) {
  return request({
    url: '/addMusic',
    method: 'post',
    data: data
  })
}

// 更新歌曲
export function updataMusic(data) {
  return request({
    url: '/updataMusic',
    method: 'post',
    data: data
  })
}
