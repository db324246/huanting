const conn = require('../connection/connection.js')

const checkToken = function(req, res) {
  const token = req.headers.authorization
  const userInfo = req.session.userInfo

  if (!token) {
    res.send({
        status: 402,
        message: '用户未登录，请先登录',
        error: true,
        data: null
    })
    return undefined
  }

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

module.exports = checkToken;