try {
  var argv = require('yargs').argv
    , gulp = require('gulp')

    // less compilation
    , less = require('gulp-less')
    , autoprefixer = require('gulp-autoprefixer')
    , sourcemaps = require('gulp-sourcemaps')

    // view bundle with swig
    , swig = require('gulp-swig')
    , inject = require('gulp-inject')

    // bundle with browserify
    , browserify = require('browserify')
    , source = require('vinyl-source-stream')

    // development server
    , connect = require('connect')
    , connectLr = require('connect-livereload')
    , open = require('open')
    , request = require('request')
    , serveStatic = require('serve-static')
    , tinyLr = require('tiny-lr')

    // unit test n tdd
    , karma = require('karma')
} catch(e) {
  // There are times we forget to run `npm install`
  //   again and again, totally tolerable I guess
  //   @todo auto `npm install` and re-run
  console.error('Oops! try `npm install` first');
  console.error(e);
  process.exit();
}

var os = require('os')
  , path = require('path')
  , pkg = require('./package.json');

gulp.task('test', ['test.unit']);

gulp.task('test.unit', function(done) {
  var karmaServer = new karma.Server({
    configFile: path.resolve(__dirname, './karma.conf.js')
  }, done);

  karmaServer.start();
});

gulp.task('dev', [
  'dev.theme', 'dev.view', 'dev.script',
  'dev.watch', 'dev.server'
]);

gulp.task('dev.watch', function() {
  gulp.watch(pkg.path.source.base + '/**/*.html', ['dev.view']);
  gulp.watch(pkg.path.source.theme + '/**', ['dev.theme']);
  gulp.watch(pkg.path.source.script + '/**', ['dev.script']);
});

gulp.task('dev.view', ['dev.script', 'dev.theme'], function() {
  return gulp.src(pkg.path.source.base + '/index.html')
    .pipe(swig(pkg.config.swig))
    .pipe(inject(
      gulp.src(
        [
          pkg.path.build.script + '/*.js',
          pkg.path.build.theme + '/*.css'
        ],
        { read: false }
      ),
      {
        addRootSlash: false,
        ignorePath: pkg.path.build.base,
        removeTags: true,
        relative: false
      }
    ))
    .pipe(gulp.dest(pkg.path.build.base));
});

gulp.task('dev.theme', function() {
  return gulp.src(pkg.path.source.theme + '/app.less')
    .pipe(sourcemaps.init())
    .pipe(less(pkg.config.less || {}))
    .pipe(autoprefixer(pkg.config.autoprefixer || {}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.path.build.theme))
});

gulp.task('dev.script', function() {
  return browserify(
      pkg.path.source.script + '/app.js',
      pkg.config.browserify || {}
    )
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(pkg.path.build.script));
});

gulp.task('dev.server', function() {
  var port = argv.port || 1243
    , lrPort = argv.liveReloadPort || 12435
    , root = pkg.path.build.base;

  var server = connect();

  // Live reload should be explicitly enabled
  //   as I don't really like live-reload,
  //   but it's handy for a quick mockup
  if(argv.liveReload) {
    var lr = tinyLr();
    lr.listen(lrPort);

    server.use(connectLr({ port: lrPort }));
    console.log('[Server] live-reload at http://' + ip() + ':' + lrPort);

    gulp.watch(root + '/**', function(evt) {
      var path = evt.path.replace(__dirname + '/' + root, '').replace(/~$/, '');

      // Skip non-sense resources
      if(!/\.less$|\/$/.test(path)) {
        request('http://' + ip() + ':' + lrPort + '/changed?files=' + path);
        console.log('[Server] updated ' + path);
      }
    });
  }

  server.use(serveStatic(root));
  server.listen(port);
  console.log('[Server] running at http://' + ip() + ':' + port);

  // Auto open web browser, if enabled
  argv.browser && open('http://' + ip() + ':' + port);
});


/**
 * @return {String} ipAddress
 */
function ip() {
  if(!arguments.callee.address) {
    var ifaces = os.networkInterfaces()
      , i, j, iface, details;

    for(i in ifaces) {
      iface = ifaces[i];

      for(j in iface) {
        details = iface[j];

        if('IPv4' == details.family && !details.internal) {
          arguments.callee.address = details.address;
          break;
        }
      }
    }
  }

  return arguments.callee.address;
}
