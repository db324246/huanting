const conn = require('../connection/connection.js')
const uuid = require('node-uuid');
const randMusic = require('./recommend.js')
const checkToken = require('./checkToken.js')

module.exports = {
    testApi: (req, res) => {
        res.send('请求成功~')
    },
    // 系统登陆
    loginSys: (req, res) => {
        const body = req.body
        const nickName = body.nickName;

        let checkNickName = `select * FROM administratores a WHERE a.nickName = '${nickName}' and a.isDelete = 'N'`
        conn.query(checkNickName, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length === 0) return res.send({
                status: 500,
                error: true,
                message: '用户不存在',
                data: null
            })

            const password = body.password;
            if (password !== result[0].password) return res.send({
                status: 500,
                error: true,
                message: '密码错误',
                data: null
            })

            // v1 根据时间戳和随机数生成的uuid
            const creatuuid = uuid.v1()
            const userInfo = {
                userName: result[0].userName,
                userId: result[0].id,
                identityId: result[0].identity_id,
                identityName: result[0].identityName,
                uuid: creatuuid,
                isLogin: true
            }

            req.session.userInfo = userInfo
            req.session.save()

            res.send({
                status: 200,
                success: true,
                message: '登录成功',
                data: { userInfo, token: creatuuid }
            })
        })

    },
    // 系统初始化 --- 获取用户的权限列表
    systemInit: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const id = req.params.userId
        
        let sql = `select a.userName, a.identityName, r.id, r.root_name, r.root_router FROM root_connection rc
        LEFT JOIN root r ON r.id = rc.rootId
        RIGHT JOIN administratores a ON rc.userId = a.id
        WHERE rc.userId = ${id}`

        
        conn.query(sql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length !== 0) {
                const rootList = [];
                result.forEach(item => {
                    rootList.push({
                        id: item.id,
                        rootName: item.root_name,
                        rootRouter: item.root_router
                    })
                })

                res.send({
                    status: 200,
                    success: true,
                    data: {
                        userName: result[0].userName,
                        identityName: result[0].identityName,
                        rootList
                    }
                })
            } else {
                res.send({
                    status: 200,
                    success: true,
                    data: {
                        rootList: []
                    }
                })
            }
        })
    },
    // 退出登录
    loginOutSys: (req, res) => {
        req.session.destroy();
        // res.redirect('/systemInit');	/		//删除成功后转到百度页面
        res.send({
            status: 200,
            message: '登出成功',
            success: true
        })
    },
    // 今日推荐15条
    recommendMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const sql = 'select * from recommend'
        conn.query(sql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length !== 0) res.send({
                status: 200,
                success: true,
                message: '获取成功',
                data: result
            })
        })
    },
    // 刷新今日推荐
    refreshRecommend: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const rand = function () {
            const p = new Promise(reslove => {
                randMusic(reslove)
            })
            return p
        }
        
        rand().then(data => {
            console.log(data)
            if (data.success) res.send({
                status: 200,
                success: true,
                message: '刷新今日推荐',
                data: null
            })
        })
    },
    // 网站信息
    webMessage: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const sql = 'select * from webMessage';

        conn.query(sql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            res.send({
                status: 200,
                success: true,
                message: '获取成功',
                data: result[0]
            })
        })
    },
    // 更新网站信息
    updateWebMsg: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const web = req.body

        const sql = `update webMessage set webName = '${web.webName}', webLogo = '${web.webLogo}', author = '${web.author}', developTime = '${web.developTime}', email = '${web.email}', weChat = '${web.weChat}', blog = '${web.blog}' where webId = ${web.webId}`;

        conn.query(sql, (err, result) => {
            if (err) return res.send({
                status: 500,
                message: err.message,
                error: true,
                data: null
            })

            res.send({
                status: 200,
                success: true,
                message: '更新成功',
                data: null
            })
        })

    }
}