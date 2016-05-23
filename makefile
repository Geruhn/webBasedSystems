all:
	redis-server &
	node app.js 
