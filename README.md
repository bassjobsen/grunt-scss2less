# grunt-scss2less v0.0.1

> Convert SCSS (SASS) files to Less 

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-scss2less --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-scss2less');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/gruntjs/grunt-contrib-less/tree/grunt-0.3-stable).*


## Less task
_Run this task with the `grunt scss2less` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.


### Usage Examples

```js
	scss2less: {
	  convert: {
		options: {
		  paths: ["./"]
		},
		files: [{
          expand: true,
          cwd: 'sass',
          src: '**/*.scss',
          dest: 'less',
          ext: '.less',
          rename: function(dest, src) { return dest + '/' + src.replace('_','');}
      }]
	}
	}
```
### Known issues
Notice that this plugin does 90% - 99% of the work. AFAIK some SCSS code can not be convert to Less automatically.
If you have got any idea how to fix these issues, please feel free to post an issue or PR.

#### Custom project code (especialy functions)
Both SASS and Less enable you to define custom function. Custom function in SASS are defined in the code by using the `@function` directive whilest custom function in LESS are set as an option for the compiler.

Cutsom function should be detected in the first place and then if possible rewritten for Less (port to JavaScript). This plugin can output the compiler option and JavaScript function definition at best, but conversion of a SCSS `@function` definition to Less is not possible for now.

#### Loops
[Loops in Less](http://lesscss.org/features/#loops-feature) are created with  mixins guards based on recursion. SASS (or SCSS) support loops with a `@for $i from .. through ..` syntax. Automatic conversion of these loops require more than some simple regular expressions. Currently the plugin does not support conversion of loops at all.

### Regular expressions
The current conversion is base on regular expressions, which also can easily be use for other languages and tool. The following regular expressions are used (Javascript):

```js
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
```
