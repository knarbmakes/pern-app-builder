#!/bin/bash

# Prereqs
# chmod +x setup_app.sh
# npm install -g create-react-app

# Capture the directory where the script is located
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if project name is provided
if [ -z "$1" ]; then
  echo "Please provide a project name."
  exit 1
fi

# Initialize project directory
project_name=$1
mkdir $project_name
cd $project_name

# Initialize package.json in the root directory
echo "{
  \"name\": \"$project_name\",
  \"version\": \"1.0.0\",
  \"scripts\": {
    \"client\": \"yarn workspace client start\",
    \"server\": \"yarn workspace server start\",
    \"mongodb\": \"docker run --name mongodb-local -p 27017:27017 -d mongo:latest\"
  },
  \"workspaces\": [
    \"packages/*\"
  ],
  \"private\": true
}" > package.json

# Create packages directory
mkdir packages
cd packages

# Initialize each folder as a yarn package

## Server setup
mkdir server
cd server

### Initializing Node.js project
echo "Initializing Node.js project..."
yarn init -y

### Create .env file
echo "Creating .env file with MONGO_URI..."
echo "MONGODB_URI=mongodb://localhost:27017/$project_name" > .env
echo "JWT_SECRET_KEY=localsecret" >> .env

### Install Dependencies
echo "Installing dependencies..."
yarn add express mongoose jsonwebtoken env-var cors cookie-parser pino pino-http ulid bcrypt
yarn add typescript ts-node @types/node @types/express @types/cors @types/jsonwebtoken @types/cookie-parser dotenv pino-pretty nodemon @types/bcrypt --dev

### Initialize TypeScript
echo "Initializing TypeScript..."
npx tsc --init

### Create Project Structure
echo "Creating project structure..."
mkdir -p src

### Copy template files from the predefined directory
template_directory="$script_dir/templates/server"
echo "Template directory: $template_directory"
if [ -d "$template_directory" ]; then
  echo "Copying template files..."
  cp -R $template_directory/* src/
else
  echo "Template directory not found. Skipping file copy."
fi

### Update package.json to include start script
echo "Adding start script to package.json..."
jq '.scripts.start = "nodemon --exec ts-node src/index.ts | pino-pretty --singleLine"' package.json > temp.json && mv temp.json package.json

### Setup Complete Message
echo "Server setup complete! You can now run the server using 'yarn start'"

# Navigate back to packages directory
cd ..

## Client setup using create-react-app
npx create-react-app client --template typescript

### Copy template files from the predefined directory for the client
template_directory_client="$script_dir/templates/client"
echo "Client template directory: $template_directory_client"
if [ -d "$template_directory_client" ]; then
  echo "Copying client template files..."
  cp -R $template_directory_client/* client/src/
else
  echo "Client template directory not found. Skipping file copy."
fi

### Install additional client dependencies
cd client
echo "Installing additional client dependencies: chakra-ui, axios..."
yarn add @chakra-ui/react @chakra-ui/core @emotion/react @emotion/styled framer-motion axios react-query
yarn add @types/react-query @types/axios http-proxy-middleware --dev

## Setup client .env file
echo "Creating .env file with MONGO_URI..."
echo "REACT_APP_LOGGING_ENV=development" > .env
echo "REACT_APP_BACKEND_API_URL=/api" >> .env
cd ..

## Common package setup
mkdir common
cd common
yarn init -y
echo "{
  \"name\": \"common\",
  \"version\": \"1.0.0\",
  \"main\": \"src/index.ts\",
  \"license\": \"MIT\",
  \"dependencies\": {},
  \"devDependencies\": {
    \"typescript\": \"^4.3.2\"
  }
}" > package.json
mkdir src

### Copy template files from the predefined directory for common
template_directory_common="$script_dir/templates/common"
echo "Common template directory: $template_directory_common"
if [ -d "$template_directory_common" ]; then
  echo "Copying common template files..."
  cp -R $template_directory_common/* src/
else
  echo "Common template directory not found. Skipping file copy."
fi

# Go back to the root directory
cd ../..

# Install dependencies
yarn install
