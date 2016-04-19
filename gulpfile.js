"use strict"; //показывать место ошибки в терминале

//создание переменных для вызова

var gulp = require('gulp'),
  wiredep = require('wiredep').stream,
  useref = require('gulp-useref'),    //склеивает css-, js-файлы и помещает всё в dist, в html надо поставить специальные комментарии для css и js
  uglify = require('gulp-uglify'),    //минифицирует js
  clean = require('gulp-clean'),      //для очистки папки dist перед пересборкой
  gulpif = require('gulp-if'),        //для установки условий
  filter = require('gulp-filter'),    //для фильтрования шрифтов
  size = require('gulp-size'),            //показывает размер сборки
  // imagemin = require('gulp-imagemin'),    //минификация изображений
  autoprefixer = require('gulp-autoprefixer'),  //добавляет префиксы
  minifyCss = require('gulp-clean-css'), //минификация файла css
  jade = require('gulp-jade'),
  sass = require('gulp-sass'),
  prettify = require('gulp-prettify'),
  browserSync = require('browser-sync'),  //для обновления страницы при разработке
  reload = browserSync.reload;

      ///////////
      //сборка //
      ///////////

//очистка папки
gulp.task('clean', function () {
  return gulp.src('dist')
    .pipe(clean());
});

//переносим html, css, js в папку dist
gulp.task('useref', function () {
  var assets = useref.assets();
    return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss({compability: 'ie8'})))
    .pipe(gulpif('*.css', autoprefixer({browsers: ['last 15 versions'],cascade: false})))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist')); //прописываем новые пути
});

//перенос шрифтов
gulp.task('fonts', function(){
  gulp.src('app/fonts/*')
    .pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
    .pipe(gulp.dest('dist/fonts/'));
});

//картинки
// gulp.task('images', function () {
//   return gulp.src('app/img/**/*')
//     .pipe(imagemin({
//       progressive: true,
//       interlaced:true
//     }))
//     .pipe(gulp.dest('dist/img'));
// });


//остальные файлы, такие как favicon  и пр.
gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ]).pipe(gulp.dest('dist'));
});

//сборка и вывод размера содержимого папки dist
gulp.task('dist', ['useref', /*'images',*/ 'fonts', 'extras'], function(){
  return gulp.src('dist/**/*').pipe(size({title:'build'}));
});


      /////////////////
      // Работа с APP//
      /////////////////

// Компилируем Jade в html
gulp.task('jade', function() {
  gulp.src('app/templates/pages/*.jade')
    .pipe(jade())
    .on('error', log)
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('app/'))
    .pipe(reload({stream: true}));
});

// Компилируем sass в css
gulp.task('sass', function(){
  gulp.src('app/scss/*.scss')
    .pipe(sass())
    .on('error', log)
    .pipe(gulp.dest('app/css'))
    .pipe(reload({stream: true}));
});

// Собираем папку DIST (только после компиляции Jade)
gulp.task('build', ['clean', 'jade'], function () {
  gulp.start('dist');
});

// Подключаем ссылки на bower components
gulp.task('wiredep', function () {
  gulp.src('app/templates/common/*.jade')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./}))
      .pipe(gulp.dest('app/templates/common/'))
});

// Запускаем локальный сервер (только после компиляции jade)
gulp.task('server', ['jade', 'sass'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: 'app'
    }
  });
});

// слежка и запуск задач
gulp.task('watch', function () {
  gulp.watch('app/templates/**/*.jade', ['jade']);
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch([
    'app/js/**/*.js',
  ]).on('change', reload);
});

// Задача по-умолчанию
gulp.task('default', ['server', 'watch']);

// =====================================================
// ===================== Функции =======================
// =====================================================

// Более наглядный вывод ошибок
var log = function (error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
};
