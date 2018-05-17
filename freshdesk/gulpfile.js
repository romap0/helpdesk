var gulp = require('gulp')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')

gulp.task('babel', () =>
  gulp.src('src/**/*.js')
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
)

gulp.task('copy', () =>
  gulp.src(['src/**/*', '!src/**/*.js'])
    .pipe(gulp.dest('dist'))
)

gulp.task('default', [ 'babel', 'copy' ])
