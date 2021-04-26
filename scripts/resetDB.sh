#! /bin/bash

# This is expected to be run from ../

# Grab up environment vars
set -a
[ -f .env ] && . .env
set +a

echo -e "use recon\ndb.dropDatabase()\ndb.library.insertMany([\n    { 'title' : 'The Return of The King', 'author' : 'J.R.R. Tolkien', 'volume' : '3' },\n    { 'title' : 'The Fellowship of The Ring', 'author' : 'J.R.R. Tolkien', 'volume' : '2' },\n    { 'title' : 'The Two Towers', 'author' : 'J.R.R. Tolkien', 'volume' : '2.5' },\n    { 'title' : 'The Hobbit', 'author' : 'J.R.R. Tolkien', 'volume' : '0' },\n])\ndb.music.insertMany([\n{ '_id':ObjectId('607f0191b849a1b374ab9597'),'title' : 'Workingman\'s Dead', 'band' : 'The Grateful Dead' },\n{ '_id':ObjectId('607f0191b849a1b374ab9598'), 'title' : 'Aoxomoxoa', 'band' : 'The Grateful Dead' },\n    { '_id':ObjectId('607f020fa563892026926b46'), 'title' : 'Wake of the Flood', 'band' : 'The Grateful Dead' }\n])\n" | mongo "$MONGODB_RW_URI"
