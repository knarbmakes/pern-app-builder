
# mern-app-builder

An shell script for quickly scaffolding a MERN stack from a set of templates.

## Features

- Uses Yarn workspaces for segmenting server, client and common library for types
- Full Typescript support
- Mongoose Data Layer
- Password Login Authentication
- Common set of React hooks for querying and mutating data.

## Usage

```
git clone https://github.com/knarbmakes/mern-app-builder.git
./mern-app-builder/setup_app.sh mynewapp
```

Once finished, this will let you bring up the server and client.

```
cd mynewapp
```

Start up DB first

```
yarn mongodb
```

Server

```
yarn server
```

Client

```
yarn client
```
