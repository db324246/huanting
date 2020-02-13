const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
  // 用户列表
  userList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body

    let searchFlag = false
    let where = ``

    if (selectObj.userName) {
      where += `u.name like '%${selectObj.name}%'`
      searchFlag = true
    }

    const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

    let checkListSql = `SELECT * FROM users u
    WHERE ${where}`

    if (!searchFlag) {
      checkListSql += `
      LIMIT ${startNum}, ${selectObj.pageSize}`
    }

    const checkCountSql = 'SELECT count(id) count FROM users where disabled = "N"'

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
  // 用户禁用/解禁
  userDisabled: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const ids = req.query.ids;
    const disabled = req.query.disabled;
    const sql = `update users set disabled = '${disabled}' where id in (${ids})`;

    conn.query(sql, err => {
      if (err) return res.send({
        status: 500,
        error: true,
        message: err.message,
        data: null
      })

      res.send({
        status: 200,
        success: true,
        message: '操作成功',
        data: null
      })
    })
  }
}