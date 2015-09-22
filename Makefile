all: less

less:
	./node_modules/less/bin/lessc public/style.less > public/style.css
