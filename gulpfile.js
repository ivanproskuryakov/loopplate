const gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  fs = require('fs'),
  path = require('path'),
  del = require('del'),
  sequence = require('run-sequence'),
  pump = require('pump'),
  plugin = require('gulp-load-plugins')({lazy: true});

const dir = path.dirname(fs.realpathSync(__filename));

/**
 * https://github.com/robrich/orchestrator/blob/fa11e5e2cbbf735f321d8c19f29c00b8d46058c4/test/stop.js#L12
 * @param err
 */
gulp.doneCallback = function (err) {
  process.exit(err ? 1 : 0);
};


//////////////////////////////////////////////
// Backend tasks
//////////////////////////////////////////////


gulp.task('backend:symlink', [], function (done) {
  const appDir = path.join(dir, '/app');
  const modulesDir = path.join(dir, '/node_modules/app');

  fs.symlinkSync(appDir, modulesDir, 'dir');

  done();
});


//////////////////////////////////////////////
// Frontend tasks
//////////////////////////////////////////////

const styles = [
  dir + '/public/styles/styles.scss',
  dir + '/public/app/**/style/*.scss',
  dir + '/public/app/**/style/**/*.scss',
  dir + '/public/app/**/style/**/**/*.scss',
];
const buildDir = dir + '/public/build/';

gulp.task('frontend:sass', function (done) {
  gulp
    .src(styles)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(plugin.replace('../fonts/', '')) // replace fonts path for font-awesome
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(buildDir))
    .on('end', function () {
      log('sass compiled');
      done();
    });
});

gulp.task('frontend:sass:watch', function () {
  gulp.watch(styles, ['frontend:sass']);
});

gulp.task('frontend:loopback', function (done) {
  const app = require('./build/server/server');
  const apiUrl = 'http://' + app.get('domain') + ':' + app.get('port') + app.get('restApiRoot');
  const destDir = path.join(dir, '/public/app');

  gulp
    .src('./build/server/server.js')
    .pipe(plugin.loopbackSdkAngular({
      ngModuleName: 'LoopbackServices',
      apiUrl: apiUrl
    }))
    .pipe(plugin.rename('loopback-services.js'))
    .pipe(plugin.insert.prepend('define([\'app\'], function(app) {'))
    .pipe(plugin.insert.append('});'))
    .pipe(gulp.dest(destDir))
    .on('end', function () {
      log(`Compiled ${apiUrl} to ${destDir}`);

      done();
    });
});

gulp.task('frontend:rjs', ['frontend:templatecache'], function (done) {
  const config = {
    baseUrl: 'public/app',
    mainConfigFile: 'public/app/main.js',
    name: 'main',
    out: 'main.js',
    paths: {
      requireLib: '../bower_components/requirejs/require',
      domReady: '../bower_components/domReady/domReady'
    },
    include: ['requireLib', 'domReady'],
    optimize: 'none'
  };

  pump([
    plugin.requirejs(config),
    plugin.uglify({mangle: false}),
    gulp.dest(buildDir)
  ], done);
});

gulp.task('frontend:templatecache', function () {
  log('Creating an AngularJS $templateCache');

  return gulp
    .src('./public/app/**/*.html')
    .pipe(plugin.minifyHtml({
      empty: true
    }))
    .pipe(plugin.angularTemplatecache('templates.js', {
      module: 'templates',
      standalone: true,
      root: '/app/',
      moduleSystem: 'RequireJS'
    }))
    .pipe(gulp.dest('./public/app'));
});

gulp.task('frontend:fonts', function () {
  return gulp
    .src([
      './public/bower_components/material-design-icons/iconfont/*.{woff2,woff,ttf}',
      './public/bower_components/font-awesome/fonts/*.{woff2,woff,ttf,eot}'
    ])
    .pipe(gulp.dest(buildDir));
});

gulp.task('frontend:build', function (done) {
  sequence(
    'frontend:clean',
    'frontend:loopback',
    'frontend:rjs',
    'frontend:sass',
    'frontend:fonts',
    done
  );
});

gulp.task('frontend:clean', function (done) {
  clean([buildDir + '/**/*', '!.gitkeep'], done);
});


//////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////


/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
  log('Cleaning: ' + plugin.util.colors.blue(path));
  del(path).then(function (paths) {
    done();
  });
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof (msg) === 'object') {
    for (let item in msg) {
      if (msg.hasOwnProperty(item)) {
        plugin.util.log(plugin.util.colors.blue(msg[item]));
      }
    }
  } else {
    plugin.util.log(plugin.util.colors.blue(msg));
  }
}
