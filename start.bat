@echo off
python -m venv venv
venv\Scripts\pip.exe install -r requirements.txt
venv\Scripts\python.exe waitress_server.py