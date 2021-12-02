FROM node:12 # Updated to address the certificate issue from Let'sEncrypt in Oct 2021
# This is a relatively untested change, so use at your own risk. 

ARG NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /opt/app/

COPY package.json /opt/app/

RUN npm install \
  && rm -rf /root/.npm

COPY . /opt/app

ENV PATH /opt/app/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
EXPOSE 3000

CMD ["npm", "start"]
