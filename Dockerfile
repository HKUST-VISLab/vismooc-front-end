FROM nginx:1.13.6-alpine
ADD ./dist /usr/share/nginx/html
ADD ./nginx.conf.template /etc/nginx/conf.d/default.conf.template
EXPOSE 80

ENV WEB_SERVER_HOST web
ENV WEB_SERVER_PORT 9999

CMD /bin/sh -c "envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
