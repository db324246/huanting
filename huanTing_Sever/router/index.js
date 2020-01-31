const express = require('express');
const router = express.Router();

// 引入api
const ctr = require('../controller/index.js');

// 测试
router.get('/system', ctr.testApi);

// 登录
router.post('/system/loginSys', ctr.loginSys);

// 登出
router.get('/system/loginOutSys', ctr.loginOutSys);

// 系统初始化
router.get('/system/systemInit/:userId', ctr.systemInit);

// 新建管理员
router.post('/system/addAdministrator', ctr.addAdministrator);

// 更新管理员
router.post('/system/updateAdministrator', ctr.updateAdministrator);

// 获取管理员列表
router.post('/system/administratorList', ctr.administratorList);

// 管理员批量删除
router.get('/system/batchDeletAdmin', ctr.batchDeletAdmin);

// 权限列表
router.get('/system/rootList', ctr.rootList);

// 删除用户权限
router.get('/system/deleteUserRoot', ctr.deleteUserRoot);

// 用户绑定权限
router.post('/system/bindUserRoot', ctr.bindUserRoot);

// 获取歌曲列表
router.post('/system/musicList', ctr.musicList);

// 歌曲新增
router.post('/system/addMusic', ctr.addMusic);

// 歌曲更新
router.post('/system/updataMusic', ctr.updataMusic);

// 歌曲删除
router.get('/system/deleteMusic', ctr.deleteMusic);

module.exports = router;