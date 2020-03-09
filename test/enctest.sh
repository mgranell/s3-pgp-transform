#/bin/bash
if [ -f README3.md ];then rm README3.md;fi
if [ -f README3.md.pgp ];then rm README3.md.pgp;fi

aws s3 cp ../README.md s3://mg-s3-pgp-enc-bucket/README3.md
echo Waiting for encrypted file
aws s3api wait object-exists --bucket mg-s3-pgp-enc-bucket --key README3.md.pgp
aws s3 mv s3://mg-s3-pgp-enc-bucket/README3.md.pgp .

echo Comparing files
gpg --output README3.md --decrypt README3.md.pgp 
diff -s README3.md ../README.md