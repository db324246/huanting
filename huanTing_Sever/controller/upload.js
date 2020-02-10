const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')
const qnUpload = require('../qnUpload/index.js')

module.exports = {
  Upload: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    qnUpload.upImg(req, result => {
      if (result.status === 500) return res.send({
        status: 500,
        error: true,
        message: result.msg,
        data: null
      })

      res.send({
        status: 200,
        success: true,
        message: '上传成功',
        data: result.data
      })
    })
  }
}