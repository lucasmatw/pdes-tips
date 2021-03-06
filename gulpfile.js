// Include gulp
var gulp = require('gulp');
// Gulp plugins
var jshint = require('gulp-jshint');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var mainBowerFiles = require('gulp-main-bower-files');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulpFilter = require('gulp-filter');

// Test tools
var mocha = require("gulp-mocha");
var protractor = require("gulp-protractor").protractor;
var KarmaServer = require("karma").Server;

var sources = {
  js: ["public/javascripts/external/**/*.js", "public/javascripts/angularApp.js", "public/javascripts/modules/services/**/*.js", "public/javascripts/modules/controllers/**/*.js"],
  test: {
    frontend: ["tests/frontend/dependencies/**/*.js","public/javascripts/angularApp.js", "public/javascripts/modules/services/**/*.js", "public/javascripts/modules/controllers/**/*.js", "public/javascripts/**/*.js",'tests/frontend/**/*.js'],
    backend: ["tests/backend/**/*.js"],
    e2e: ["tests/end-to-end/**/*.js"]
  }
};

// Test tasks
gulp.task("test:backend", function() {
  return gulp.src(sources.test.backend)
    .pipe(mocha());
});

gulp.task("test:frontend", ["karma:dependency:link"], function(done) {
  new KarmaServer({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }).start(done);
});

gulp.task("test:e2e", ["build"], function() {
  return gulp.src(sources.test.e2e)
    .pipe(protractor({configFile: "protractor.conf.js"}));
});

//Dependencies handling tasks
function dependencyCopy(outDir, outFile, options) {
  return gulp.src("bower.json")
      .pipe(mainBowerFiles(options || {}))
      .pipe(concat(outFile))
      .pipe(uglify())
    .pipe(gulp.dest(outDir));
}
gulp.task("dependency:external:copy", function() {
  return dependencyCopy("public/javascripts/external", "dependencies.js");
});

gulp.task("dependency:test:copy", function() {
  return dependencyCopy("tests/frontend/dependencies", "test-dependencies.js", {includeDev: true});
});

gulp.task("dependency:link", ["dependency:external:copy"], function() {
  var dependencies = gulp.src(sources.js);

  return gulp.src("views/index.ejs")
    .pipe(inject(dependencies, {
      ignorePath: 'public',
      addRootSlash: false
    }))
    .pipe(gulp.dest("views"));
});

gulp.task("karma:dependency:link", ["dependency:external:copy", "dependency:test:copy"], function() {
  var dependencies = gulp.src(sources.test.frontend);

  return gulp.src("karma.conf.js")
    .pipe(inject(dependencies, {
      starttag: "files: [",
      endtag: "],",
      transform: function(path, file, index, total) {
        return '"' + path + '"' + (index + 1 < total ? "," : "");
      },
      addRootSlash: false
    }))
    .pipe(gulp.dest("."));
});
gulp.task("test:light", ["test:backend", "test:frontend"]);
gulp.task("test:all", ["test:light", "test:e2e"]);

gulp.task("auto:tests", function() {
  gulp.watch(["models/**/*.js", "routes/**/*.js"], ["test:backend"]);
  gulp.watch(["public/modules/**/*.js", "public/javascripts/angularApp.js"], ["test:frontend"]);
});

gulp.task("build", ["dependency:link"]);
gulp.task('default', ['watch','auto:tests']);

var sourceJshint = ['models/**/*.js','routes/**/*.js', 'public/javascripts/modules/**/*.js','public/javascripts/angularApp.js'];
gulp.task('jshint', function() {
  return gulp.src(sourceJshint)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('watch', function() {
  gulp.watch(sourceJshint, ['jshint']);
  gulp.watch("bower.json", ['dependency:link']);
});
