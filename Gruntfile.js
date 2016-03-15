module.exports = function(grunt) {

	// The grunt config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		typescript: {
			dist: {
				src: ['src/ts/**/*.ts'],
				dest: 'src/js',
				options: {
					references: [
						"promise"
					]
				}
			}
		},
		concat: {
			options: {
				sourceMap: true
			},
			dist: {
				src: [	
					'src/js/**/*.js'
					],
				dest: '.tmp/formspy.js'
			}
		},
		uglify: {
			options: {
				compress: true,
				mangle: true,
				sourceMap: true,
				sourceMapIncludeSources: true,
				sourceMapIn: '.tmp/formspy.js.map',
				banner: '// Created by Martin Mende. License MIT'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'build/formspy.min.js'
			}
		},
		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: ['src/ts/**/*.ts'],
				tasks: ['scripts']
			}
		}
	});

	// Load prespecified grunt tasks
	require('load-grunt-tasks')(grunt);

	// Register own tasks
	grunt.registerTask('scripts', ['typescript', 'concat', 'uglify']);
	grunt.registerTask('default', ['scripts']);
};