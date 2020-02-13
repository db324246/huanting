const express = require('express');

const app = express();

// body中间件
const body = require("body-parser");
app.use(body.urlencoded({ extended: false }));
app.use(body.json());

// 允许跨域请求
const cors = require('cors');
app.use(cors({
    origin:['http://localhost:8080'],
    methods:['GET','POST'],
    alloweHeaders:['Conten-Type', 'authorization']
}));

// session 存储用户登录信息
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(cookieParser('sessiontest'))
app.use(session({
    name: 'token',
    secret: 'sessiontest',
    cookie: { maxAge: 60 * 60 * 1000, secure: false },
    resave: false,
    saveUninitialized: true
}))

// 接受路由
const router = require('./router/index.js');
app.use(router);

// app.listen(3000, '192.168.0.107', () => {
// app.listen(3000, '192.168.199.141', () => {
//     console.log('服务器已启动~~~')
// })
const randMusic = require('./controller/recommend.js')
app.listen(3000, '192.168.199.141', () => {
    console.log('服务器已启动~~~')
    const rand = function () {
        const p = new Promise(reslove => {
            randMusic(reslove)
        })
        return p
    }
    
    rand().then(data => {
        if (data.success) console.log('刷新今日推荐')
    })
})