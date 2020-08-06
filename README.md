# Hellekes

#### Virtual Environment einrichten:

Im Projektordner cmd öffnen oder die VSCode shell benutzen:
 - Um die virtual environment zu erstellen: ```python -m venv venv``` (es entsteht ein Ordner "venv")
 - Venv aktivieren: 
    - cmd: (Windows) ```venv\scripts\activate.bat```
    - Studio code: Neustarten, einmal auf play drücken (für main.py), dann sollte in der Konsole ```(venv)``` davorstehen
 - requirements installieren: 
    - in der Konsole mit (venv) davor: ```pip install -r requirements.txt```
    
#### Virtual Environment benutzen:

- VSCode: Projektordner mit VSCode öffnen, venv wird automatisch erkannt und aktiviert.
  (falls nicht, die main.py in der IDE öffnen, dann links unten den python interpreter aus der venv auswählen)
- Per Shell:
   - cmd: (Windows) ```venv\scripts\activate.bat```
