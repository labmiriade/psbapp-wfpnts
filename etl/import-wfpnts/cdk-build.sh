
set -eux

cp -r import_wfpnts/* /asset-output
pip install -r requirements.txt --target /asset-output
