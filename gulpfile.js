const gulp =  require('gulp');
const less = require('gulp-less');

const plumber = require('gulp-plumber');
const rename = require('gulp-rename');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minifyCSS = require('gulp-csso');

const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');

const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');

const babel = require('gulp-babel');
const minifyJs = require('gulp-uglify');
const concat =  require('gulp-concat');

const del = require('del');

const server = require('browser-sync').create();

gulp.task('clean', () => del("build") );

gulp.task('copy', () => {
  return gulp.src([
      "src/fonts/**/*.{woff,woff2,ttf}",
      "src/img/**"
    ], {
      base: 'src'
    })
    .pipe(gulp.dest("build"));
});

gulp.task('style', () => {
  return gulp.src("./src/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
    .pipe(minifyCSS())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('sprite', function (done) {
  return gulp.src('./build/img/**/sprite-*.svg')
    .pipe(svgstore({
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest("build/img"));
});

gulp.task('images', function (done) {
      gulp.src("./build/img/**/*.{png,jpg,svg}")
      .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
      ]))
      .pipe(gulp.dest("build/img"));
  done();
});

gulp.task('webp', function () {
  return gulp.src("./build/img/**/*.jpg")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"));
});

gulp.task('html', function () {
  return gulp.src("./src/**/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build/"));
});

gulp.task('script', () => {
  return gulp.src("src/js/**/*.js")
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(babel({
      presets: ["@babel/preset-env"]
    }))
    .pipe(gulp.dest("build/js"))
    .pipe(minifyJs())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest("build/js"));
});

gulp.task('serve', function () {
  server.init({
    server: 'build/'
  });

  gulp.watch("src/less/**/*.less", gulp.series("style"));
  gulp.watch("src/**/*.html", gulp.series("html"))
    .on('change', server.reload);
  gulp.watch("src/**/*.js", gulp.series("script"))
    .on('change', server.reload);
});

gulp.task('build',  gulp.series('clean', 'copy', 'style', 'images', 'sprite', 'webp', 'html', 'script') );
