module.exports = function (grunt) {
  'use strict';

  var _ = grunt.util._;

  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous', 'watch']);
  grunt.registerTask('build-doc', ['uglify', 'copy']);

  // HACK TO ACCESS TO THE COMPONENT-PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/component-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //

  var testConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  var js_dependencies =[
    '<%= bower %>/angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
    '<%= bower %>/codemirror/lib/codemirror.js',
    '<%= bower %>/codemirror/mode/scheme/scheme.js',
    '<%= bower %>/codemirror/mode/javascript/javascript.js',
    '<%= bower %>/codemirror/mode/xml/xml.js',
  ];

  var css_dependencies = [
    '<%= bower %>/codemirror/lib/codemirror.css',
    '<%= bower %>/codemirror/theme/twilight.css'
  ];

  // Project configuration.
  grunt.initConfig({
    bower: 'bower_components',
    dist : '<%= bower %>/angular-ui-docs',
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n'),
      view : {
        humaName : 'UI CodeMirror',
        repoName : 'ui-codemirror',
        demoHTML : grunt.file.read('demo/demo.html'),
        demoJS : grunt.file.read('demo/demo.js'),
        css: css_dependencies.concat(['assets/css/demo.css']),
        js : js_dependencies.concat(['build/ui-codemirror.min.js'])
      }
    },
    watch: {
      test: {
        files: ['<%= meta.view.repoName %>.js', 'test/*.js'],
        tasks: ['jshint', 'karma:unit:run']
      },
      demo: {
        files: ['demo/*', '<%= meta.view.repoName %>.js'],
        tasks: ['uglify', 'copy']
      }
    },
    karma: {
      unit: testConfig('test/karma.conf.js'),
      server: {configFile: 'test/karma.conf.js'},
      continuous: {configFile: 'test/karma.conf.js',  background: true }
    },

    connect: {
      options: {
        base : '<%= dist %>',
        port: grunt.option('port') || '8000',
        hostname: grunt.option('host') || 'localhost',
        open : true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    },

    jshint:{
      all:['<%= meta.view.repoName %>.js', 'gruntFile.js','test/*.js', 'demo/*.js'],
      options:{
        curly:true,
        eqeqeq:true,
        immed:true,
        latedef:true,
        newcap:true,
        noarg:true,
        sub:true,
        boss:true,
        eqnull:true,
        globals:{}
      }
    },
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      build: {
        files: {
          '<%= dist %>/build/<%= meta.view.repoName %>.min.js': ['<%= meta.view.repoName %>.js']
        }
      }
    },
    copy: {
      main: {
        files: [
          {src: ['<%= meta.view.repoName %>.js'], dest: '<%= dist %>/build/<%= meta.view.repoName %>.js', filter: 'isFile'}
        ]
      },
      template : {
        options : {processContent : function(content){
          return grunt.template.process(content);
        }},
        files: [
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'},
          {src: ['demo/demo.css'], dest: '<%= dist %>/assets/css/demo.css'}
        ]
          .concat(
            _.map(js_dependencies.concat(css_dependencies), function (f) {
              return {src: [f], dest: '<%= dist %>/' + f, filter: 'isFile'};
          }))
      }
    },
    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    }
  });

};
