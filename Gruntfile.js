module.exports = function(grunt) {
  require("time-grunt")(grunt);

  // Pull defaults (including username and password) from .screeps.json
  var config = require("./.screeps.json")

  // Allow grunt options to override default configuration
  var accountAlias = grunt.option("accountAlias") || config.accountAlias;
  var branch = grunt.option("branch") || config.branch;
  var email = grunt.option("email") || config.email;
  var password = grunt.option("password") || config.password;
  var private_directory = grunt.option("private_directory") || config.private_directory;
  var ptr = grunt.option("ptr") ? true : config.ptr;
  var token = grunt.option("token") || config.token;


  var currentdate = new Date();
  grunt.log.subhead("Task Start: " + currentdate.toLocaleString())
  grunt.log.writeln("Branch: " + branch)

  // Load needed tasks
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-file-append");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-rsync");
  grunt.loadNpmTasks("grunt-screeps-new");

  grunt.initConfig({

    // Push all files in the dist folder to screeps. What is in the dist folder
    // and gets sent will depend on the tasks used.
    screeps: {
      options: {
        // 通过accountAlias设置账户昵称
        accountAlias: accountAlias,
        // 注意：Token登陆为可选项，有Token的情况下优先使用Token登陆
        // Token 登陆只能用于官服，无法应用于私服
        token: token,
        email: email,
        password: password,
        branch: branch,
        ptr: ptr
      },
      dist: {
        src: ['dist/*.js']
      }
    },


    // Copy all source files into the dist folder, flattening the folder
    // structure by converting path delimiters to underscores
    copy: {
      // Pushes the game code to the dist folder so it can be modified before
      // being send to the screeps server.
      screeps: {
        files: [{
          expand: true,
          cwd: "src/",
          src: "**",
          dest: "dist/",
          filter: "isFile",
          rename: function(dest, src) {
            // Change the path name utilize underscores for folders
            return dest + src.replace(/\//g, ".");
          }
        }],
      }
    },


    // Copy files to the folder the client uses to sink to the private server.
    // Use rsync so the client only uploads the changed files.
    rsync: {
      options: {
        args: ["--verbose", "--checksum"],
        exclude: [".git*"],
        recursive: true
      },
      private: {
        options: {
          src: "./dist/",
          dest: private_directory,
        }
      },
    },


    // Add version variable using current timestamp.
    file_append: {
      versioning: {
        files: [{
          append: "\nglobal.SCRIPT_VERSION = " + currentdate.getTime() + "\n",
          input: "dist/version.js",
        }]
      }
    },


    // Remove all files from the dist folder.
    clean: {
      "dist": ["dist"]
    },


    // Documentation
    jsdoc: {
      dist: {
        src: ['src/*.js', 'test/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },


    // Apply code styling
    jsbeautifier: {
      modify: {
        src: ["src/**/*.js"],
        options: {
          config: ".jsbeautifyrc"
        }
      },
      verify: {
        src: ["src/**/*.js"],
        options: {
          mode: "VERIFY_ONLY",
          config: ".jsbeautifyrc"
        }
      }
    },



    // Compress code
    uglify: {
      buildb: { //任务二：压缩b.js，输出压缩信息
        options: {
          report: "min" //输出压缩率，可选的值有 false(不输出信息)，gzip
        },
        files: {
          'output/js/b.min.js': ['js/main/b.js']
        }
      },
    }


  })

  // Combine the above into a default task
  grunt.registerTask("default", ["clean", "copy:screeps", "file_append:versioning", "screeps"]);
  grunt.registerTask("fake", ["clean", "copy:screeps", "file_append:versioning", "jsdoc"]);
  grunt.registerTask("private", ["clean", "copy:screeps", "file_append:versioning", "rsync:private"]);
  grunt.registerTask("test", ["jsbeautifier:verify"]);
  grunt.registerTask("pretty", ["jsbeautifier:modify"]);
}
