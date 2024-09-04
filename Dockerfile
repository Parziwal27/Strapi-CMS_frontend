FROM node:14

WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application
COPY frontend .

# Build the application
RUN npm run build

# Install a simple server to serve static content
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["serve", "-s", "build", "-l", "3001"]  
