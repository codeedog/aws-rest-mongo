#! /bin/bash

URI=http://localhost:3000/hello

echo $'\e[1;33m'Testing REST APIs $URI$'\e[0m'

tmpf="/tmp/output.diff.$$"

bash ./scripts/testREST.sh | diff ./scripts/output.txt - > $tmpf

if (( `wc -c $tmpf | awk '{print $1}'` > 0))
then
    awk 'function color(s,c) { $1=p; printf c s "\033[0m " "\n" }; ($1 == ">") ? color($0,"\033[1;31m") : color($0,"\033[1;32m")' $tmpf
    echo $'\e[1;31m'Test: FAILED$'\e[0m'
else
    echo $'\e[1;32m'Test: PASSED$'\e[0m'
fi

rm -f $tmpf
