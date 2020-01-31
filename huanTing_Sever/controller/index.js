
const conn = require('../connection/connection.js')
const qs = require('qs')
const uuid = require('node-uuid');

function checkToken(req, res) {
    const token = req.headers.authorization
    const userInfo = req.session.userInfo

    if (!userInfo) {
    
        res.send({
            status: 401,
            message: '登录已过期，请重新登录',
            error: true,
            data: null
        })
        return undefined
    }
    
    const sql = `SELECT * FROM administratores WHERE id = ${userInfo.userId}`
    conn.query(sql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })
        if (result.length === 0) {
            res.send({
                status: 400,
                error: true,
                message: '用户不存在'
            })

            req.session.destroy()
            return
        }
    })

    if (userInfo.uuid === token) return userInfo
    else {
        res.send({
            status: 401,
            message: '登录已过期，请重新登录',
            error: true,
            data: null
        })
    }

    return undefined
}

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
            console.log(1, req.session)

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
    // 管理员列表
    administratorList: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const selectObj = req.body

        let searchFlag = false
        let where = `a.isDelete = 'N'`

        if (selectObj.userName) {
            where += ` and a.userName = '${selectObj.userName}'`
            searchFlag = true
        }

        if (selectObj.nickName) {
            where += ` and a.nickName = '${selectObj.nickName}'`
            searchFlag = true
        }

        if (selectObj.phoneNumber) {
            where += ` and a.phoneNumber = ${selectObj.phoneNumber}`
            searchFlag = true
        }

        if (selectObj.identity) {
            where += ` and a.identity_id = ${selectObj.identityId}`
            searchFlag = true
        }

        const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

        let checkListSql = `SELECT a.id, a.userName, a.nickName, a.password, a.phoneNumber, a.identity_id, a.identityName FROM administratores a
        WHERE ${where}`

        if (!searchFlag) {
            checkListSql += `
            LIMIT ${startNum}, ${selectObj.pageSize}`
        }        

        const checkCountSql = 'SELECT count(id) count FROM administratores where isDelete = "N"'

        conn.query(checkListSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })
            if (result.length !== 0) {
                result.forEach(item => {
                    let sql = `select  r.id, r.root_name FROM root_connection rc
                    LEFT JOIN root r ON r.id = rc.rootId
                    RIGHT JOIN administratores a ON rc.userId = a.id
                    WHERE rc.userId = ${item.id}`;

                    conn.query(sql, (err, _result) => {
                        if (err) return res.send({
                            status: 500,
                            error: true,
                            message: err.message,
                            data: null
                        })
                        
                        item.rootList = _result
                    })
                })
            }

            conn.query(checkCountSql, (err, _result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
                res.send({
                    status: 200,
                    success: true,
                    message: '获取列表成功',
                    data: {
                        records: result,
                        total: _result[0].count
                    }
                })
            })
        })
    },
    // 管理员新增
    addAdministrator: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return
        
        const userForm = req.body
        let checkMutilateSql = `SELECT * from administratores a where a.nickName = ${userForm.nickName}`

        conn.query(checkMutilateSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })
            if (result.length !== 0) return res.send({
                status: 500,
                error: true,
                message: '用户名已存在',
                data: null
            }) 

            let sql = 'INSERT INTO administratores set ?'
    
            userForm.identity_id = 2
            userForm.identityName = '管理员'
            userForm.isDelete = 'N'
    
            conn.query(sql, userForm, (err, result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
                res.send({
                    status: 200,
                    success: true,
                    message: '新增成功',
                    data: null
                })
            })
        })
    },
    // 更新管理员
    updateAdministrator: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const _user = req.body

        const sql = `UPDATE administratores set userName = '${_user.userName}', nickName = '${_user.nickName}', password = '${_user.password}', phoneNumber = ${_user.phoneNumber} WHERE id = ${_user.id}`
        
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
                message: '更新成功',
                data: null
            })
        })
    },
    // 管理员批量删除
    batchDeletAdmin: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const ids = req.query.ids

        const sql = `UPDATE administratores set isDelete = 'Y' WHERE id in (${ids})`

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
                message: '删除成功',
                data: null
            })
        })
    },
    // 权限列表
    rootList: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const sql = `select * FROM root`;
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
                message: '获取权限列表成功',
                data: result
            })
        })
    },
    // 删除用户权限
    deleteUserRoot: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const userId = req.query.userId;
        const rootId = req.query.rootId;

        const sql = `DELETE FROM root_connection WHERE userId = ${userId} AND rootId = ${rootId}`;
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
                message: '删除成功',
                data: result
            })
        })
    },
    // 用户绑定权限
    bindUserRoot: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const userId = req.body.userId;
        const rootIds = req.body.rootIds;

        rootIds.forEach(item => {
            const sql = `INSERT INTO root_connection VALUES(null, ${userId}, ${item})`;
            conn.query(sql, (err, result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
            })
        })

        res.send({
            status: 200,
            success: true,
            message: '添加成功',
            data: null
        })
    },
    // 歌曲列表
    musicList: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const selectObj = req.body

        let searchFlag = false
        let where = `m.isDelete = 'N'`

        if (selectObj.userName) {
            where += ` and m.title = '${selectObj.userName}'`
            searchFlag = true
        }

        if (selectObj.nickName) {
            where += ` and m.singerName = '${selectObj.nickName}'`
            searchFlag = true
        }

        const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

        let checkListSql = `SELECT * FROM musicsongs m
        WHERE ${where}`

        if (!searchFlag) {
            checkListSql += `
            ORDER BY m.id DESC
            LIMIT ${startNum}, ${selectObj.pageSize}`
        }        

        const checkCountSql = 'SELECT count(id) count FROM musicsongs where isDelete = "N"'

        conn.query(checkListSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            conn.query(checkCountSql, (err, _result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
                res.send({
                    status: 200,
                    success: true,
                    message: '获取列表成功',
                    data: {
                        records: result,
                        total: _result[0].count
                    }
                })
            })
        })
    },
    // 新增曲目
    addMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return
        
        const musicForm = req.body
        const checkSingerSql = `SELECT s.id, s.name from singers s where s.name = '${musicForm.singerName}'`

        conn.query(checkSingerSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length === 0) {
                const addSingerSql = `INSERT INTO singers(NAME) VALUES('${musicForm.singerName}')`;

                conn.query(addSingerSql, (err, _result) => {
                    if (err) return res.send({
                        status: 500,
                        error: true,
                        message: err.message,
                        data: null
                    })

                    conn.query(checkSingerSql, (err, _resultA) => {
                        if (err) return res.send({
                            status: 500,
                            error: true,
                            message: err.message,
                            data: null
                        })

                        musicForm.singerId = _resultA[0].id
                    })
                })
            } else {
                musicForm.singerId = result[0].id
            }

            let sql = 'INSERT INTO musicsongs set ?'
    
            conn.query(sql, musicForm, (err, result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
                res.send({
                    status: 200,
                    success: true,
                    message: '新增成功',
                    data: null
                })
            })
        })
    },
    // 歌曲更新
    updataMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const music = req.body
        const checkSingerSql = `SELECT s.id, s.name from singers s where s.name = '${music.singerName}'`

        conn.query(checkSingerSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length === 0) {
                const addSingerSql = `INSERT INTO singers(NAME) VALUES(${music.singerName})`;

                conn.query(addSingerSql, (err, _result) => {
                    if (err) return res.send({
                        status: 500,
                        error: true,
                        message: err.message,
                        data: null
                    })

                    conn.query(checkSingerSql, (err, _resultA) => {
                        if (err) return res.send({
                            status: 500,
                            error: true,
                            message: err.message,
                            data: null
                        })

                        music.singerId = _resultA[0].id
                    })
                })
            } else {
                music.singerId = result[0].id
            }
        })

        const sql = `UPDATE musicsongs m set m.singerId=${music.singerId}, m.singerName = '${music.singerName}', m.title = '${music.title}', m.musicSrc = '${music.musicSrc}', m.album = ${music.album}, m.albumArt = '${music.albumArt}' WHERE m.id = ${music.id}`
        
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
                message: '更新成功',
                data: null
            })
        })
    },
    // 歌曲删除
    deleteMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const ids = req.query.ids

        const sql = `UPDATE musicsongs set isDelete = 'Y' WHERE id in (${ids})`

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
                message: '删除成功',
                data: null
            })
        })
    }
}