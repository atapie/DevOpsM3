FROM    centos:centos6

# Enable EPEL for Node.js
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# Install Node.js and npm
RUN     yum install -y npm
# Install mailx for sending out email alerts
RUN     yum install -y mailx
RUN     yum install -y sendmail
ADD     emailscript.sh /home/emailscript.sh
# Bundle app source
COPY . /src
# Install app dependencies
RUN cd /src; npm install

EXPOSE  8080
CMD ["node", "/src/main.js", "8080", "/src"]
