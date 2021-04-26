#! /bin/bash

# Grab up environment vars
set -a
[ -f .env ] && . .env
set +a

# Select local or remote web server
case $1 in
  hosted)
    URI=$HOSTED_URI
    ;;

  *)
    URI=$LOCAL_URI
    ;;
esac


./scripts/resetDB.sh >> /dev/null
echo "Test GET all albums"
curl -s "$URI"/hello
echo ""

echo "Test GET one album"
curl -s "$URI"/hello/607f0191b849a1b374ab9598
echo ""

echo "Test GET failed"
curl -s "$URI"/hello/607f0191b849a1b374ab9595
echo ""

echo "Test PUT one album"
curl -s -X PUT -d "title=Pooh Bear" "$URI"/hello/607f0191b849a1b374ab9598
echo ""

echo "Test PUT failed one album"
curl -s -X PUT -d "title=Pooh Bear" "$URI"/hello/607f0191b849a1b374ab9595
echo ""

echo "Test PATCH one album"
curl -s -X PATCH -d "title=Aoxomoxoa" "$URI"/hello/607f0191b849a1b374ab9598
echo ""

echo "Test PATCH failed one album"
curl -s -X PATCH -d "title=Pooh Bear" "$URI"/hello/607f0191b849a1b374ab9595
echo ""

echo "Test DELETE one album"
curl -s -X DELETE "$URI"/hello/607f0191b849a1b374ab9598
echo ""

echo "Test DELETE failed"
curl -s -X DELETE "$URI"/hello/607f0191b849a1b374ab9598
echo ""

# echo "Test POST one album"
# curl -s -X POST -d "title=Skeletons from the Closet" -d "band=Grateful Dead" "$URI"/hello
# echo ""
# How to mask ID?
