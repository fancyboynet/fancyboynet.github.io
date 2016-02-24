#!/usr/bin/env bash
set -e

TOTALSTARTTIME=$(date +%s)
RED='\033[0;31m'
Green='\033[0;32m'
NC='\033[0m' # No Color


printf "${Green}重新编译输出product版资源...\n"
STARTTIME=$(date +%s)
rm -rf output/static
rm -rf output/templates
fis3 release prod -cd output
ENDTIME=$(date +%s)
printf "${Green}done${RED}($(($ENDTIME - $STARTTIME))s)\n"


printf "${Green}将编译好的资源复制到对应资源目录下...\n"
STARTTIME=$(date +%s)
cp -af output/static ../../game
cp -af output/templates ../../game
ENDTIME=$(date +%s)
printf "${Green}done${RED}($(($ENDTIME - $STARTTIME))s)\n"


TOTALENDTIME=$(date +%s)
printf "${Green}总耗时${RED}($(($TOTALENDTIME - $TOTALSTARTTIME))s)\n"

