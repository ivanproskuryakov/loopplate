const gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  connect = require('gulp-connect'),
  fs = require('fs'),
  path = require('path'),
  del = require('del'),
  sequence = require('run-sequence'),
  shell = require('gulp-shell'),
  pump = require('pump'),
  plugin = require('gulp-load-plugins')({lazy: true}),
  tslint = require('tslint');

const dir = path.dirname(fs.realpathSync(__filename));

/**
 * https://github.com/robrich/orchestrator/blob/fa11e5e2cbbf735f321d8c19f29c00b8d46058c4/test/stop.js#L12
 * @param err
 */
gulp.doneCallback = function (err) {
  process.exit(err ? 1 : 0);
};

//////////////////////////////////////////////
// App tasks
//////////////////////////////////////////////

gulp.task('app:build', function (done) {
  sequence(
    'backend:symlink',
    'backend:build',
    'frontend:build',
    done
  );
});

gulp.task('server:watch', function (done) {
  plugin.nodemon({
    script: 'build/server/server.js',
    ignore: ['build/test/*'],
    ext: '*',
    watch: ['build/'],
    env: {'NODE_ENV': 'development'},
    delay: '300'
  });
});

gulp.task('app:watch', ['app:build'], function (done) {
  // first time build all by app:build,
  // then compile/copy by changing
  gulp
    .start([
      'frontend:sass:watch',
      'backend:watch:code',
      'backend:watch:files',
      'server:watch'
    ], done);
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
// Backend tasks
//////////////////////////////////////////////

const appSourceDir = path.join(dir, '/app');
const appSourceGlob = `${appSourceDir}/**/*.*`;
const appSourceRelativeGlob = 'app/**/*.*';
const appCodeGlob = `${appSourceDir}/**/*.ts`;
const appCodeRelativeGlob = 'app/**/*.ts';
const appFilesGlob = [appSourceGlob, `!${appCodeGlob}`];
const appFilesRelativeGlob = [appSourceRelativeGlob, `!${appCodeRelativeGlob}`];
const appBuildDir = path.join(dir, '/build');


gulp.task('backend:symlink', [], function (done) {
  const appTargetDir = path.join(dir, '/node_modules/app');
  // symlink for app
  fs.exists(appTargetDir, function (err) {
    if (!err) {
      fs.symlinkSync(appBuildDir, appTargetDir, 'dir');
    }
  });

  done();
});

gulp.task('backend:clean', function (done) {
  clean([appBuildDir + '/**/*', '!.gitkeep'], done);
});

gulp.task('backend:files', function () {
  // copy fixtures and other non ts files
  // from app directory to build directory
  return gulp
    .src(appFilesGlob)
    .pipe(plugin.cached('files'))
    .pipe(gulp.dest(appBuildDir));
});

gulp.task('backend:build', function (done) {
  sequence(
    'backend:clean',
    'backend:compile',
    'backend:files',
    done
  );
});

gulp.task('backend:compile', function (done) {
  tsCompile(
    [appCodeGlob],
    appBuildDir,
    appSourceDir,
    done
  );
});


gulp.task('backend:watch:code', function () {
  const watcher = gulp.watch(appCodeRelativeGlob, ['backend:compile']);

  watcher.on('change', function (event) {
    // if a file is deleted, forget about it
    if (event.type === 'deleted') {
      // gulp-cached remove api
      delete plugin.cached.caches.code[event.path];
      delete plugin.event.caches.lint[event.path];
      // delete in build
      del(getPathFromSourceToBuild(event.path, appSourceDir, appBuildDir));
    }
  });
});

gulp.task('backend:watch:files', function () {
  const watcher = gulp.watch(appFilesRelativeGlob, ['backend:files']);

  watcher.on('change', function (event) {
    // if a file is deleted, forget about it
    if (event.type === 'deleted') {
      // gulp-cached remove api
      delete plugin.cached.caches.files[event.path];
      delete plugin.event.caches.lint[event.path];
      // delete in build
      del(getPathFromSourceToBuild(event.path, appSourceDir, appBuildDir));
    }
  });
});

gulp.task('backend:watch', ['backend:build'], function (done) {
  // first time build all by backend:build,
  // then compile/copy by changing
  gulp
    .start([
      'backend:watch:code',
      'backend:watch:files'
    ], done);
});

//////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////

/**
 * remaps file path from source directory to destination directory
 * @param {string} file path
 * @param {string} source directory path
 * @param {string} destination directory path
 * @returns {string} new file path (remapped)
 */
function getPathFromSourceToBuild(file, source, destination) {
  // Simulating the {base: 'src'} used with gulp.src in the scripts task
  const filePathFromSrc = path.relative(path.resolve(source), file);
  // Concatenating the 'destination' absolute
  // path used by gulp.dest in the scripts task
  return path.resolve(destination, filePathFromSrc);
}

/**
 * Typescript Linter
 * @param  {Array}    path - array of paths to lint
 * @param  {Function} done - callback when complete
 */
function tsLint(path, done) {
  const program = tslint.Linter.createProgram('tsconfig.json');

  return gulp
    .src(path)
    // used for incremental builds
    .pipe(plugin.cached('lint'))
    .pipe(plugin.tslint({
      formatter: 'prose',
      program
    }))
    .pipe(plugin.tslint.report({
      emitError: false,
      summarizeFailureOutput: true
    }))
    .on('error', done)
    .on('end', done);
}

/**
 * Compiles Typescript
 * @param  {Array}    path - array of paths to compile
 * @param  {string}   dest - destination path for compiled js
 * @param  {string}   baseDir - base directory for files compiling
 * @param  {Function} done - callback when complete
 */
function tsCompile(path, dest, baseDir, done) {
  const ts = plugin.typescript;
  const tsProject = ts.createProject('tsconfig.json');

  gulp
    .src(path, {base: baseDir})
    // used for incremental builds
    .pipe(plugin.cached('code'))
    .pipe(plugin.sourcemaps.init())
    .pipe(tsProject(ts.reporter.fullReporter())).js
    .pipe(plugin.sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .on('error', done)
    .on('end', done);
}

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
