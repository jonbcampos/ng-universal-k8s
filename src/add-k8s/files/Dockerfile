FROM node:8-alpine
WORKDIR /app
COPY . /app/
RUN npm install --unsafe-perm || \
    ((if [ -f npm-debug.log ]; then \
        cat npm-debug.log; \
    fi) && false)
EXPOSE <%= containerPort %>
RUN npm run build:ssr
CMD npm run serve:ssr