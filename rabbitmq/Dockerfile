FROM rabbitmq:3.13-alpine

# Active le plugin de management
RUN rabbitmq-plugins enable rabbitmq_management

# Copie la config
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

# Expose les ports
EXPOSE 5672 15672


