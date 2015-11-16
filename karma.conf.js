var pkg = require('./package.json');

var srcFiles = pkg.path.source.script + '**';
var testFiles = pkg.path.test.unit + '**/*.js';

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
    reporters: ['dots'],
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    browserify: pkg.config.browserify,
    watchify: {
      poll: true
    }
  };

  config.preprocessors[srcFiles] = ['browserify'];
  config.preprocessors[testFiles] = ['browserify'];

  karmaConfig.set(config);
}
