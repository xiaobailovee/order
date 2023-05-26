var model = require('./model.js');
var ejs = require('ejs');
var url = require('url');
var redirect = require('./redirect.js');
var fs = require('fs');
var querystring = require('querystring');

module.exports.list = function (request, response) {  //订单列表加载
    model.getAll(function (result) {                  //调用model中getAll函数    
        var context = {                               //从数据库中查找数据并用回调函数返回结果
            orders: result                            //返回的结果result为对象格式，赋值给orders
        };                                                                  
        var fpath = './views/list.ejs';               //页面路径
        ejs.renderFile(fpath, context, function (err, str) {       //ejs渲染引擎，将数据渲染在页面上
            if (err) {
                return console.log(err.message);
            }
            response.end(str);
        });
    })
}

module.exports.userInformation = function (request, response) {    //用户列表加载，原理与订单列表加载相同
    model.getUsersAll(function (result) {                          
        var context = {                                            
            user: result
        };
        var fpath = './views/userlist.ejs';
        ejs.renderFile(fpath, context, function (err, str) {

            if (err) {
                return console.log(err.message);
            }
            response.end(str);
        });
    })
}

module.exports.search = function (request, response) {  //搜索功能模块
    var urlobj = url.parse(request.url, true);          //解析请求
    var searchBy = urlobj.query.searchBy;               //获取请求中的搜索请求
    var keywords = urlobj.query.keywords;               //获取请求的值
    model.getByField(searchBy, keywords, function (result) {    //调用model模块，进入数据库查询结果
        var context = {                                         //回调函数返回结果
            orders: result
        };
        fpath = './views/list.ejs';                             //ejs渲染路径
        ejs.renderFile(fpath, context, function (err, str) {
            if (err) {
                return console.log(err.message);
            }
            response.end(str);
        });
    });
}

module.exports.delete = function (request, response) {  //删除功能模块
    var urlobj = url.parse(request.url, true);          //解析请求
    var order_number = urlobj.query.order_number;       //获取订单编号，赋值给order_number
    model.deleteById(order_number, function () {        //调用model删除模块删除数据库中的订单信息
        redirect('list', response);                     //回调函数返回list页面
    });
}

module.exports.renderFile = function (fpath, request, response) {  //读文件功能模块
    fs.readFile(fpath, function (err, data) {
        if (err) {
            response.end('404');
            return;
        }
        response.end(data);
    })
}

module.exports.addinformation = function (request, response) {  //插入订单信息功能模块
    var data = '';                                              
    request.on('data', function (chunk) {                       
        data += chunk;                                          //收集提交的信息
    });
    request.on('end', function () {                             //由于需要对两个表进行操作，而提交的信息是关于订单的所有信息，所以将提交的信息分割开，分别进行数据库操作
        const information = querystring.parse(data);            //nodejs内置的querystring模块，将字符串形式的参数解析为一个对象
        const order = Object.assign({}, information);           //定义空对象order并将information对象复制给order
        delete order.address;                                   //删除多余的属性，便于数据库执行sql语句
        delete order.number;                         

        const user = Object.assign({}, information);            //与上同理
        delete user.order_number;
        delete user.express_number;
        delete user.time;
        delete user.goods;
        delete user.logistics;
        delete user.logistics_company;
        delete user.user;
        // console.log(order);
        // console.log(user);
        model.insertOrder(order, user, function () {            //调用model.insertOrder进行数据库操作
            console.log('信息插入完毕')
            redirect('list', response);
        });
    });
}

var outid;

module.exports.getUpdate = function (request, response) {  //修改订单功能，获取指定订单信息，进行修改
    var urlobj = url.parse(request.url, true);  //解析请求，分析出请求的订单号
    var order_number = urlobj.query.order_number;
    outid = order_number;
    model.searchByOrder_number(order_number, function (result1, result2) {  //调用model.searchByOrder查询，回调函数返回结果
        var context = {
            order: result1,
            user: result2
        };
        console.log(context);
                                                //结果作为参数传入ejs.renderFile方法，
        ejs.renderFile('./views/modify.ejs', context, function (err, str) {  //ejs将结果渲染到页面
            if (err) {
                return console.log(err.message);
            }
            response.end(str);
        });
    });
}

module.exports.postUpdate = function (request, response) {      //订单修改完成，根据提交的数据进行数据库操作
    var data = '';                                              //订单修改完成，获取提交的信息
    request.on('data', function (chunk) {                       //收集到字符串格式的信息
        data += chunk;
    });

    request.on('end', function () {                             //由于需要对两个表进行操作，而提交的信息是关于订单的所有信息，所以将提交的信息分割开，分别进行数据库操作
        const information = querystring.parse(data);            //nodejs内置的querystring模块，将字符串形式的参数解析为一个对象
        const order = Object.assign({}, information);           //定义空对象order并将information对象的内容复制给order
        delete order.address;
        delete order.number;                                    //删除多余属性

        const user = Object.assign({}, information);            //与上同理
        delete user.order_number;
        delete user.express_number;
        delete user.time;
        delete user.goods;
        delete user.logistics;
        delete user.logistics_company;
        delete user.user;
        console.log(order);
        console.log(user);                                      //测试用，打印对象结果 
        model.updateInformation(order, user, function () {      //调用模块进行数据更新操作
            console.log('信息更新完毕')
            redirect('list', response);
        });
    });
}

// module.exports.login = function (request, response) {
//     var data = '';
//     request.on('data', function (chunk) {
//         data += chunk;
//     });
//     request.on('end', function () {
//         var username = querystring.parse(data).username;
//         var pwd = querystring.parse(data).pwd;
//         model.checkAdmin(username, pwd, function (result) {
//             if (result.length == 0) {
//                 redirect('/', response);
//             } else {
//                 redirect('/list', response);
//             }
//         })
//     });
// }