const gulp = require('gulp');
const replace = require('gulp-replace');
const wrap = require('gulp-wrap');
const fs = require('fs');
const browserSync = require('browser-sync');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const del = require('del');

const config = {
  teamName: 'Lund',
};

const paths = {
  appDir: 'app',
  destDir: 'dist',
  pages: 'app/pages/**/*.html',
  scripts: 'app/pages/**/*.{js,css}',
  assets: `app/assets/**/*`,
  lessFiles: 'less/**/*.less',
  lessEntry: 'less/wrapper.less',
  templatesDir: 'app/templates',
  templates: 'app/templates/**/*.html',
  stylesDestDir: 'dist/pages/styles',
};

const wrapper = `
<!DOCTYPE html>
<html>
<head>
  <title>iGEM Wiki</title>
  <link rel="stylesheet" type="text/css" href="/Team:Lund/styles/do-not-publish.css">
</head>
<body>
<script>
window.wgPageName = window.location.pathname.match(/^\\/?(.*?)\\/?$/)[1];
</script>
<script src="/jquery.js"></script>
<%= contents %>
</body>
</html>
`;

// == Build Tasks
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
});

gulp.task('jquery', () => {
  return gulp.src('node_modules/jquery/dist/jquery.js')
    .pipe(gulp.dest(paths.destDir));
});

gulp.task('scripts', () => {
  return gulp.src(paths.scripts, { base: paths.appDir })
    .pipe(gulp.dest(paths.destDir));
});

gulp.task('less', function () {
  return gulp.src(paths.lessEntry)
    .pipe(less({
      paths: ['node_modules'],
    }).on('error', console.error.bind(console)))
    .pipe(cssmin().on('error', console.error.bind(console)))
    .pipe(gulp.dest(paths.stylesDestDir))
    .pipe(browserSync.stream());
});

gulp.task('clean', () => {
  del.sync(`${paths.destDir}/**/*`);
});

// == Serve Tasks
gulp.task('browser-sync', ['build'], () => {
  browserSync.init({
    startPath: `/Team:${config.teamName}`,
    server: {
      baseDir: paths.destDir,
      serveStaticOptions: {
        extensions: ['html', 'css', 'min.css', 'js', 'min.js']
      },
      middleware: (req,res,next) => {
        // Reroute wiki url to directory in dist
        req.url = req.url.replace(/^\/Team:[^/]+/, '/pages');
        req.url = req.url.replace(/^\/File:/, `/assets/`);
        return next();
      },
    },
    ghostMode: false,
  });
});

// == Watch Tasks
gulp.task('sync-pages', ['pages'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('sync-scripts', ['scripts'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('sync-assets', ['assets'], (done) => {
  browserSync.reload();
  done();
});

gulp.task('watch', ['build', 'browser-sync'], () => {
  gulp.watch([paths.pages, paths.templates], ['sync-pages']);
  gulp.watch(paths.scripts, ['sync-scripts']);
  gulp.watch(paths.assets, ['sync-assets']);
  gulp.watch(paths.lessFiles, ['less']);
});

// == Main Tasks
gulp.task('build', ['clean', 'pages', 'assets', 'scripts', 'less', 'jquery']);
gulp.task('serve', ['build', 'browser-sync', 'watch']);
