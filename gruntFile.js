module.exports = function (grunt) {

  var _ = grunt.util._;

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('server', ['karma:start']);
  grunt.registerTask('build-doc', ['uglify', 'copy']);

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
    '<%= bower %>/codemirror/theme/rubyblue.css'
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
        humaName : "UI CodeMirror",
        repoName : "ui-codemirror",
        demoHTML : grunt.file.read("demo/demo.html"),
        demoJS : grunt.file.read("demo/demo.js"),
        css : css_dependencies,
        js : js_dependencies.concat(['build/ui-codemirror.min.js'])
      }
    },
    watch: {
      karma: {
        files: ['ui-codemirror.js', 'gruntFile.js','test/*.js', 'demo/*.js'],
        tasks: ['jshint', 'karma:unit:run'] //NOTE the :run flag
      }
    },
    karma: {
      unit: testConfig('test/karma.conf.js'),
      start: {configFile: 'test/karma.conf.js'}
    },
    jshint:{
      all:['ui-codemirror.js', 'gruntFile.js','test/*.js', 'demo/*.js'],
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
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'}
        ].concat(_.map(js_dependencies.concat(css_dependencies), function(f){
            return {src: [f], dest: '<%= dist %>/' + f, filter: 'isFile'};
          }))
      }
    }
  });

};