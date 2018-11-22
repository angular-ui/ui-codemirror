var Gulp = require("gulp");
var browserify = require('gulp-browserify');

////////////////////////////////////////////////////////////////////////////////

Gulp.task("build", function () {
    Gulp.src('./app.js')
	.pipe(browserify({}))
	.pipe(Gulp.dest('./dist/'))

});

Gulp.task("default", ["build"]);
