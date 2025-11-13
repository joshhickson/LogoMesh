# Taken from https://github.com/redis/docker-library-redis/blob/master/7.2/alpine/Dockerfile
FROM alpine:3.18

RUN set -eux; \
	addgroup -g 1000 redis; \
	adduser -u 1000 -G redis -s /bin/sh -D redis; \
	apk add --no-cache \
		su-exec \
		tzdata \
	;

ENV REDIS_VERSION 7.2.4
ENV REDIS_DOWNLOAD_URL https://download.redis.io/releases/redis-7.2.4.tar.gz
ENV REDIS_DOWNLOAD_SHA 8d104c26a154b29fd67d6568b4f375212212ad41e0c2caa3d66480e78dbd3b59

RUN set -eux; \
	\
	apk add --no-cache --virtual .build-deps \
		coreutils \
		dpkg-dev dpkg \
		gcc \
		jemalloc-dev \
		linux-headers \
		make \
		musl-dev \
		openssl-dev \
		tar \
	; \
	\
	wget -O redis.tar.gz "$REDIS_DOWNLOAD_URL"; \
	echo "$REDIS_DOWNLOAD_SHA *redis.tar.gz" | sha256sum -c -; \
	mkdir -p /usr/src/redis; \
	tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1; \
	rm redis.tar.gz; \
	\
# https://github.com/redis/redis/blob/7.2/Makefile#L268
	gnumake="make"; \
	export BUILD_TLS=yes; \
	export USE_JEMALLOC=yes; \
	export JEMALLOC_LIB_PATH="/usr/lib/$(gcc -dumpmachine)/libjemalloc.so.2"; \
	$gnumake -C /usr/src/redis/deps; \
	$gnumake -C /usr/src/redis; \
	$gnumake -C /usr/src/redis install; \
	\
	rm -r /usr/src/redis; \
	\
	runDeps="$( \
		scanelf --needed --nobanner --format '%n#p' --recursive /usr/local \
			| tr ',' '\n' \
			| sort -u \
			| awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
	)"; \
	apk add --no-network --virtual .redis-rundeps $runDeps; \
	apk del --no-network .build-deps; \
	\
	mkdir /data; \
	chown redis:redis /data

VOLUME /data
WORKDIR /data

COPY docker-entrypoint.sh /usr/local/bin/
# Ensure entrypoint has Unix line endings and is executable (fixes CRLF shebang issues on Windows hosts)
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
	chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 6379
CMD ["redis-server", "--protected-mode", "no"]
