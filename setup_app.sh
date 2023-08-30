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

# Create start_postgres.sh script
echo "#!/bin/bash
# Stop and remove any existing container with the name postgres-local
docker stop postgres-local || true && docker rm postgres-local || true

# Start a new PostgreSQL container
docker run --name postgres-local -e POSTGRES_PASSWORD=localpassword -p 5432:5432 -d postgres:latest

# Wait for a few seconds to ensure the PostgreSQL container is fully up
sleep 5

# Create the database
docker exec -it postgres-local psql -U postgres -c \"CREATE DATABASE $project_name;\"
" > start_postgres.sh

# Make it executable
chmod +x start_postgres.sh

# Modify package.json to call this script for the postgres command
echo "{
  \"name\": \"$project_name\",
  \"version\": \"1.0.0\",
  \"scripts\": {
    \"client\": \"yarn workspace client start\",
    \"server\": \"yarn workspace server start\",
    \"postgres\": \"./start_postgres.sh\"
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
echo "Creating .env file with PostgreSQL settings..."
echo "POSTGRES_HOST=localhost" > .env
echo "POSTGRES_PORT=5432" >> .env
echo "POSTGRES_USER=postgres" >> .env
echo "POSTGRES_PASSWORD=localpassword" >> .env
echo "POSTGRES_DB=$project_name" >> .env
echo "JWT_SECRET_KEY=localsecret" >> .env


### Install Dependencies
echo "Installing dependencies..."
yarn add express pg typeorm reflect-metadata jsonwebtoken env-var cors cookie-parser pino pino-http ulid bcrypt glob
yarn add typescript ts-node @types/node @types/express @types/cors @types/jsonwebtoken @types/cookie-parser dotenv pino-pretty nodemon @types/bcrypt @types/pg --dev

### Initialize TypeScript
echo "Initializing TypeScript..."
npx tsc --init

# Add experimentalDecorators and strictPropertyInitialization to tsconfig.json
sed -i '/"strict": true,/a \    "experimentalDecorators": true,\n    "strictPropertyInitialization": false,' tsconfig.json

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
echo "Creating .env file with REACT_APP_ environment variables..."
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

# Copy .vscode/settings.json from the script directory to the project directory
vscode_settings_src="$script_dir/.vscode/settings.json"
vscode_settings_dest=".vscode/settings.json"

if [ -f "$vscode_settings_src" ]; then
  echo "Copying .vscode/settings.json..."
  # Create .vscode folder in the project directory if it doesn't exist
  mkdir -p ".vscode"
  cp "$vscode_settings_src" "$vscode_settings_dest"
else
  echo ".vscode/settings.json not found in the script directory. Skipping copy."
fi

# Install dependencies
yarn install
