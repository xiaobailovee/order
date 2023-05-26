module.exports=function(path,response){
    response.statusCode = 302;
    response.setHeader('Location', path);
    response.end();
}