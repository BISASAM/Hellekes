from flask import Flask, render_template, jsonify, make_response, request
import json
app = Flask(__name__)


@app.route('/')
def root():
    return render_template("index.html")


@app.route('/cpi')
def cpi():
    return render_template("corr_idx.html")


@app.route('/sig')
def sig():
    return render_template("sig_wrds.html")


@app.route('/get_cpi_scores')
def read_cpi_json():
    with open('data/cpi_scores.json') as f:
        data = json.load(f)
    return jsonify(data)


@app.route('/get_signal_words')
def read_sig_json():
    with open('data/signal_words.json', encoding='utf8') as f:
        data = json.load(f)
        data = [word.lower() for word in data]
    return jsonify(data)


@app.route('/new_sig_word', methods=['GET'])
def new_sig_word():
    new_word = request.args.get("n")

    word_list = get_signal_words()
    word_list.add(new_word)

    write_signal_words(word_list)

    return make_response('Ok', 200)


@app.route('/change_sig_word', methods=['GET'])
def change_sig_word():
    old_word = request.args.get("o")
    new_word = request.args.get("n")

    word_list = get_signal_words()
    word_list.remove(old_word)
    word_list.add(new_word)

    write_signal_words(word_list)

    return make_response('Ok', 200)


@app.route('/del_sig_word', methods=['GET'])
def del_sig_word():
    word = request.args.get("w")

    word_list = get_signal_words()
    word_list.remove(word)

    write_signal_words(word_list)

    return make_response('Ok', 200)


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


def get_signal_words():
    """returns a Set"""
    data = []
    with open('data/signal_words.json', "r", encoding='utf8') as f:
        data = json.load(f)
    
    data = [word.lower() for word in data]
    data = set(data)

    return data


def write_signal_words(data):
    """input should be a Set"""
    data = list(data)
    with open('data/signal_words.json', "w", encoding='utf8') as f:
        json.dump(data, f)


   
if __name__ == '__main__':
    app.run()
