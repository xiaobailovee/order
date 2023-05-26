var mysql = require('mysql');
var config = require('./config.js');

var connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    dateStrings: true
});

connection.connect(function (err) {
    if (err) {
        return console.log(err.message);
    }
    console.log('连接数据库成功');
});

module.exports.getAll = function (callback) {       //获取所有的订单信息
    var sql = 'select*from orders';                 //sql语句
    connection.query(sql, function (err, result) {  //执行sql语句
        if (err) {                                  
            console.log(err);
        } else {
            callback(result);                       //回调函数返回查询结果
        }
    });
}

module.exports.getUsersAll = function (callback) {  //获取所有的用户信息
    var sql = 'select*from user';                   //sql语句
    connection.query(sql, function (err, result) {  //执行sql语句
        if (err) {
            console.log(err);
        } else {
            callback(result);                       //回调函数返回查询结果
        }
    });
}

module.exports.getByField = function (fieldName, value, callback) {   //根据指定的条件查询信息，第一个参数为条件，第二个参数为值，第三个参数是返回结果的回调函数
    var sql = 'select*from orders where ?? = ?';                      //sql语句，‘？’为占位符，
    connection.query(sql, [fieldName, value], function (err, result) {  //执行sql语句，第二个参数中的值会替换掉sql语句中的‘？’
        if (err) {
            return console.log(err);
        } else {
            callback(result);                                           //回调函数返回结果
        }
    });
}

module.exports.deleteById = function (id, callback) {                 //根据传来的订单编号进行删除
    var sql = 'delete from orders where order_number = ?';             
    connection.query(sql, [id], function (err, result) {            //链接数据库根据订单编号进行删除
        if (err) {
            return console.log(err.message);
        } else {
            callback();
        }

    });
}

module.exports.insertOrder = function (order, user, callback) {  //第一个参数包含订单信息，第二个参数为用户信息                                   
    var sql = 'insert into orders set ?';
    connection.query(sql, order, function (err, result) {        //执行sql语句，将订单信息插入，订单编号为主键，不允许有相同订单编号的订单
        if (err) {
            return console.log(err.message);
        }
        var sql = 'select*from user where number=?';            //插入用户信息时，先判断用户是否存在
        connection.query(sql, user.number, function (err, result) { //根据用户号码进行查询
            if (result != {}) {                                       //若是返回结果不为空，则该用户已经存在，插入停止
                return console.log('该用户已存在'); 
                callback();
            } else {
                var sql = 'insert into user set ?';                   //若是不存在，则将该用户信息插入
                connection.query(sql, user, function (err, result) {
                    if (err) {
                        return console.log(err.message);
                    }
                    callback();
                });
            }
        });
    });
}


module.exports.searchByOrder_number = function (order_number, callback) {   //订单信息修改，查询订单信息功能
    var sql = 'select*from orders where order_number = ?';           
    connection.query(sql, [order_number], function (err, result1) {  //根据订单编号值找出该订单信息，结果存入result1
        if (err) {
            return console.log(err.message);
        }
        var userName = result1[0].name;                               //通过用户表和订单表的联系，查询指定用户信息
        delete result1[0].name;
        var sql = 'select*from user where name = ?';
        connection.query(sql, [userName], function (err, result2) {  //根据找出该用户信息，结果存入result2
            if (err) {
                return console.log(err.message);
            }
            callback(result1, result2);                             //回调函数返回结果，使用ejs模板进行渲染
        });
    });
}

module.exports.updateInformation = function (order, user, callback) {   //订单信息修改，进入数据库对提交的信息进行修改
    var sql = 'update orders set ? where order_number = ?';              //第一个参数为订单信息，第二个参数为用户信息，第三个参数为回调函数
    connection.query(sql, [order, order.order_number], function (err, result) {  //执行sql语句对订单信息进行修改
        if (err) {
            return console.log(err.message);
        }
        var sql = 'update user set ? where name = ?';
        connection.query(sql, [user, user.name], function (err, result) {         //执行sql语句对用户信息进行修改
            if (err) {
                return console.log(err.message);
            }
            callback(result);
        });
    });
}

// module.exports.checkAdmin = function (username, pwd, callback) {
//     var sql = 'select*from admin where username= ? and password= ?';
//     connection.query(sql, [username, pwd], function (err, result) { //链接数据库进行信息更新
//         if (err) {
//             return console.log(err.message);
//         }
//         callback(result);
//     });
// };