const {
    src,
    dest,
    series,
    parallel,
    watch
} = require('gulp');

const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');




// 搬家
function copy(){
    return src(['*.html' , '*.js' , '!main.js' , '**/*.scss']).pipe(dest('dist'))
}
//  過去檔案會有index about gulpfile 不會有main.js

exports.m = copy;

//圖片打包
function img_copy(){
    return src(['src/images/*.*' , 'src/images/**/*.*']).pipe(dest('dist/images'))
}

//css 壓縮




function minijs(){
 return  src('js/*.js')
    .pipe(uglify())
    .pipe(dest('dist/js'))
}
exports.js = minijs;



// sass 編譯
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

function styleSass() {
    return src('src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))//編譯scss
        // .pipe(cleanCSS())// minify css
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(dest('./dist/css'));
}

exports.style = styleSass;


//html template
const fileinclude = require('gulp-file-include');

function includeHTML() {
    return src(['./src/*.html' , './src/layout/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('./dist'))
}


exports.html = includeHTML;

function watchfile(){
   watch(['*.html' , 'layout/*.html'], includeHTML);
   watch(['sass/*.scss' , 'sass/**/*.scss'], styleSass);
//    watch('js/*.js' , minijs);
}
exports.w = watchfile;


//同步瀏覽器
const browserSync = require('browser-sync');
const reload = browserSync.reload;


function browser(done) {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "index.html"
        },
        port: 3000
    });
    watch(['src/*.html' , 'src/layout/*.html'], includeHTML).on('change' , reload)
    watch(['src/sass/*.scss' , 'src/sass/**/*.scss'], styleSass).on('change' , reload)
    watch(['src/images/*.*' , 'src/images/**/*.*'], img_copy).on('change' , reload)
    watch('src/js/*.js', minijs).on('change' , reload)
    done();
}

exports.default = browser;


//壓縮圖片
const imagemin = require('gulp-imagemin');

function min_images(){
    return src('src/images/*.*')
    .pipe(imagemin([
        imagemin.mozjpeg({quality: 70, progressive: true}) // 壓縮品質      quality越低 -> 壓縮越大 -> 品質越差 
    ]))
    .pipe(dest('dist/images'))
}


exports.pic = min_images


// es6 -> es5
const babel = require('gulp-babel');

function babel5() {
    return src('js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('dist/js'));
}


exports.es = babel5;


//清除舊檔案
const clean = require('gulp-clean');

function clear() {
  return src('dist' ,{ read: false ,allowEmpty: true })//不去讀檔案結構，增加刪除效率  / allowEmpty : 允許刪除空的檔案
  .pipe(clean({force: true})); //強制刪除檔案 
}

exports.c = clear;







//開發用
exports.dev = series(parallel(includeHTML , styleSass , minijs , img_copy) , browser);



//上線用
exports.online = series(clear ,parallel(includeHTML , styleSass , babel5 , min_images))
















