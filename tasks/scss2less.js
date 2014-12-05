/*
 * grunt-scss2less
 * https://github.com/bassjobsen/grunt-scss2les
 *
 * Copyright (c) 2014 Bass Jobsen, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');

module.exports = function(grunt) {
  var scss2lessOptions = {};

  grunt.registerMultiTask('scss2less', 'Convert SCSS (SASS) files to Less.', function() {
    var done = this.async();

    var options = this.options({
      report: 'min'
    });

    if (this.files.length < 1) {
      grunt.verbose.warn('Destination not written because no source files were provided.');
    }
	
    async.eachSeries(this.files, function(f, nextFileObj) {
      var destFile = f.dest;

      var files = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      if (files.length === 0) {
        if (f.src.length < 1) {
          grunt.log.warn('Destination ' + chalk.cyan(destFile) + ' not written because no source files were found.');
        }

        // No src files, goto next target. Warn would have been issued above.
        return nextFileObj();
      }

      var lessCode;
      var i = 0;

      async.concatSeries(files, function(file, next) {

       convertSCSS(file, options, function(less, err) {
          if (!err) {
            lessCode = less;
            process.nextTick(next);					
          } else {
            nextFileObj(err);
          }
        });
      }, 
      function() {
        if (lessCode.length < 1) {
          grunt.log.warn('Destination ' + chalk.cyan(destFile) + ' not written because compiled files were empty.');
        } else {
          grunt.file.write(destFile, lessCode);
          grunt.log.writeln('File ' + chalk.cyan(destFile) + ' created');
        }
        nextFileObj();
      });

    }, done);
  });

  var convertSCSS = function(srcFile, options, callback) {
    options = _.assign({filename: srcFile}, options);
    options.paths = options.paths || [path.dirname(srcFile)];

    if (typeof options.paths === 'function') {
      try {
        options.paths = options.paths(srcFile);
      } catch (e) {
        grunt.fail.warn(wrapError(e, 'Generating @import paths failed.'));
      }
    }


    var css,
    less,
    srcCode = grunt.file.read(srcFile);

      try {
        less = convert(srcCode);
        callback(less, null);
      } catch (e) {
        scss2lessError(e, srcFile);
        callback(less, true);
      }
   
  };
  var scss2lessError = function(e, file) {
    var message = 'error';

    grunt.log.error(message);
    grunt.fail.warn('Error compiling ' + file);
  };
  
  var convert = function (source) {
    source = source.replace(/@mixin /g,'.');
    source = source.replace(/@include /g,'.');
    source = source.replace(/\$(\w+)/g,"@$1");
    source = source.replace(/@extend ([\w\-\.]+);/g,"&:extend( $1 );");
    source = source.replace(/ !default/g,'');
    source = source.replace(/#{([^}]+)}/g,"~\"$1\"");
    source = source.replace(/~\"@(\w+)\"/g,"@{$1}");
    source = source.replace(/adjust-hue\(/g,'spin(');
    
    source = source.replace(/(@if)([^{]+)({)/g,function(match,m1,m2,m3){ 
		var result = '& when';
		result += m2.replace(/==/g,'=');
		result += m3;
		return result;
	});
  return source;
  };
};
