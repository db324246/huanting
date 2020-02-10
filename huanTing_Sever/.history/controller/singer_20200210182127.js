const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
  // 歌手分类列表
  singerCateList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const sql = 'select sc.id, sc.title from singer_cate sc';
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
            data: result
        })
    })
  },
  // 全部歌手列表
  singerList: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body

    let searchFlag = false

    let where = `s.isDelete = 'N'`
    if (selectObj.cateId) {
        where += ` and s.cateId = ${selectObj.cateId}`;
    }
    if (selectObj.name) {
        where += ` and s.name like '%${selectObj.name}%'`;
        searchFlag = true;
    }

    const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize;

    let checkListSql = `SELECT s.name, s.id, s.describtion, s.imageSrc, s.cateId FROM singers s WHERE ${where}
    order by s.id desc `;

    if (!searchFlag) {
        checkListSql += `
        LIMIT ${startNum}, ${selectObj.pageSize}`;
    }        

    let checkCountSql = 'SELECT count(id) count FROM singers where isDelete = "N"';

    if (selectObj.cateId) {
        checkCountSql += ` and cateId = ${selectObj.cateId}`;
    }

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
  // 新增歌手
  addSinger: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return
    
    const singerForm = req.body
    const checkSingerSql = `SELECT s.id, s.name from singers s where s.name = '${singerForm.name}' and s.isDelete='N'`

    conn.query(checkSingerSql, (err, result) => {
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
                message: '歌手已存在',
                data: null
            })
        }
         

        let sql = 'INSERT INTO singers set ?'

        conn.query(sql, singerForm, (err, result) => {
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
  // 歌手删除
  deleteSinger: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const ids = req.query.ids

    const sql = `UPDATE singers set isDelete = 'Y' WHERE id in (${ids})`

    conn.query(sql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })
        
        const deleteMcSql = `UPDATE musicsongs set singerId = 0, singerName = '未知歌手' WHERE singerId in (${ids})`;

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
  // 歌手更新
  updataSinger: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const singer = req.body
    const checkSingerSql = `SELECT s.id, s.name from singers s where s.name = '${singer.singerName}' and s.isDelete='N'`

    conn.query(checkSingerSql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })

        if (result.length > 1 || result.length === 1 && result[0].id !== singer.id ) {
            return res.send({
                status: 500,
                error: true,
                message: '歌手已存在',
                data: null
            })
        }

        const sql = `UPDATE singers s set s.name = '${singer.name}', s.describtion = '${singer.describtion}', s.imageSrc = '${singer.imageSrc}', s.cateId = ${singer.cateId} WHERE s.id = ${singer.id}`
        
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
  // 歌手详情 - 专辑列表
  singerDetail: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const selectObj = req.body;
    const checkSingerSql = `SELECT s.id, s.name, s.describtion, s.imageSrc from singers s where s.id = '${selectObj.singerId}'`

    conn.query(checkSingerSql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })

        const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

        let checkAlbum = `SELECT id, album, albumArt, albumDesc from music_album where singerId = ${selectObj.singerId} and isDelete = 'N' LIMIT ${startNum}, ${selectObj.pageSize}`;

        conn.query(checkAlbum, (err, _result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            const sql = `SELECT count(id) count FROM music_album where isDelete = "N" and singerId = ${selectObj.singerId}`;

            conn.query(sql, (err, _resultA) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })

                res.send({
                    status: 200,
                    success: true,
                    message: '查询成功',
                    data: {
                        singerId: result[0].id,
                        singerName: result[0].name,
                        describtion: result[0].describtion,
                        imageSrc: result[0].imageSrc,
                        albumList: _result,
                        total: _resultA[0].count
                    }
                })
            })
        })
    })
  },
  // 专辑新增
  addAlbum: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const album = req.body;
    const checkAlbumSql = `select * from music_album where singerId = ${album.singerId} and album = '${album.album}'`;

    conn.query(checkAlbumSql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })

        if (result.length !== 0) return res.send({
            status: 500,
            error: true,
            message: '专辑已存在',
            data: null
        })

        const sql = 'insert into music_album set ?';
        conn.query(sql, album, err => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            res.send({
                status: 200,
                message: '新建成功',
                success: true,
                data: null
            })
        })
    })
  },
  // 专辑更新
  updateAlbum: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const album = req.body;
    const checkAlbumSql = `select * from music_album where singerId = ${album.singerId} and album = '${album.album}'`;

    conn.query(checkAlbumSql, (err, result) => {
        if (err) return res.send({
            status: 500,
            error: true,
            message: err.message,
            data: null
        })

        if (result.length === 1 && result[0].id !== album.id || result.length > 1 ) return res.send({
            status: 500,
            error: true,
            message: '专辑已存在',
            data: null
        })

        const sql = `update music_album set album = '${album.album}', albumArt = '${album.albumArt}', albumDesc = '${album.albumDesc}' where id = ${album.id}`;
        conn.query(sql, album, err => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            res.send({
                status: 200,
                message: '更新成功',
                success: true,
                data: null
            })
        })
    })
  },
  // 专辑删除
  deleteAlbum: (req, res) => {
    const user = checkToken(req, res);
    if (!user) return

    const ids = req.query.ids

    const sql = `update music_album set isDelete = 'Y' where id in (${ids})`;

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
            message: '删除成功',
            data: null
        })
    })
  }
}