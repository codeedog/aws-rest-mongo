#! /bin/bash

URI=http://localhost:3000/hello

./scripts/resetDB.sh >> /dev/null
echo "Test GET all albums"
curl -s "$URI"
echo ""

echo "Test GET one album"
curl -s "$URI"/607f0191b849a1b374ab9598
echo ""

echo "Test GET failed"
curl -s "$URI"/607f0191b849a1b374ab9595
echo ""

echo "Test PUT one album"
curl -s -X PUT -d "title=Pooh Bear" "$URI"/607f0191b849a1b374ab9598
echo ""

echo "Test PUT failed one album"
curl -s -X PUT -d "title=Pooh Bear" "$URI"/607f0191b849a1b374ab9595
echo ""

echo "Test PATCH one album"
curl -s -X PATCH -d "title=Aoxomoxoa" "$URI"/607f0191b849a1b374ab9598
echo ""

echo "Test PATCH failed one album"
curl -s -X PATCH -d "title=Pooh Bear" "$URI"/607f0191b849a1b374ab9595
echo ""

echo "Test DELETE one album"
curl -s -X DELETE "$URI"/607f0191b849a1b374ab9598
echo ""

echo "Test DELETE failed"
curl -s -X DELETE "$URI"/607f0191b849a1b374ab9598
echo ""

# echo "Test POST one album"
# curl -s -X POST -d "title=Skeletons from the Closet" -d "band=Grateful Dead" "$URI"
# echo ""
# How to mask ID?
