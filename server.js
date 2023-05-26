let http = require('http');
let fs = require('fs');
var ejs = require('ejs');
var url = require('url');
var querystring = require('querystring');

//////////////////////////连接数据库
var mysql = require('mysql');
const { log } = require('console');
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '237735',
    database: 'learn',
    dateStrings: true
});
connection.connect(function (err) {
    if (err) {
        return console.log(err.message);
    }
    console.log('连接数据库成功');
});

var outid = 0;

http.createServer(function (request, response) {
    // console.log("服务器收到请求");
    // console.log(url);
    //////////////员工列表展示
    if (request.url == '/list.html' || request.url == '/list') {
        var sql = 'select*from employee';
        connection.query(sql, function (err, result) {
            if (err) {
                return console.log(err.message);
            }
            var fpath = ('./views/list.ejs');
            var context = {
                employees: result
            }
            ejs.renderFile(fpath, context, function (err, str) {

                if (err) {
                    return console.log(err.message);
                }
                response.end(str);
            });
        });
    } else if (request.url.startsWith('/search')) {  ////////查询员工功能
        var urlobj = url.parse(request.url, true);
        var searchBy = urlobj.query.searchBy;
        var keywords = urlobj.query.keywords;
        fpath = './views/list.ejs';
        var sql = 'select*from employee where ?? = ?';
        connection.query(sql, [searchBy, keywords], function (err, result) {
            if (err) {
                return console.log(err);
            }
            var context = {
                employees: result
            };
            ejs.renderFile(fpath, context, function (err, str) {
                if (err) {
                    return console.log(err.message);
                }
                response.end(str);
            });
        })
    } else if (request.url == '/add.html' && request.method == 'GET') {  /////新增员工功能
        fpath = './views/add.html';
        fs.readFile(fpath, {}, function (err, str) {
            response.end(str);
        });
    } else if (request.url == '/add.html' && request.method == 'POST') { /////获取提交请求
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });
        request.on('end', function () {
            var employee = querystring.parse(data);
            // console.log(data);
            var sql = 'insert into employee set ?';
            connection.query(sql, employee, function (err, result) {
                if (err) {
                    return console.log(err.message);
                }
                response.statusCode = 302;
                response.setHeader('Location', 'list');
                response.end();
            });
        });
    } else if (request.url.startsWith('/del')) {   /////删除员工功能
        var urlobj = url.parse(request.url, true);  //获取请求
        var id = urlobj.query.id;   //获取id
        var sql = 'delete from employee where id = ?';
        connection.query(sql, [id], function (err, result) { //链接数据库根据id进行删除
            if (err) {
                return console.log(err.message);
            }
            response.statusCode = 302;
            response.setHeader('Location', 'list');
            response.end();
        });
    } else if (request.url == '/index.html' || request.url == '/') {
        fs.readFile('./views/index.html', function (err, data) {
            if (err) {
                return console.log('404');
            }
            response.end(data);
        })
    } else if (request.url.indexOf('/public/') !== -1) {
        fs.readFile('.' + request.url, function (err, data) {
            if (err) {
                response.end('404');
                return;
            }
            response.end(data);
        })
    } else if (request.url.startsWith('/update') && request.method == 'GET') {   /////修改员工信息功能
        var urlobj = url.parse(request.url, true);
        var id = urlobj.query.id;
        var sql = 'select*from employee where id = ?';
        outid = id;
        connection.query(sql, [id], function (err, result) {  //根据id值找出该用户信息
            if (err) {
                return console.log(err.message);
            }
            var context = {
                employee: result
            };
            ejs.renderFile('./views/modify.ejs', context, function (err, str) {  //ejs进行渲染
                if (err) {
                    return console.log(err.message);
                }
                response.end(str);
            })
        });
    } else if (request.url == '/update' && request.method == 'POST') {  //获取更新提交申请的信息
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', function () {
            var employee = querystring.parse(data);
            var sql = 'update employee set ? where id = ?';
            employee.id = outid;
            connection.query(sql, [employee, employee.id], function (err, result) { //链接数据库进行信息更新
                if (err) {
                    return console.log(err.message);
                }
                response.statusCode = 302;
                response.setHeader('Location', 'list');     //返回list页面
                response.end();
            });
        });
    } else if (request.url == '/login.html' || request.url == '/login') {
        fs.readFile('./views/login.html', function (err, data) {
            if (err) {
                return console.log('404');
            }
            response.end(data);
        })
    } else if (request.url.startsWith('/show')) {
        var urlobj = url.parse(request.url, true);  //获取请求
        var id = urlobj.query.id;   //获取id
        var sql = 'select*from employee where id = ?';
        connection.query(sql, [id], function (err, result) {  //根据id值找出该用户信息
            if (err) {
                return console.log(err.message);
            }
            var context = {
                employees: result
            };
            ejs.renderFile('./views/info.ejs', context, function (err, str) {  //ejs进行渲染
                if (err) {
                    return console.log(err.message);
                }
                response.end(str);
            })
        });
    }
}).listen(3000, function () {
    console.log('http://127.0.0.1:3000');
});