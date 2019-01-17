'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    // For synchronised browser testing
    browserSync = require('browser-sync'),
    // For deleting files, coping is included in gulp
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cleanCss = require('gulp-clean-css'),
    flatmap = require('gulp-flatmap'),
    htmlmin = require('gulp-htmlmin');

gulp.task('sass', function () {
    return gulp.src('./css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
    // Update on change
    gulp.watch('./css/*.scss', ['sass']);
});

gulp.task('browser-sync', function () {
    var files = [
        './*.html',
        './css/*.css',
        './js/*.js',
        './img/*.{png, jpg, gif}'
    ];

    browserSync.init(files, {
        // Options
        server: {
            baseDir: './'
        }
    });
});

gulp.task('default', ['browser-sync'], function () {
    gulp.start('sass:watch');
});

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('copyfonts', function() {
    gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('imagemin', function() {
    return gulp.src('img/*.{png,jpg,gif}')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true}))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('usemin', function() {
    // Takes html files and looks up js and css, minifies and concats in dist folder
    return gulp.src('./*.html')
    // Takes multiple html and starts up parallel pipe lines and converging in the dist folder
    .pipe(flatmap(function(stream, file) {
        return stream
        .pipe(usemin({
            css: [rev()],
            html: [function() { return htmlmin({ collapseWhitespace: true})}],
            js: [ uglify(), rev() ],
            inlinejs: [uglify()],
            inlinecss: [cleanCss(), 'concat']
        }))
    }))
    // Piped to distrobution folder
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['clean'], function() {
    // Clean executeed first, then the following in parallel
    gulp.start('copyfonts', 'imagemin', 'usemin');
});