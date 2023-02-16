# Papotecar API

This API is built using AdonisJS.

### ✨ [Application](https://papotecar-frontend.vercel.app/)

### 🚀 [API](https://papotecar-backend.onrender.com/)

## Installation

```sh
# Install dependencies
npm ci

# Create environment files for development and testing
cp .env.example .env

# Generate app key and replace it to .env file at APP_KEY
node ace generate:key

# Databases - PostgreSQL
# If you have docker on your machine, you can use it to run the database for development and testing environment.
# By default it will be create two databases, one for development and one for testing named `papote_car` and `papote_car_test`.
docker-compose up -d

# Run database migrations
node ace migration:run
```

The OpenAPI documentation is available [HERE](https://papotecar-backend.onrender.com/docs).
You can also view it with an OpenAPI readers like [Redoc](https://papotecar-backend.onrender.com/swagger.json).

### Seeds

It's possible to populate database with some seeders. It will generate random `users`, `trips` and more.

```sh
# Run database seeders
node ace db:seed
```

## Usage

```sh
# Run server in watch mode
node ace serve --watch
```

By default, the server started at port `3333`.

## Tests

```sh
# Run tests
npm run test

# Run tests + show code coverage
npm run coverage
```
