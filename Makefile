all: optimize_require uglify

optimize_require:
	r.js -o baseUrl='./public/js/app' name=main out='./public/app.js'

uglify:
	rm -f ./public/out.js
	uglifyjs ./public/js/lib/*.js \
	         ./public/hcj/type/is.js \
	         ./public/hcj/type/type.js \
	         ./public/hcj/hcj.js \
	         ./public/hcj/libs.js \
	         ./public/Err.js \
	         ./public/editorType.js \
	         ./public/type.js \
	         ./public/schema.js \
	         ./public/main.js \
	         -o ./public/out.js
