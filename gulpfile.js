const gulp = require('gulp');
const replace = require('gulp-replace');
const wrap = require('gulp-wrap');
const fs = require('fs');

const paths = {
  appDir: 'app',
  tempDir: 'temp',
  pages: `app/pages/**/*.html`,
  templatesDir: `app/templates`,
};

const wrapper = `
<!DOCTYPE html>
<html>
<head>
  <title>iGEM Wiki</title>
</head>
<body>
<%= contents %>
</body>
</html>
`;

gulp.task('pages', () => {
  gulp.src(paths.pages, { base: paths.appDir })
    .pipe(replace(/{{([^{}]+)}}/g, (match, name) => {
      const template = fs.readFileSync(`${paths.templatesDir}/${name}.html`)
      return template;
    }))
    .pipe(wrap(wrapper))
    .pipe(gulp.dest(paths.tempDir));
});
