# Use the official Node.js image as a base
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy the build output and node_modules from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Expose port 3000 and define the command to run the app
EXPOSE 3000
CMD ["npm", "run", "dev"]

