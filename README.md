UX Sleuth web application source code

# API keys
Plug openai and browserless API keys into compose.dev.yaml and compose.prod.yaml

# Project structure
The project is split up into 3 different portions; the backend server, frontend static file server, and an nginx server to direct traffic to either servers appropriately. This project is deployed using docker compose.

These components are integrated with each other as follows:
	- Nginx is exposed on port 80 (Prod and Dev)
	- Backend server is exposed on port 3000 (Prod and Dev)
	- Frontend static file server is exposed on port 3000 (Prod and Dev)


The server code is located in the /server directory along with its Dockerfile.
THe frontend react code is located in the /client directory along with its Dockerfile.

The file structure is as follows:

uxsleuth_app
|-client/		React frontend application
| |-Dockerfile.dev	Dockerfile with development commands, variables, etc.
| |-Dockerfile.prod	Dockerfile with production commands, variables, etc.
| |-...
|-server/		Node.js API/backend server
| |-Dockerfile.dev	Dockerfile with development commands, variables, etc.
| |-Dockerfile.prod	Dockerfile with production commands, variables, etc.
| |-package.json
| |-package-lock.json
| |-node_modules/
| |-src/
| | |-index.js
| |-...
|-nginx/
| |-Dockerfile.dev	Dockerfile with development commands, variables, etc.
| |-Dockerfile.prod	Dockerfile with production commands, variables, etc.
| |-nginx.dev.conf	Prod nginx config
| |-nginx.prod.conf	Dev nginx config
|-README
|-compose.dev.yaml	docker compose yaml file, configured for a dev environment
|-compose.prod.yaml	docker compose override for production environment (simply points to the Dockerfile.prod path in both of server/ and client/)
|-Makefile		features dev and prod targets to start the containers

# Setting up the dev environment
The server and client subdirectories each contain a Dockerfile.dev and Dockerfile.prod file that contains the relevant environmental variables and docker commands for the respective development and production environments. The Makefile at the root of the project contains targets dev and prod. 

Run `npm install` in both `/client` and `/server` to install dependencies for both (these are transferred to the docker images when compiled).
Run `make dev` to start the application in the development environment.
This will bring up a series of networked docker containers.
The app is accessible through `http://localhost/`.
*Note: Please use linux, hot-reloading may not work through docker with the current setup on other systems (though with an env var flag, can)

# Deploying to production
Similarly to the dev environment, the production environment can be started with `make prod`.

The app is accessible through `http://localhost/`.

# Server notes
The server runs a Node app responsible for hosting API endpoints and interacting with backend components (spider/bot, database, etc.)

NPM is used for the React app dependencies as well as the Node.js server dependencies, although these are separated (server/ and client/ each have their own package.json).
