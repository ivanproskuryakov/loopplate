#!/bin/bash

local_directory=$PWD
db_name="loopplate"
host="loopplate.com"

ssh -p 22 root@${host} "cd /tmp && mongodump -o ${db_name} && tar -czvf db.tar.gz /tmp/${db_name}"
scp -r root@${host}:/tmp/db.tar.gz "${local_directory}/db.tar.gz"

tar -zxvf db.tar.gz
mongo ${db_name} --eval "db.dropDatabase()"
mongorestore --host 127.0.0.1 --db ${db_name} --batchSize=10 "${local_directory}/tmp/${db_name}/${db_name}/"

ssh -p 22 root@${host} "rm -rf /tmp/${db_name}"
rm -rf "${local_directory}/tmp/"
rm "${local_directory}/db.tar.gz"
