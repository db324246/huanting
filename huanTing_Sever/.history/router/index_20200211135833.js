const express = require('express');
const router = express.Router();

// 引入系统登录api
const sysCtr = require('../controller/index.js');

// 引入系统上传api
const uploadCtr = require('../controller/upload.js');

// 引入音乐api
const musicCtr = require('../controller/music.js');

// 引入管理员api
const adminCtr = require('../controller/admin.js');

// 引入歌手api
const singerCtr = require('../controller/singer.js');

// 引入歌单api
const songListCtr = require('../controller/songList.js');

// 引入歌曲分类api
const categoriesCtr = require('../controller/categories.js');

// 引入用户api
const usersCtr = require('../controller/users.js');

// 测试
router.get('/system', sysCtr.testApi);

// 登录
router.post('/system/loginSys', sysCtr.loginSys);

// 登出
router.get('/system/loginOutSys', sysCtr.loginOutSys);

// 系统初始化
router.get('/system/systemInit/:userId', sysCtr.systemInit);

// 文件上传
router.post('/system/Upload', uploadCtr.Upload);

// 新建管理员
router.post('/system/addAdministrator', adminCtr.addAdministrator);

// 更新管理员
router.post('/system/updateAdministrator', adminCtr.updateAdministrator);

// 获取管理员列表
router.post('/system/administratorList', adminCtr.administratorList);

// 管理员批量删除
router.get('/system/batchDeletAdmin', adminCtr.batchDeletAdmin);

// 权限列表
router.get('/system/rootList', adminCtr.rootList);

// 删除管理员权限
router.get('/system/deleteUserRoot', adminCtr.deleteUserRoot);

// 管理员绑定权限
router.post('/system/bindUserRoot', adminCtr.bindUserRoot);

// 获取歌曲列表
router.post('/system/musicList', musicCtr.musicList);

// 歌手查询
router.get('/system/checkSinger', musicCtr.checkSinger);

// 歌曲新增
router.post('/system/addMusic', musicCtr.addMusic);

// 歌曲更新
router.post('/system/updataMusic', musicCtr.updataMusic);

// 歌曲删除
router.get('/system/deleteMusic', musicCtr.deleteMusic);

// 获取歌手分类列表
router.get('/system/singerCateList', singerCtr.singerCateList);

// 获取歌手列表
router.post('/system/singerList', singerCtr.singerList);

// 歌手新增
router.post('/system/addSinger', singerCtr.addSinger);

// 歌手更新
router.post('/system/updataSinger', singerCtr.updataSinger);

// 歌手删除
router.get('/system/deleteSinger', singerCtr.deleteSinger);

// 歌手详情
router.post('/system/singerDetail', singerCtr.singerDetail);

// 专辑删除
router.get('/system/deleteAlbum', singerCtr.deleteAlbum);

// 专辑新增
router.post('/system/addAlbum', singerCtr.addAlbum);

// 专辑更新
router.post('/system/updateAlbum', singerCtr.updateAlbum);

// 歌单列表
router.post('/system/songListList', songListCtr.songListList);

// 新建歌单
router.post('/system/addSongList', songListCtr.addSongList);

// 歌单删除
router.get('/system/deleteSongList', songListCtr.deleteSongList);

// 歌单更新
router.post('/system/updataSongList', songListCtr.updataSongList);

// 歌单歌曲列表
router.post('/system/songList/MusicList', songListCtr.songListMusicList);

// 歌单歌曲新增
router.post('/system/songList/AddMusic', songListCtr.songListAddMusic);

// 歌单歌曲移除
router.post('/system/songList/RemoveMusic', songListCtr.songListRemoveMusic);

// 歌曲一级分类
router.get('/system/categories', categoriesCtr.categories);

// 歌曲二级分类列表
router.post('/system/categoryList', categoriesCtr.categoryList);

// 新建歌曲二级分类
router.post('/system/addCategory', categoriesCtr.addCategory);

// 更新二级分类列表
router.post('/system/updataCategory', categoriesCtr.updataCategory);

// 删除二级分类列表
router.get('/system/deleteCategory', categoriesCtr.deleteCategory);

// 分类歌曲列表
router.post('/system/category/MusicList', categoriesCtr.categoryMusicList);

// 分类歌曲新增
router.post('/system/category/AddMusic', categoriesCtr.categoryAddMusic);

// 分类歌曲移除
router.post('/system/category/RemoveMusic', categoriesCtr.categoryRemoveMusic);

// 今日推荐列表
router.get('/system/recommendMusic', sysCtr.recommendMusic);

// 今日推荐列表
router.get('/system/refreshRecommend', sysCtr.refreshRecommend);

// 网站信息
router.get('/system/webMessage', sysCtr.webMessage);

// 更新网站信息
router.post('/system/updateWebMsg', sysCtr.updateWebMsg);

// 用户列表
router.post('/system/userList', usersCtr.userList);

// 用户禁用
router.get('/system/userDisabled', usersCtr.userDisabled);

module.exports = router;