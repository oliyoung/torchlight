# Stage 1: Builder
# Use a Node.js image suitable for building Next.js apps
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# Set NEXT_TELEMETRY_DISABLED=1 to disable telemetry during build
# Use output standalone for a smaller production image
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# Stage 2: Runner
# Use a minimal image like node:20-alpine or a distroless image for production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public

# Set environment variables for Next.js standalone mode
# These are required for Next.js to find files in the standalone output
ENV PORT 3000
ENV HOST 0.0.0.0
ENV NODE_ENV production

# Expose the port the application listens on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]

# App Runner Build Commands (Optional - Can configure in App Runner or apprunner.yaml)
# If you were using apprunner.yaml, you might specify build steps here.
# However, with build from source and Dockerfile, App Runner handles these.
# The Dockerfile RUN commands are executed during the build phase.
# Start command is handled by the CMD instruction above.