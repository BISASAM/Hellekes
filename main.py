from flask import Flask, render_template, jsonify, make_response, request
import json
app = Flask(__name__)


@app.route('/')
def root():
    return render_template("index.html")


@app.route('/cpi')
def cpi():
    return render_template("corr_idx.html")


@app.route('/get_cpi_scores')
def read_cpi_json():
    with open('data/cpi_scores.json') as f:
        data = json.load(f)
    return jsonify(data)


@app.route('/get_data')
def read_json():
    with open('data/json_template_improved.json') as f:
        data = json.load(f)
        entry_list = data["transfers"]
    return jsonify(entry_list)


@app.route('/change_cpi_score', methods=['GET'])
def change_cpi_score():
    cc = request.args.get("cc")
    score = request.args.get("score")

    data = {}
    with open('data/cpi_scores.json', "r") as f:
        data = json.load(f)

    data[cc]['cpi_score'] = score
    
    with open('data/cpi_scores.json', "w") as f:
        json.dump(data, f)

    return make_response('Ok', 200)



if __name__ == '__main__':
    app.run()
    