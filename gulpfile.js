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

gulp.task('default', gulp.parallel(css, js, html, assets));
