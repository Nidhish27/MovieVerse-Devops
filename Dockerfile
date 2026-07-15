FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY website/ .

EXPOSE 80

CMD ["nginx","-g","daemon off;"]