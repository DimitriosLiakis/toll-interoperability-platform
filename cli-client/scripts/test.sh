#!/usr/bin/env bash

se2414 logout
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 whoami
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 login --username admin --passw freepasses4all
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 whoami
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 resetpasses
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 resetstations
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 admin --addpasses --source back-end/uploads/passages14.csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station AM08 --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station NAO04 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station NO01 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station XXX --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format YYY
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 errorparam --station OO03 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station AM08 --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station NAO04 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station NO01 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station XXX --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format YYY
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passanalysis --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 passescost --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid GE --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid NO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid GE --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

se2414 chargesby --opid NO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo
