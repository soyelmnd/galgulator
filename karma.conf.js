var pkg = require('./package.json');

var srcFiles = pkg.path.source.script + '/app.js';
var testFiles = pkg.path.test.unit + '/**/*.js';

module.exports = function(karmaConfig) {
  var config = {
    basePath: '',
    frameworks: ['browserify', 'jasmine'],
    files: [
      srcFiles,
      testFiles
    ],
    exclude: [
      '**/*.swp'
    ],
    preprocessors: {},
    port: 9876,
    colors: true,
    logLevel: karmaConfig.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    browserify: pkg.config.browserify
  };

  config.preprocessors[srcFiles] = ['browserify'];
  config.preprocessors[testFiles] = ['browserify'];

  karmaConfig.set(config);
}
