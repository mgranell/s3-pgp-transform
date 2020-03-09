#/bin/bash
if [ -f dectest.md ];then rm dectest.md;fi
if [ -f dectest.md.pgp ];then rm dectest.md.pgp;fi

gpg --batch --trust-model always -r pgp@test.local -o dectest.md.pgp -e ../README.md
aws s3 cp dectest.md.pgp s3://mg-s3-pgp-dec-bucket/

echo Waiting for decryption to complete
aws s3api wait object-exists --bucket mg-s3-pgp-dec-bucket --key dectest.md
aws s3 mv s3://mg-s3-pgp-dec-bucket/dectest.md .
diff -s dectest.md ../README.md
