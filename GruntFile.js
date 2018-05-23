module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      options: {
        email: 'msmeeks1+screeps@gmail.com',
        password: 'IaAYP4DXFKru',
        branch: 'default',
        ptr: false
      },
      dist: {
        src: ['src/*.js']
      }
    }
  });

};

