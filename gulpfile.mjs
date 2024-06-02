import gulp from "gulp";
import del from "del";
import include from "gulp-file-include";
import plumber from "gulp-plumber";
import formatHTML from "gulp-format-html";

import autoprefixer from "autoprefixer";
import less from "gulp-less";
import postcss from "gulp-postcss";
import sortMediaQueries from "postcss-sort-media-queries";

import terser from "gulp-terser";
import minify from "gulp-csso";
import rename from "gulp-rename";

import imagemin from "gulp-imagemin";
import imagemin_gifsicle from "imagemin-gifsicle";
import imagemin_mozjpeg from "imagemin-mozjpeg";
import imagemin_optipng from "imagemin-optipng";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";

import server from "browser-sync";

// настройка путей в проекте
const resources = {
    html: "src/html/**/*.html",
    jsDev: "src/scripts/dev/*.js",
    jsVendor: "src/scripts/vendor/*.js",
    less: "src/styles/**/*.less",
    static: [
        "src/assets/icons/**/*.*",
        "src/assets/favicons/**/*.*",
        "src/assets/fonts/**/*.{woff,woff2}",
        "src/assets/video/**/*.{mp4,webm}",
        "src/assets/audio/**/*.{mp3,ogg,wav,aac}",
        "src/json/**/*.json",
        "src/php/**/*.php"
    ],
    images: "src/assets/images/**/*.{png,jpg,jpeg,webp,gif,svg}",
    svgSprite: "src/assets/svg-sprite/*.svg",
};

// очистка сборки (чтобы чистить итоговую сборку и не накапливать мусор)
function clean() {
    return del("dist");
}

// обрабатываем html страницы
function includeHtml() {
    return gulp
        .src("src/html/*.html")
        .pipe(plumber())
        .pipe(
            include({ // включаем в наши страницы отдельные вынесенные блоки
                prefix: "@@",
                basepath: "@file"
            })
        )
        .pipe(formatHTML()) // автоматически форматирует нашу разметку
        .pipe(gulp.dest("dist"));
}

// обрабатываем стили
function style() {
    return gulp
        .src("src/styles/styles.less")
        .pipe(plumber())
        .pipe(less()) // обработка и конвертация less файла в css файл
        .pipe(
            postcss([ // обработка css файла
                autoprefixer({ overrideBrowserslist: ["last 4 version"] }), // для добавления префиксов к свойствам для максимальной поддержки во всех браузерах
                sortMediaQueries({ // снужно для адаптивной верстки
                    sort: "desktop-first" // в первую очередь важны стили для десктопа
                })
            ])
        )
        .pipe(gulp.dest("dist/styles"))
        .pipe(minify()) // минифицируем свойства
        .pipe(rename("styles.min.css"))
        .pipe(gulp.dest("dist/styles"));
}

// обрабатываем скрипты
function js() {
    return gulp
        .src("src/scripts/dev/*.js")
        .pipe(plumber()) // если сервер падает, чтобы сайт остался на последней рабочей версии (нужно для отлова ошибок в коде)
        .pipe(
            include({
                prefix: "//@@",
                basepath: "@file"
            })
        )
        .pipe(gulp.dest("dist/scripts"))
        .pipe(terser()) // минимфикация js файлов
        .pipe(
            rename(function (path) {
                path.basename += ".min";
            })
        )
        .pipe(gulp.dest("dist/scripts"));
}

// копирует все js файлы без изменения из папки vendor
function jsCopy() {
    return gulp
        .src(resources.jsVendor)
        .pipe(plumber())
        .pipe(gulp.dest("dist/scripts"));
}

// копирование всех файлов без изменений (которые не хотим обрабатывать)
function copy() {
    return gulp
        .src(resources.static, {
            base: "src"
        })
        .pipe(gulp.dest("dist/"));
}

// обраблтка изображений
function images() {
    return gulp
        .src(resources.images)
        .pipe(
            imagemin([
                imagemin_gifsicle({ interlaced: true }),
                imagemin_mozjpeg({ quality: 100, progressive: true }),
                imagemin_optipng({ optimizationLevel: 3 })
            ])
        )
        .pipe(gulp.dest("dist/assets/images"));
}

function svgSprite() {
    return gulp
        .src(resources.svgSprite)
        .pipe(
            svgmin({
                js2svg: {
                    pretty: true
                }
            })
        )
        .pipe(
            svgstore({
                inlineSvg: true
            })
        )
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("dist/assets/icons"));
}

const build = gulp.series(
    clean,
    copy,
    includeHtml,
    style,
    js,
    jsCopy,
    images,
    svgSprite
);

function reloadServer(done) {
    server.reload();
    done();
}

function serve() {
    server.init({
        server: "dist"
    });
    // watch отслеживает все изменения по указанным путям в resources и повторно вызывает соответствующие методы и перезапускает сервер
    gulp.watch(resources.html, gulp.series(includeHtml, reloadServer));
    gulp.watch(resources.less, gulp.series(style, reloadServer));
    gulp.watch(resources.jsDev, gulp.series(js, reloadServer));
    gulp.watch(resources.jsVendor, gulp.series(jsCopy, reloadServer));
    gulp.watch(resources.static, { delay: 500}, gulp.series(copy, reloadServer));
    gulp.watch(resources.images, { delay: 500}, gulp.series(images, reloadServer));
    gulp.watch(resources.svgSprite, gulp.series(svgSprite, reloadServer));
}

const start = gulp.series(build, serve);

export {
    clean,
    copy,
    includeHtml,
    style,
    js,
    jsCopy,
    images,
    svgSprite,
    build,
    serve,
    start
}
