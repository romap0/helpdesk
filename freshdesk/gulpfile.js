var gulp = require('gulp')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')

const babelTask = () =>
  gulp.src(['src/**/*.js', '!**/node_modules/**/*'])
    .pipe(
      babel({
        presets: ['es2015']
      }))
    .pipe(eslint({
      rules: {
        'curly': 2,
        'no-extra-parens': 2
      },
      fix: true,
      useEslintrc: false
    }))
    .pipe(eslint.format())
    .pipe(gulp.dest('dist'))

const copyTask = () =>
  gulp.src(['src/**/*', '!src/**/*.js'])
    .pipe(gulp.dest('dist'))

exports.default = gulp.series(babelTask, copyTask)
