const conn = require('../connection/connection.js')

const randMusic = function (reslove) {
  const randSql = `select id musicId, title, singerName, singerId, musicSrc, album from musicsongs WHERE isDelete = 'N' order by rand() limit 15`;

  conn.query(randSql, (err, result) => {
    if (err) return reslove({
      error: true,
      message: err.message
    })
    const length = result.length
    const emptySql = 'truncate table recommend'

    conn.query(emptySql, err => {
      if (err) return reslove({
        error: true,
        message: err.message
      })

      result.forEach((item, index) => {
        const sql = 'INSERT INTO recommend SET ?';
  
        conn.query(sql, item, (err, _result) => {
          if (err) return reslove({
            error: true,
            message: err.message
          })
          if (index === length - 1) return reslove({
            success: true,
            musicList: result
          })
        })
      })
    })
  })
}

module.exports = randMusic