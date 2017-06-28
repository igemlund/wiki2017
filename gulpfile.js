const gulp = require('gulp');
const replace = require('gulp-replace');
const fs = require('fs');

const paths = {
  appDir: 'app',
  tempDir: 'temp',
  pages: `app/pages/**/*.html`,
  templatesDir: `app/templates`,
};

gulp.task('pages', () => {
  gulp.src(paths.pages, { base: paths.appDir })
    .pipe(replace(/{{([^{}]+)}}/g, (match, name) => {
      const template = fs.readFileSync(`${paths.templatesDir}/${name}.html`)
      return template;
    }))
    .pipe(gulp.dest(paths.tempDir));
});
