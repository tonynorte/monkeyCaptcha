//Packages
var del = require('del'),
    path = require('path'),
    open = require('open'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    plumber = require('gulp-plumber'),
    htmlbeautify = require('gulp-html-beautify'),
    rename = require('gulp-rename'),
    gulpSequence = require('gulp-sequence'),
    gcmq = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    handlebars = require('handlebars'),
    handlebarsLayouts = require('handlebars-layouts'),
    handlebarsHtml = require('gulp-handlebars-html')(handlebars),
    server = require('gulp-express'),
//Paths
    app = './app',
    app_js = app + '/js',
    app_js_vendor = app_js + '/vendor',
    app_vendor = 'node_modules',
    app_js_site = app_js + '/site',
    app_css = app + '/css',
    app_images = app + '/images',
    app_fonts = app + '/fonts',
    app_data = app + '/data',
    app_templates = app + '/templates',
    app_templates_pages = app_templates + '/pages',
    app_templates_partials = app_templates + '/partials',
    dist = './dist',
    dist_js = dist + '/js',
    dist_css = dist + '/css',
// Configuration
    config = {
        port: 3000,
        isProductionBuild: false,
        assetSelector: ''
    };

// Clean folders
gulp.task('clean', function () {
    'use strict';
    return del.sync(dist);
});

// Compile Sass
gulp.task('css', function() {
    'use strict';
    return gulp.src([
        app_css + '/styles.scss',
        app_css + '/libraries.scss'
    ])
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' })
    .on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 10 versions', 'IE 9'],
        cascade: false
    }))
    .pipe(gcmq())
    .pipe(gulpif(config.isProductionBuild, rename({suffix: '.min'})))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.init()))
    .pipe(gulpif(config.isProductionBuild, cleanCSS({compatibility: 'ie8'})))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.write('./')))
    .pipe(gulp.dest(dist_css));
});

// Compile Handlebars
gulp.task('html', function () {
    'use strict';
    handlebars.registerHelper(handlebarsLayouts(handlebars));
    return gulp.src(
            app_templates_pages + '/*.html'
        )
        .pipe(handlebarsHtml({
                assetSelector: config.assetSelector
            },
            {
                ignorePartials: true,
                partialsDirectory : [
                    app_templates_partials
                ]
            }
        ))
        .pipe(htmlbeautify())
        .pipe(gulp.dest(dist));
 });

// Copy Static Files
gulp.task('copy:static', function () {
    'use strict';
    return gulp.src([
        app_images + '/**/*',
        app_fonts + '/**/*',
        app_data + '/**/*'
    ],
    {
        "base" : app
    })
    .pipe(plumber())
    .pipe(gulp.dest(dist));
});

// Build ie-shims.js
gulp.task('js:shiv', function() {
    'use strict';
    return gulp.src([
        app_vendor + '/html5shiv/dist/html5shiv.min.js',
        app_vendor + 'respond.js/src/respond.js'
    ])
    .pipe(plumber())
    .pipe(concat('ie-shims.js'))
    .pipe(gulpif(config.isProductionBuild, rename({suffix: '.min'})))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.init()))
    .pipe(gulpif(config.isProductionBuild, uglify()))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.write('./')))
    .pipe(gulp.dest(dist_js));
});

// Build Libraries.js
gulp.task('js:libraries', function() {
    'use strict';
    return gulp.src([
        app_vendor + '/jquery/dist/jquery.min.js',
        app_vendor + '/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(plumber())
    .pipe(concat('libraries.js'))
    .pipe(gulpif(config.isProductionBuild, rename({suffix: '.min'})))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.init()))
    .pipe(gulpif(config.isProductionBuild, uglify()))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.write('./')))
    .pipe(gulp.dest(dist_js));
});

// Build Site.js
gulp.task('js:site', function() {
    'use strict';
    return gulp.src(
        app_js_site + '/**/*.js'
    )
    .pipe(plumber())
    .pipe(concat('site.js'))
    .pipe(gulpif(config.isProductionBuild, rename({suffix: '.min'})))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.init()))
    .pipe(gulpif(config.isProductionBuild, uglify()))
    .pipe(gulpif(config.isProductionBuild, sourcemaps.write('./')))
    .pipe(gulp.dest(dist_js));
});

// Express Server
gulp.task('server', function() {
    'use strict';
    process.env.PORT = config.port;
    server.run(['./server.js']);
    open('http://localhost:' + config.port);
});

// Production Task
gulp.task('prod', function () {
    'use strict';
    config.isProductionBuild = true;
    config.assetSelector = '.min'
});

//Watch for Changes
gulp.task('watch', function() {
    'use strict';
    if (!config.isProductionBuild) {
        gulp.watch(
            app_css + '/**/*'
        , function (event) {
            reloadServer(event, ['css']);
        });

        gulp.watch(
            app_js_site + '/**/*'
        , function (event) {
            reloadServer(event, ['js:site']);
        });

        gulp.watch(
            app_js_vendor + '/**/*'
        , function (event) {
            reloadServer(event, ['js:libraries', 'js:shiv']);
        });

        gulp.watch(
            app_templates + '/**/*.html'
        , function (event) {
            reloadServer(event, ['html']);
        });

        gulp.watch([
            app_images + '/**/*',
            app_fonts + '/**/*',
            app_data + '/**/*'
        ], function (event) {
            reloadServer(event, ['copy:static']);
        });
    }
});

function reloadServer(event, tasks) {
    gulp.start(tasks, function() {
        gulp.src(path.relative(__dirname, event.path)).pipe(server.notify());
    });
}

// Helper Tasks
gulp.task('build', ['clean', 'html', 'css', 'js:libraries', 'js:shiv', 'js:site', 'copy:static']);
gulp.task('build:prod', gulpSequence('prod', 'build'));
gulp.task('serve', gulpSequence('build', 'watch', 'server'));
gulp.task('serve:prod', gulpSequence('build:prod', 'server'));

gulp.task('default', ['serve']);