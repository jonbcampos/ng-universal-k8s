FROM node:8-alpine
WORKDIR /app
COPY . /app/
RUN npm install --unsafe-perm || \
    ((if [ -f npm-debug.log ]; then \
        cat npm-debug.log; \
    fi) && false)
EXPOSE 4000
RUN npm run build:ssr
CMD npm run serve:ssr