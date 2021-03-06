#/bin/bash
# data from http://mattmahoney.net/dc/textdata.html 
 
if [ ! -f "./local/enwik8" ]; then
(cd ../local; wget http://mattmahoney.net/dc/enwik8.zip && unzip enwik8.zip)
fi

if [ ! -f "./local/enwik9" ]; then
(cd ../local;wget http://mattmahoney.net/dc/enwik9.zip && unzip enwik9.zip)
fi

if [ ! -f "./local/enwik10" ]; then
(cd ../local;cat enwik9 enwik9 enwik9 enwik9 enwik9 enwik9 enwik9 enwik9 enwik9 enwik9 > enwik10)
fi

brew install gpg

# To create and export keys
# gpg --export-keys pgp@test.local | base64 > pgp-public.key.b64
# gpg --export-secret-keys pgp@test.local | base64 > pgp-private.key.b64

base64 -d ../pgp-private.key.b64 | gpg --import

gpg --batch --trust-model always -r pgp@test.local -o dectest.md.pgp -e enwik8
gpg --batch --trust-model always -r pgp@test.local -o dectest.md.pgp -e enwik9
gpg --batch --trust-model always -r pgp@test.local -o dectest.md.pgp -e enwik10


 