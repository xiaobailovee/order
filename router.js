var fs = require('fs');
var path = require('path');
var handler = require('./handler.js');

module.exports = function (request, response) {
    if (request.url == '/list.html' || request.url == '/list') {  //列表加载
        handler.list(request, response);
    }
    else if (request.url.indexOf('/public/') !== -1) {  //静态资源加载
        var fpath = '.' + request.url;
        handler.renderFile(fpath, request, response);
    }
    else if (request.url.startsWith('/search')) {  ////////查询订单功能
        handler.search(request, response);          //思路：根据请求解析提交的查询的属性和值，数据库进行查询并返回结果，使用ejs模板引擎渲染到前端页面
    }
    else if (request.url.startsWith('/del')) {  //删除订单功能
        handler.delete(request, response);      //思路：解析请求，获取删除订单的订单编号，数据库删除后返回list页面
    }
    else if (request.url == '/login.html' || request.url == '/login' || request.url == '/') {    //////登录页面加载
        var fpath = './views/login.html'
        handler.renderFile(fpath, request, response);
    }
    else if (request.url == '/add.html' && request.method == 'GET') {  /////新增订单功能
        var fpath = './views/add.html';        //思路：获取表单提交的数据并解析，由于是2个表，需将数据分割后再分别进行数据库插入操作，同时判断用户是否已存在和订单是否重复
        handler.renderFile(fpath, request, response);
    }
    else if (request.url == '/add.html' && request.method == 'POST') { /////获取新增提交提交请求
        handler.addinformation(request, response);
    }
    else if (request.url.startsWith('/update') && request.method == 'GET') {  //修改订单信息功能，获取请求
        handler.getUpdate(request, response);       //思路：获取需修改的订单的订单编号，数据库进行查询结果，ejs将结果渲染到页面，便于进行下一步修改
    }
    else if (request.url == '/update' && request.method == 'POST') {  //获取修改提交的信息内容
        handler.postUpdate(request, response);      //获取表单提交的数据并解析，将数据分割后再分别进行数据库信息更新操作
    }
    else if(request.url=='/userlist'||request.url=='/userlist.html'){  //用户列表加载
        handler.userInformation(request,response);
    }
    // else if (request.url == '/login') {
    //     handler.login(request, response);
    // }
}