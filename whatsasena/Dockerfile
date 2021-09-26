FROM fusuf/whatsasena:latest

RUN git clone https://github.com/Senuuu/ales /root/ales
WORKDIR /root/ales/
ENV TZ=Europe/Istanbul
RUN npm install supervisor -g
RUN yarn install --no-audit

CMD ["node", "bot.js"]
