const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
  // 歌单列表
  songListList: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return

      const selectObj = req.body

      let searchFlag = false
      let where = `sl.isDelete = 'N'`

      if (selectObj.title) {
          where += ` and sl.title like '%${selectObj.title}%'`
          searchFlag = true
      }

      const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

      let checkListSql = `SELECT * FROM songList sl WHERE ${where}`

      if (!searchFlag) {
          checkListSql += `
          LIMIT ${startNum}, ${selectObj.pageSize}`
      }        

      const checkCountSql = 'SELECT count(id) count FROM songList where isDelete = "N"'
      
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
  // 歌单删除
  deleteSongList: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return

      const ids = req.query.ids

      const sql = `UPDATE songList set isDelete = 'Y' WHERE id in (${ids})`

      conn.query(sql, (err, result) => {
          if (err) return res.send({
              status: 500,
              error: true,
              message: err.message,
              data: null
          })
          const deleteMcSql = `UPDATE music_connection set isDelete = 'Y' WHERE listId in (${ids})`;

          conn.query(deleteMcSql, (err, result) => {
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
  // 歌单更新
  updataSongList: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return

      const songList = req.body
      const checkTitleSql = `SELECT sl.id, sl.title from songList sl where sl.title = '${songList.title}' and sl.isDelete='N'`

      conn.query(checkTitleSql, (err, result) => {
          if (err) return res.send({
              status: 500,
              error: true,
              message: err.message,
              data: null
          })

          if (result.length > 1 ) {
              return res.send({
                  status: 500,
                  error: true,
                  message: '歌单已存在',
                  data: null
              })
          }

          const sql = `UPDATE songList sl set sl.title='${songList.title}', sl.describtion='${songList.describtion}', sl.imageSrc='${songList.imageSrc}' WHERE sl.id = ${songList.id}`
          
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
  // 新增歌单
  addSongList: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return
      
      const songList = req.body
      const checkTitleSql = `SELECT sl.id, sl.title from songList sl where sl.title = '${songList.title}' and sl.isDelete='N'`

      conn.query(checkTitleSql, (err, result) => {
          if (err) return res.send({
              status: 500,
              error: true,
              message: err.message,
              data: null
          })

          if (result.length !== 0) {
              return res.send({
                  status: 500,
                  error: true,
                  message: '歌单已存在',
                  data: null
              })
          }
            

          let sql = 'INSERT INTO songList set ?'
  
          conn.query(sql, songList, (err, result) => {
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
  // 歌单歌曲列表
  songListMusicList: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return

      const selectObj = req.body

      const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

      let checkListSql = `SELECT s.id, s.title sTitle, s.describtion, s.imageSrc, m.id mId, m.title, m.singerName, m.musicSrc, m.album FROM music_connection mc
      RIGHT JOIN musicsongs m ON mc.musicId = m.id
      LEFT JOIN songlist s ON s.id = mc.listId
      WHERE mc.listId = ${selectObj.id} and mc.isDelete = 'N'
      LIMIT ${startNum}, ${selectObj.pageSize}`
      
      const checkCountSql = `SELECT COUNT(m.id) count FROM music_connection mc
      RIGHT JOIN musicsongs m ON mc.musicId = m.id
      LEFT JOIN songlist s ON s.id = mc.listId
      WHERE mc.listId = ${selectObj.id} and mc.isDelete = 'N'`

      conn.query(checkListSql, (err, result) => {
          if (err) return res.send({
              status: 500,
              error: true,
              message: err.message,
              data: null
          })
          if (result.length === 0) {
              const sql = `select * from songlist where id = ${selectObj.id}`

              conn.query(sql, (err, _result) => {
                  if (err) return res.send({
                      status: 500,
                      message: err.message,
                      error: true,
                      data: null
                  })

                  res.send({
                      status: 200,
                      success: true,
                      message: '获取成功',
                      data: {
                          slId: _result[0].id,
                          slTitle: _result[0].title,
                          slDesc: _result[0].describtion,
                          slImage: _result[0].imageSrc,
                          musicList: [],
                          total: 0
                      }
                  })
              })
          } else {
              let records = [];
              result.forEach(item => {
                  records.push({
                      id: item.mId,
                      title: item.title,
                      singerName: item.singerName,
                      musicSrc: item.musicSrc,
                      album: item.album,
                  })
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
                          slId: result[0].id,
                          slTitle: result[0].sTitle,
                          slDesc: result[0].describtion,
                          slImage: result[0].imageSrc,
                          musicList: records,
                          total: _result[0].count
                      }
                  })
              })
          }
      })
  },
  // 歌单歌曲新增
  songListAddMusic: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return
      
      const listId = req.body.listId
      const musicIds = req.body.musicIds

      const checkMusicSql = `SELECT mc.id from music_connection mc where mc.listId = ${listId} and mc.musicId = ?`;
      const addMusicSql = `INSERT INTO music_connection set ?`;

      const length = musicIds.length;
      let completeFlag = false;
      for (let i = 0; i < length; i++) {
          const id = musicIds[i];

          conn.query(checkMusicSql, id, (err, result) => {
              if (err) return res.send({
                  status: 500,
                  error: true,
                  message: err.message,
                  data: null
              })
              
              if (result.length !== 0) {
                  if (i < length - 1) return
                  else return res.send({
                      status: 200,
                      success: true,
                      message: '添加成功',
                      data: null
                  })
              }

              const musicObj = {
                  listId,
                  musicId: id
              };

              conn.query(addMusicSql, musicObj, (err, _result) => {
                  if (err) return res.send({
                      status: 500,
                      error: true,
                      message: err.message,
                      data: null
                  })

                  if (i === length - 1) res.send({
                      status: 200,
                      success: true,
                      message: '新增成功',
                      data: null
                  })
              })
          })
          
      }
  },
  // 歌单歌曲移除
  songListRemoveMusic: (req, res) => {
      const user = checkToken(req, res);
      if (!user) return
      
      const listId = req.body.listId;
      const musicIds = req.body.musicIds;

      const sql = `DELETE from music_connection WHERE listId = ${listId} and musicId in (${musicIds})`

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
              message: '移除成功',
              data: null
          })
      })
  }
}