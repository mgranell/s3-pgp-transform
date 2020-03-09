#/bin/sh
rm ./README3.*
aws s3 cp ../README.md s3://mg-s3-pgp-enc-bucket/README3.md
aws s3api wait object-exists --bucket mg-s3-pgp-enc-bucket --key README3.md.pgp
aws s3 mv s3://mg-s3-pgp-enc-bucket/README3.md.pgp .
gpg --output README3.md --decrypt README3.md.pgp 
diff -s README3.md ../README.md