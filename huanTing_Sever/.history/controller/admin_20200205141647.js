const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
  // 管理员列表
  administratorList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body

    let searchFlag = false
    let where = `a.isDelete = 'N'`

    if (selectObj.userName) {
        where += ` and a.userName like '%${selectObj.userName}%'`
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
    let checkMutilateSql = `SELECT * from administratores a where a.nickName = '${userForm.nickName}' and a.isDelete='N'`

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
    let checkMutilateSql = `SELECT * from administratores a where a.nickName = ${_user.nickName} and a.isDelete='N'`

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

        const rootSql = `UPDATE root_connection set isDelete = 'Y' WHERE userId in (${ids})`

        conn.query(rootSql, err => {
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

    const length = rootIds.length;

    rootIds.forEach((item, index) => {
        const sql = `INSERT INTO root_connection VALUES(null, ${userId}, ${item}, 'N')`;
        conn.query(sql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (index === length - 1) res.send({
                status: 200,
                success: true,
                message: '添加成功',
                data: null
            })
        })
    })
  }
}