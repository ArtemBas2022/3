'use strict';
/* параметры для gulp-autoprefixer */
var autoprefixerList = [
  'Chrome >= 45',
  'Firefox ESR',
  'Edge >= 12',
  'Explorer >= 10',
  'iOS >= 9',
  'Safari >= 9',
  'Android >= 4.4',
  'Opera >= 30'
];
/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
  build: {
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
    fonts: 'dist/fonts/',
    backend_files: 'dist/backend_files/',
    plagins: 'dist/plagins/'
  },
  src: {
    html: 'app/**/*.html',
    js: 'app/js/*.js',
    css: 'app/style/*.scss',
    img: 'app/img/**/*.*',
    fonts: 'app/fonts/**/*.*',
    backend_files: 'app/backend_files/**/*.*',
    plagins: 'app/plagins/**/*.*'
  },
  watch: {
    html: 'app/**/*.html',
    js: 'app/**/js/**/*.js',
    css: 'app/**/style/**/*.scss',
    img: 'app/**/img/**/*.*',
    fonts: 'app/**/fonts/**/*.*',
    backend_files: 'app/**/backend_files/**/*.*',
    plagins: 'app/**/plagins/**/*.*'
  },
  clean: 'dist/*'
};
/* настройки сервера */
var config = {
  server: {
    baseDir: 'dist/'
  },
  notify: false
};
/* подключаем gulp и плагины */
var gulp = require('gulp'),  // подключаем Gulp
  webserver = require('browser-sync'), // сервер для работы и автоматического обновления страниц
  plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
  rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
  sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
  sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
  autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
  cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
  uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
  cache = require('gulp-cache'), // модуль для кэширования
  notify = require('gulp-notify'),
  imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
  jpegrecompress = require('imagemin-jpeg-recompress'), // плагин для сжатия jpeg
  pngquant = require('pngquant'), // плагин для сжатия png
  rimraf = require('gulp-rimraf'), // плагин для удаления файлов и каталогов
  rename = require('gulp-rename'),
  babel = require("gulp-babel");

  var onError = function(err) { // errorHandler для plumber (чтоб сообщение об ошибке не прерывало работу gulp)
        notify.onError({
                    title:    "Gulp",
                    subtitle: "Failure!",
                    message:  "Error: <%= error.message %>",
                    sound:    false
                })(err);

        this.emit('end');
    };
/* задачи */

// запуск сервера
gulp.task('webserver', function () {
  webserver(config);
});

gulp.task('plagins:build', function () {
  return gulp.src(path.src.plagins)
  .pipe(gulp.dest(path.build.plagins)) // выкладывание готовых файлов
  .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});

gulp.task('backend_files:build', function () {
  return gulp.src(path.src.backend_files)
  .pipe(gulp.dest(path.build.backend_files)) // выкладывание готовых файлов
  .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});
// сбор html
gulp.task('html:build', function () {
  function act(app, dist){
    return gulp.src(app) // выбор всех html файлов по указанному пути
      .pipe(plumber({errorHandler: onError})) // отслеживание ошибок
      .pipe(rigger()) // импорт вложений
      .pipe(gulp.dest(dist)) // выкладывание готовых файлов
      .pipe(webserver.reload({ stream: true })) // перезагрузка сервера
      .pipe(notify({message: 'html completed', onLast: true}));

  }
  return  act(path.src.html, path.build.html);
});

// сбор стилей
gulp.task('css:build', function () {

  function act(app, dist){
    return gulp.src(app) // получим main.scss
      .pipe(plumber({errorHandler: onError})) // для отслеживания ошибок
      .pipe(sourcemaps.init()) // инициализируем sourcemap
      .pipe(sass()) // scss -> css
      .pipe(autoprefixer({ // добавим префиксы
          browsers: autoprefixerList
      }))
      .pipe(gulp.dest(dist))
      .pipe(rename({ suffix: '.min' }))
      .pipe(cleanCSS()) // минимизируем CSS
      .pipe(sourcemaps.write('./')) // записываем sourcemap
      .pipe(gulp.dest(dist)) // выгружаем в build
      .pipe(webserver.reload({ stream: true })) // перезагрузим сервер
      .pipe(notify({message: 'scss completed', onLast: true}));


  }


  return act(path.src.css, path.build.css);

});

// сбор js
gulp.task('js:build', function () {

  function act(app, dist){
     return gulp.src(app) // получим файл main.js
    .pipe(plumber({errorHandler: onError})) // для отслеживания ошибок
    .pipe(rigger()) // импортируем все указанные файлы в main.js
    .pipe(babel()) // babel
    .pipe(gulp.dest(dist))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.init()) //инициализируем sourcemap
    .pipe(uglify()) // минимизируем js
    .pipe(sourcemaps.write('./')) //  записываем sourcemap
    .pipe(gulp.dest(dist)) // положим готовый файл
    .pipe(webserver.reload({ stream: true })) // перезагрузим сервер
    .pipe(notify({message: 'js completed', onLast: true}));

  }

  return act(path.src.js, path.build.js);
});

// перенос шрифтов
gulp.task('fonts:build', function () {
  function act( app, dist){
    return gulp.src(app)
      .pipe(gulp.dest(dist));
  }
 return act(path.src.fonts, path.build.fonts);
});

// обработка картинок
gulp.task('image:build', function () {
  function act(app, dist){
    return gulp.src(app) // путь с исходниками картинок
      .pipe(cache(imagemin([ // сжатие изображений
        imagemin.gifsicle({ interlaced: true }),
        jpegrecompress({
          progressive: true,
          max: 90,
          min: 80
        }),
        pngquant(),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] })
      ])))
      .pipe(gulp.dest(dist)); // выгрузка готовых файлов
  }
  return act(path.src.img, path.build.img );
});

// удаление каталога build
gulp.task('clean:build', function () {
  return gulp.src(path.clean, { read: false })
    .pipe(rimraf());
});

// очистка кэша
gulp.task('clear', () =>
    cache.clearAll()
);

// сборка
gulp.task('build',
  gulp.series('clean:build',
    gulp.parallel(
      'html:build',
      'css:build',
      'js:build',
      'fonts:build',
      'image:build',
      'plagins:build',
      'backend_files:build'
    )
  )
);

// запуск задач при изменении файлов
gulp.task('watch', function () {
  gulp.watch(path.watch.html, gulp.series('html:build'));
  gulp.watch(path.watch.css, gulp.series('css:build'));
  gulp.watch(path.watch.js, gulp.series('js:build'));
  gulp.watch(path.watch.img, gulp.series('image:build'));
  gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
  gulp.watch(path.watch.backend_files, gulp.series('backend_files:build'));
  gulp.watch(path.watch.plagins, gulp.series('plagins:build'));
});
// задача по умолчанию
gulp.task('default', gulp.series(
  'build',
  gulp.parallel('webserver','watch')
));
