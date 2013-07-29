module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma']);

  grunt.registerTask('build-doc', ['uglify', 'copy']);

  var testConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

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
        css : [
          '<%= bower %>/codemirror/lib/codemirror.css',
          '<%= bower %>/codemirror/theme/rubyblue.css'
        ],
        js : [
          '<%= bower %>/codemirror/lib/codemirror.js',
          'build/ui-codemirror.min.js'
        ]
      }
    },
    karma: {
      unit: testConfig('test/karma.conf.js')
    },
    jshint:{
      all:['ui-codemirror.js', 'gruntFile.js','test/**/*.js'],
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
          {src: ['<%= meta.view.repoName %>.js'], dest: '<%= dist %>/build/<%= meta.view.repoName %>.js', filter: 'isFile'},
          {src: ['<%= bower %>/codemirror/lib/codemirror.js'], dest: '<%= dist %>/<%= bower %>/codemirror/lib/codemirror.js', filter: 'isFile'},
          {src: ['<%= bower %>/codemirror/lib/codemirror.css'], dest: '<%= dist %>/<%= bower %>/codemirror/lib/codemirror.css', filter: 'isFile'},
          {src: ['<%= bower %>/codemirror/theme/rubyblue.css'], dest: '<%= dist %>/<%= bower %>/codemirror/theme/rubyblue.css', filter: 'isFile'}
        ]
      },
      template : {
        options : {processContent : function(content){
          return grunt.template.process(content);
        }},
        files: [
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'}
        ]
      }
    }
  });

};