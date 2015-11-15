all:
	rm ./public/app.js
	cd ./public/js/app; find -name '*.js' | sed 's/\.\/\(.*\)\.js/\1/' | xargs -I file sed "s/define(/define('file', /" ./file.js > ../../app.js
	rm -f ./public/out.js
	uglifyjs ./public/js/lib/*.js \
	         ./public/hcj/dist/hcj.js \
	         ./public/Err.js \
	         ./public/editorType.js \
	         ./public/type.js \
	         ./public/schema.js \
	         ./public/main.js \
			 ./public/app.js \
	         -mo ./public/out.js
