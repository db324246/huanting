const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
  // 歌曲一级分类
  categories: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const sql = 'SELECT * FROM categories'

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
        message: '获取歌曲一级分类',
        data: result
      })
    })
  },
  // 二级分类列表
  categoryList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body

    let searchFlag = false
    let where = `sc.cateId = ${selectObj.cateId} and sc.isDelete = 'N'`

    if (selectObj.title) {
        where += ` and sc.title like '%${selectObj.title}%'`
        searchFlag = true
    }

    const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

    let checkListSql = `SELECT * FROM sec_category sc WHERE ${where}`

    if (!searchFlag) {
        checkListSql += `
        LIMIT ${startNum}, ${selectObj.pageSize}`
    }        

    const checkCountSql = `SELECT count(id) count FROM sec_category where cateId = ${selectObj.cateId} and isDelete = "N"`
    
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
  // 二级分类删除
  deleteCategory: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const ids = req.query.ids

    const sql = `UPDATE sec_category set isDelete = 'Y' WHERE id in (${ids})`

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
      const deleteMcSql = `UPDATE cate_music_conn set isDelete = 'Y' WHERE scateId in (${ids})`;

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
  // 二级分类更新
  updataCategory: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const category = req.body
    const checkTitleSql = `SELECT * from sec_category sc where sc.title = '${category.title}' and sc.cateId = ${category.cateId} and sc.isDelete='N'`

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
          message: '分类已存在',
          data: null
        })
      }

      const sql = `UPDATE sec_category sc set sc.title='${category.title}', sc.describtion='${category.describtion}' WHERE sc.id = ${category.id}`
      
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
  // 新增二级分类
  addCategory: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return
    
    const category = req.body
    const checkTitleSql = `SELECT * from sec_category sc where sc.title = '${category.title}' and sc.cateId = ${category.cateId} and sc.isDelete='N'`

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
          message: '分类已存在',
          data: null
        })
      }
        

      let sql = `INSERT INTO sec_category VALUES(null, '${category.title}', '${category.describtion}', ${category.cateId}, 'N');`

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
          message: '新增成功',
          data: null
        })
      })
    })
  },
  // 分类歌曲列表
  categoryMusicList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body

    const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

    let checkListSql = `SELECT cm.id, m.id musicId, m.title, m.singerName, m.album FROM cate_music_conn cm
    RIGHT JOIN musicsongs m ON cm.musicId = m.id
    WHERE cm.scateId = ${selectObj.scateId} and cm.isDelete = 'N'
    LIMIT ${startNum}, ${selectObj.pageSize}`
    
    const checkCountSql = `SELECT COUNT(cm.id) count FROM cate_music_conn cm
    WHERE cm.scateId = ${selectObj.scateId} and cm.isDelete = 'N'`

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
            musicList: result,
            total: _result[0].count
          }
        })
      })
    })
  },
  // 分类歌曲新增
  categoryAddMusic: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return
    
    const scateId = req.body.scateId
    const musicIds = req.body.musicIds

    const checkMusicSql = `SELECT cm.id from cate_music_conn cm where cm.scateId = ${scateId} and cm.musicId = ?`;
    const addMusicSql = `INSERT INTO cate_music_conn set ?`;

    const length = musicIds.length;

    for (let i = 0; i < length; i++) {
      const id = musicIds[i];
      console.log(id)
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
            message: '新增成功',
            data: null
          })
        }

        const musicObj = {
          scateId,
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
  // 分类歌曲移除
  categoryRemoveMusic: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return
    
    const scateId = req.body.scateId;
    const musicIds = req.body.musicIds;

    const sql = `DELETE from cate_music_conn WHERE scateId = ${scateId} and musicId in (${musicIds})`

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