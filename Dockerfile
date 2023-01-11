FROM node:18

COPY ./frontend /home/frontend
COPY ./backend /home/backend
COPY ./shared /home/shared

WORKDIR /home/frontend

RUN npm i --force && npm run build && cp -r /home/frontend/dist /home/backend/public/dist

WORKDIR /home/backend

RUN npm i --force && rm -rf /home/frontend

CMD ["npm", "start"]