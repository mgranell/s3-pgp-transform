#/bin/sh
rm ./dectest.*
gpg --batch --trust-model always -r pgp@test.local -o dectest.md.pgp -e ../README.md
aws s3 cp dectest.md.pgp s3://mg-s3-pgp-dec-bucket/
aws s3api wait object-exists --bucket mg-s3-pgp-dec-bucket --key dectest.md.dec
aws s3 mv s3://mg-s3-pgp-dec-bucket/dectest.md .
diff -s dectest.md ../README.md