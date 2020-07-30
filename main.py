import json
from flask import Flask, render_template_string
app = Flask(__name__)

@app.route('/')
def hello_world():
    with open('data\json_template.json') as json_file:
        data = json.load(json_file)
    for key in data:
        print(key)
        entry_list = data[key]
    return render_template_string('''

    {% for entry in entry_list %}
        <table>
                <tr>
                    <td> Feld Name </td> 
                    <td> Wert </td>
                </tr>


        {% for name, value in entry.items() %}

                <tr>
                    <td>{{ name }}</td> 
                    <td>{{ value }}</td>
                </tr>

        {% endfor %}
        </table>
        <p>
    {% endfor %}
''', entry_list=entry_list)


if __name__ == '__main__':
    app.run()
    