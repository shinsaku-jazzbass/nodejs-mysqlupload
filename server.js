const express = require("express");
const { engine } = require('express-handlebars');
const fileUpload = require('express-fileupload');
const app = express();
const mysql = require("mysql");
const path = require("path");


const PORT = 5004;

let imgData = "";
let imgtitle = '';
let fileextension = '';
let rowsarr =  [];

app.use(express.static("upload"));
app.use(express.static("public"));

app.use(fileUpload());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "test_db",
});






app.get('/', (req, res) => {
    pool.getConnection((err,connection) =>{
        if(err) throw err
        console.log("mysqlに接続されました。");
        connection.query("SELECT * FROM image ORDER BY id DESC",(err,rows) =>{
            connection.release();
            //console.log(rows);
            if(!err){
                rowsarr = rows;
            }
        })
    });
    console.log(rowsarr);
    if(imgData != '' & fileextension == '.jpg'){
        res.render('home',{
            img2: "abc",
            img: imgData,
            memo: imgtitle,
            rows: rowsarr
        });
    }else if(fileextension == '.pdf'){
        res.render('home',{
            img3: "ok",
            img: imgData,
            memo: imgtitle,
            rows: rowsarr
        });
    }else{
        res.render('home',{
            img3: "ok",
            img: imgData,
            memo: imgtitle,
            rows: rowsarr
        });
    }
    //res.redirect();
});

app.post('/', (req, res) => {
    if(!req.files){
        //return res.status(400).send("何もアップロードされませんでした。");
        imgData = '';
        res.redirect("/");
    }
    console.log(req.body.memo);
    imgtitle = req.body.memo;
    let imageFile = req.files.imageFile;
    let uploadPath = __dirname + "/upload/" + imageFile.name;
    imgData = imageFile.name;
    fileextension = path.extname(imageFile.name);
    console.log(fileextension);
    //サーバに画像ファイルを置く場所を指定
    imageFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
        //res.send("画像アップロードにせいこうしました。");
        //res.redirect("/");
    });
    pool.getConnection((err,connection) =>{
        if(err) throw err
        console.log("mysqlに接続されました。");
        connection.query(`INSERT INTO image (imageName,memo)VALUES('${imageFile.name}','${imgtitle}')`,(err,rows) =>{
            connection.release();
            //console.log(rows);
            if(!err){
                res.redirect("/");
            }else{
                console.log(err);
            }
        })
    });
    //res.redirect();
})

app.get('/home2', (req, res) => {
    res.render('home2');
});

// app.get("/", (req,res) =>{
//     res.send("<h1>Hello Wxpress!!");
// })

app.listen(PORT, () => console.log("サーバ起動中！！"));
