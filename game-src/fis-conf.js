var staticRoot = '/static'; //实际静态资源根目录
var tplRoot = '/templates'; //模版根目录

fis.hook('commonjs');

// 所有的文件产出到 {staticRoot} 目录下
fis.match('*', {
    release: staticRoot + '$0',
    useHash : false
});


//排除不需要产出的文件
fis
    .match('*.{sh,md,json,log,scss}', {
        release: false
    })
    .match('.gitignore', {
        release: false
    });

// 文档文件不产出
fis.match('/doc/**', {
    release: false
});

// 本地模拟数据产出到根test目录下，否则无法模拟动态数据
fis.match('/mock/**', {
    release: '/test/$0'
});

// fis模拟配置文件
fis.match('/mock/server.conf', {
    release: '/config/server.conf'
});


// components源码目录下的资源被标注为组件
fis.match(/\/components\/(.*)/i, {
    id: '$1',
    isMod: true
});

// 简化components下的js组件的id
fis.match(/\/components\/(.*)\.js/i, {
    id: '$1'
});

// page源码目录下的资源被标注为组件
fis.match('/page/**/*', {
    isMod: true
});

// test 目录下的原封不动产出到 test 目录下
fis.match('/test/**', {
    release: '$0'
});

// 所有模板放到 {tplRoot} 目录下
fis.match('*.html', {
    release: tplRoot + '$0',
    parser: fis.plugin('html-uri')
});

// 前端模板
fis.match('**.tpl', {
    release : false,
    parser: fis.plugin('utc'), // invoke `fis-parser-utc`,
    isJsLike: true,
    isMod:false //避免被当作组件包装
});


fis.match('::packager', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'commonJs',
        useInlineMap: true // 资源映射表内嵌
    })
});

//生产环境

// 本地模拟数据不产出
fis.media('prod')
    .match(/^\/mock\/(.*)/i, {
        release: false
    });

// optimize
fis.media('prod')
    .match('*.{scss,map}', {
        release: false
    })
    //暂时关闭hash值，因为还没想好前端页面hash变化后，服务端页面如何更好地做对应更改
    //.match('*.{css,js}', {
    //    useHash : true
    //})
    //.match('image', {
    //    useHash: true
    //})
    .match('*.js', {
        optimizer: fis.plugin('uglify-js', {
            mangle: {
                expect: ['require', 'define'] //不想被压的
            }
        })
    })
    .match('*.css', {
        useSprite: true,
        optimizer: fis.plugin('clean-css', {
            'keepSpecialComments': 0
        })
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor') // 用 fis-optimizer-png-compressor 压缩 png 图片
    });

// pack
fis.media('prod')
    .match('/components/jquery/jquery.js', { //常用公用组件单独合并打包
        packTo: '/pkg/lib.js'
    })
    // 启用打包插件，必须匹配 ::packager
    .match('::packager', {
        postpackager: fis.plugin('loader', {
            allInOne: true
        }),
        packager: fis.plugin('map'),
        spriter: fis.plugin('csssprites', {
            layout: 'matrix',
            margin: '15'
        })
    });
