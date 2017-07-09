const gulp = require('gulp');
const replace = require('gulp-replace');
const wrap = require('gulp-wrap');
const fs = require('fs');
const browserSync = require('browser-sync');

const config = {
  TeamName: 'Lund',
};

const paths = {
  appDir: 'app',
  distDir: 'dist',
  pages: 'app/pages/**/*.html',
  templatesDir: 'app/templates',
  distPagesDir: 'dist/pages',
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
    .pipe(gulp.dest(paths.distDir));
});

gulp.task('build', ['pages']);

gulp.task('browser-sync', ['pages'], () => {
  const { TeamName } = config;
  const routes = {};
  routes[`/Team:${TeamName}`] = paths.distPagesDir;

  browserSync.init({
    server: {
      baseDir: paths.distDir,
      routes,
      middleware: (req,res,next) => {
        if (!(/\.[0-9a-z]+$/.test(req.url))) {
          // Use .html as default extension if none is provided
          req.url = `${req.url}.html`;
        }
        return next();
      },
    },
  });
});

gulp.task('serve', ['build', 'browser-sync']);
