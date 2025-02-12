#!/usr/bin/env bash

echo "Executing: se2414 logout"
se2414 logout
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 login --username admin@yme.gov.gr --passw yme123!"
se2414 login --username admin@yme.gov.gr --passw yme123!
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 healthcheck"
se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 resetpasses"
se2414 resetpasses
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 healthcheck"
se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 resetstations"
se2414 resetstations
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 healthcheck"
se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 admin --addpasses --source ../../back-end/uploads/passes14.csv"
se2414 admin --addpasses --source ../../back-end/uploads/passes14.csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 healthcheck"
se2414 healthcheck
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station AM08 --from 20220424 --to 20220508 --format json"
se2414 tollstationpasses --station AM08 --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station NAO04 --from 20220424 --to 20220508 --format csv"
se2414 tollstationpasses --station NAO04 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station NO01 --from 20220424 --to 20220508 --format csv"
se2414 tollstationpasses --station NO01 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format csv"
se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station XXX --from 20220424 --to 20220508 --format csv"
se2414 tollstationpasses --station XXX --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format YYY"
se2414 tollstationpasses --station OO03 --from 20220424 --to 20220508 --format YYY
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 errorparam --station OO03 --from 20220424 --to 20220508 --format csv"
se2414 errorparam --station OO03 --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station AM08 --from 20220425 --to 20220506 --format json"
se2414 tollstationpasses --station AM08 --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station NAO04 --from 20220425 --to 20220506 --format csv"
se2414 tollstationpasses --station NAO04 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station NO01 --from 20220425 --to 20220506 --format csv"
se2414 tollstationpasses --station NO01 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format csv"
se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station XXX --from 20220425 --to 20220506 --format csv"
se2414 tollstationpasses --station XXX --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format YYY"
se2414 tollstationpasses --station OO03 --from 20220425 --to 20220506 --format YYY
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json"
se2414 passanalysis --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv"
se2414 passanalysis --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv"
se2414 passanalysis --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv"
se2414 passanalysis --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv"
se2414 passanalysis --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json"
se2414 passanalysis --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv"
se2414 passanalysis --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv"
se2414 passanalysis --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv"
se2414 passanalysis --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passanalysis --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv"
se2414 passanalysis --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json"
se2414 passescost --stationop AM --tagop NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv"
se2414 passescost --stationop NAO --tagop AM --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv"
se2414 passescost --stationop NO --tagop OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv"
se2414 passescost --stationop OO --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv"
se2414 passescost --stationop XXX --tagop KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json"
se2414 passescost --stationop AM --tagop NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv"
se2414 passescost --stationop NAO --tagop AM --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv"
se2414 passescost --stationop NO --tagop OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv"
se2414 passescost --stationop OO --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 passescost --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv"
se2414 passescost --stationop XXX --tagop KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid NAO --from 20220424 --to 20220508 --format json"
se2414 chargesby --opid NAO --from 20220424 --to 20220508 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid GE --from 20220424 --to 20220508 --format csv"
se2414 chargesby --opid GE --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid OO --from 20220424 --to 20220508 --format csv"
se2414 chargesby --opid OO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid KO --from 20220424 --to 20220508 --format csv"
se2414 chargesby --opid KO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid NO --from 20220424 --to 20220508 --format csv"
se2414 chargesby --opid NO --from 20220424 --to 20220508 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid NAO --from 20220425 --to 20220506 --format json"
se2414 chargesby --opid NAO --from 20220425 --to 20220506 --format json
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid GE --from 20220425 --to 20220506 --format csv"
se2414 chargesby --opid GE --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid OO --from 20220425 --to 20220506 --format csv"
se2414 chargesby --opid OO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid KO --from 20220425 --to 20220506 --format csv"
se2414 chargesby --opid KO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo

echo "Executing: se2414 chargesby --opid NO --from 20220425 --to 20220506 --format csv"
se2414 chargesby --opid NO --from 20220425 --to 20220506 --format csv
read -n 1 -s -r -p "Press any key to resume..."
echo
