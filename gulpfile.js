const gulp = require('gulp');
const replace = require('gulp-replace');
const wrap = require('gulp-wrap');
const fs = require('fs');
const browserSync = require('browser-sync');
const del = require('del');

const config = {
  teamName: 'Lund',
};

const paths = {
  appDir: 'app',
  destDir: 'dist',
  pages: 'app/pages/**/*.html',
  assets: `app/assets/**/*`,
  templatesDir: 'app/templates',
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
  return gulp.src(paths.pages, { base: paths.appDir })
    .pipe(replace(/{{([^{}]+)}}/g, (match, name) => {
      const template = fs.readFileSync(`${paths.templatesDir}/${name}.html`)
      return template;
    }))
    .pipe(wrap(wrapper))
    .pipe(gulp.dest(paths.destDir));
});

gulp.task('assets', () => {
  return gulp.src(paths.assets, { base: paths.appDir })
    .pipe(gulp.dest(paths.destDir))
})

gulp.task('browser-sync', ['build'], () => {
  browserSync.init({
    server: {
      baseDir: paths.destDir,
      middleware: (req,res,next) => {
        function reroute(url, from, to) {
          if (url.startsWith(from)) {
            return to + url.substring(from.length);
          }
          return url;
        }

        // Reroute wiki url to directory in dist
        req.url = reroute(req.url, `/Team:${config.teamName}`, '/pages');
        req.url = reroute(req.url, `/File:`, `/assets/`);

        // Use .html as default extension if none is provided
        if (!(/\.[0-9a-z]+$/.test(req.url))) {
          req.url = `${req.url}.html`;
        }
        return next();
      },
    },
  });
});

gulp.task('clean', () => {
  del.sync(`${config.destDir}/**`);
});

// == Watch Tasks
gulp.task('sync-pages', ['pages'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('sync-assets', ['assets'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('watch', ['build', 'browser-sync'], () => {
  gulp.watch(paths.pages, ['sync-pages']);
  gulp.watch(paths.assets, ['sync-assets']);
});

// == Main Tasks
gulp.task('build', ['clean', 'pages', 'assets']);
gulp.task('serve', ['build', 'browser-sync', 'watch']);
