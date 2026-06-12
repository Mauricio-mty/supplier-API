# Stage 1: Build the NestJS application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
