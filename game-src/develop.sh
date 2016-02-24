#!/usr/bin/env bash
set -e

TOTALSTARTTIME=$(date +%s)
RED='\033[0;31m'
Green='\033[0;32m'
NC='\033[0m' # No Color


printf "${Green}重新编译输出develop版资源...\n"
rm -rf output
mkdir output
fis3 server stop -p 8384
fis3 server start --root output -p 8384 --type node
fis3 release -wLcd output