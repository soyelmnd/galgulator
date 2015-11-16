try {
  var argv = require('yargs').argv
    , gulp = require('gulp')

    // less compilation
    , less = require('gulp-less')
    , autoprefixer = require('gulp-autoprefixer')
    , sourcemaps = require('gulp-sourcemaps')

    // development server
    , connect = require('connect')
    , connectLr = require('connect-livereload')
    , open = require('open')
    , request = require('request')
    , serveStatic = require('serve-static')
    , tinyLr = require('tiny-lr')
} catch(e) {
  // There are times we forget to run `npm install`
  //   again and again, totally tolerable I guess
  //   @todo auto `npm install` and re-run
  console.error('Oops! try `npm install` first');
  console.error(e);
  process.exit();
}

var os = require('os')
  , pkg = require('./package.json');


gulp.task('dev', ['dev.less', 'dev.watch', 'dev.server']);

gulp.task('dev.watch', function() {
  gulp.watch(pkg.path.development.less + '/**', ['dev.less']);
});

gulp.task('dev.less', function() {
  return gulp.src(pkg.path.development.less + '/app.less')
    .pipe(sourcemaps.init())
    .pipe(less(pkg.config.less || {}))
    .pipe(autoprefixer(pkg.config.autoprefixer || {}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.path.development.css))
});

gulp.task('dev.server', function() {
  var port = argv.port || 1243
    , lrPort = argv.liveReloadPort || 12435
    , root = pkg.path.development.base;

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
