const conn = require('../connection/connection.js')
const checkToken = require('./checkToken.js')

module.exports = {
    // 歌曲列表
    musicList: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const selectObj = req.body

        let searchFlag = false
        let where = `m.isDelete = 'N'`

        if (selectObj.title) {
            where += ` and m.title like '%${selectObj.title}%'`
            searchFlag = true
        }

        if (selectObj.singerName) {
            where += ` and m.singerName like '%${selectObj.singerName}'%`
            searchFlag = true
        }

        const startNum = (selectObj.pageNumber - 1) * selectObj.pageSize

        let checkListSql = `SELECT m.id, m.title, m.singerName, m.singerId, m.musicSrc, m.musicLrc, m.album, ma.albumArt FROM musicsongs m 
        left join music_album ma on ma.id = m.albumId 
        WHERE ${where} order by m.id desc`

        if (!searchFlag) {
            checkListSql += `
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
    // 歌手查询
    checkSinger: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const singerName = req.query.singerName
        const checkSingerSql = `SELECT s.id, s.name from singers s where s.name = '${singerName}'`

        conn.query(checkSingerSql, (err, result) => {
            if (err) return res.send({
                status: 500,
                error: true,
                message: err.message,
                data: null
            })

            if (result.length === 0) {
                const addSingerSql = `INSERT INTO singers(NAME) VALUES('${singerName}')`;

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

                        res.send({
                            status: 200,
                            success: true,
                            message: '新建歌手成功',
                            data: {
                                singerId: _resultA[0].id,
                                albumList: []
                            }
                        })
                    })
                })
            } else {
                const checkAlbum = `SELECT id, album, albumArt from music_album where singerId = '${result[0].id}'`;

                conn.query(checkAlbum, (err, resultA) => {
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
                            albumList: resultA
                        }
                    })
                })
            }
        })
    },
    // 新增曲目
    addMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return
        
        const musicForm = req.body

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
    },
    // 歌曲更新
    updataMusic: (req, res) => {
        const user = checkToken(req, res);
        if (!user) return

        const music = req.body
        const sql = `UPDATE musicsongs m set m.singerId=${music.singerId}, m.singerName = '${music.singerName}', m.title = '${music.title}', m.musicSrc = '${music.musicSrc}', m.musicLrc = '${music.musicLrc}', m.album = '${music.album}' WHERE m.id = ${music.id}`
        
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
            // 歌曲与歌单、歌曲与分类 的中间表
            const deleteMcSql = `UPDATE music_connection set isDelete = 'Y' WHERE musicId in (${ids})`;
            const deleteCmSql = `UPDATE cate_music_conn set isDelete = 'Y' WHERE musicId in (${ids})`;

            conn.query(deleteMcSql, (err, result) => {
                if (err) return res.send({
                    status: 500,
                    error: true,
                    message: err.message,
                    data: null
                })
                conn.query(deleteCmSql, (err, result) => {
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
        })
    },
}