/* eslint-disable no-undef */
var gulp = require('gulp');

function assets() {
    return gulp.src('./assets/*')
        .pipe(gulp.dest('./dist/assets'));
}

function css() {
    return gulp.src('./styles/*.css')
        .pipe(gulp.dest('./dist/styles'));
}

function js() {
    return gulp.src('./scripts/*.js')
        .pipe(gulp.dest('./dist/scripts'));
}

function html() {
    return gulp.src('*.html')
        .pipe(gulp.dest('./dist'));
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.assets = assets;
exports.default = gulp.parallel(html, css, js);