from flask import Flask, render_template, jsonify
import json
app = Flask(__name__)


@app.route('/')
def root():
    return render_template("index.html")


@app.route('/get_data')
def read_json():

    with open('data/json_template_improved.json') as f:
        data = json.load(f)
        entry_list = data["transfers"]
    return jsonify(entry_list)



if __name__ == '__main__':
    app.run()
    