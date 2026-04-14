# Use Node.js 22
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files from src folder
COPY src/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source files
COPY src/ ./

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
