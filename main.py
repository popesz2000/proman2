from flask import Flask, render_template, url_for, request, redirect, session, flash, make_response, jsonify
import data_handler
import util
import os


app = Flask(__name__)
app.secret_key = os.urandom(16)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@util.json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-cards/<int:board_id>")
@util.json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route("/get-status/<int:status_id>")
@util.json_response
def get_status_for_card(status_id: int):
    return data_handler.get_card_status(status_id)


@app.route("/get-statuses")
@util.json_response
def get_statuses():
    return data_handler.get_statuses()


@app.route('/registration', methods=['GET', 'POST'])
def registration():
    if request.method == 'POST':
        users = data_handler.get_usernames()
        for user in users:
            if user['username'] == request.form['username']:
                error = 'Username already exists, please choose another one!'
                return render_template('registration.html', error=error)
        if request.form['username'] and request.form['password']:
            password = util.hash_password(request.form['password'])
            user = {'username': request.form['username'], 'password': password}
            data_handler.add_new_user(user)
            flash('Successful registration. Log in to continue.')
            return redirect('/login')
        else:
            error = 'Please, fill in both fields.'
            return render_template('registration.html', error=error)
    return render_template('registration.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if util.verify_password(password, data_handler.get_password(username)['password']):
            session['username'] = username
            flash('You were just logged in')
            return redirect('/')
        else:
            error = 'Wrong username or password.'
            return render_template('login.html', error=error)
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You were just logged out')
    return redirect(url_for('index'))


@app.route("/rename-save", methods=["POST"])
def rename_save():
    boards = data_handler.get_boards()
    data = request.get_json()
    board_titles = data["titles"].split(",")
    for i in range(len(boards)):
        boards[i]["title"] = board_titles[i]
    data_handler.save_dict_to_boards_csv(boards)


@app.route("/rename-column-save", methods=["POST"])
def rename_column_save():
    columns = data_handler.get_statuses()
    data = request.get_json()
    column_titles = data["titles"].split(",")
    for i in range(len(columns)):
        columns[i]["title"] = column_titles[i]
    data_handler.save_dict_to_statuses_csv(columns)


@app.route("/add_new_board", methods=['POST'])
def add_new_board():
    boards = data_handler.get_boards()
    max_id = 0
    for board in boards:
        if int(board['id']) > max_id:
            max_id = int(board['id'])
    data = request.get_json()
    new_board = {'id': max_id + 1, 'title': data['boardName']}
    boards.append(new_board)
    data_handler.save_dict_to_boards_csv(boards)
    return make_response(jsonify({"message": "JSON received"}), 200)


@app.route('/add_new_card', methods=['POST'])
def add_new_card():
    cards = data_handler.get_cards()
    max_id = 0
    for card in cards:
        if int(card['id']) > max_id:
            max_id = int(card['id'])
    data = request.get_json()
    new_card = {'id': max_id + 1, 'board_id': data['boardId'], 'title': data['cardName'], 'status_id': 0,
                'order': data['position']}
    cards.append(new_card)
    data_handler.save_dict_to_cards_csv(cards)
    return make_response((jsonify({'message': "JSON received"})), 200)


@app.route('/save_card_position', methods=['POST'])
def save_card_position():
    cards = data_handler.get_cards()
    statuses = data_handler.get_statuses()
    data = request.get_json()
    for status in statuses:
        if status['title'] == data['status']:
            status_id = status['id']
    for card in cards:
        if card['id'] == data['cardId']:
            card['board_id'] = data['boardId']
            card['status_id'] = status_id
            card['order'] = data['position']
    data_handler.save_dict_to_cards_csv(cards)
    return make_response(jsonify({"message": "JSON received"}), 200)


@app.route("/add-column", methods=['POST'])
def add_column():
    data = request.get_json()
    data = data["column_titles"].split(",")
    statuses = data_handler.get_statuses()
    for i in range(len(statuses)):
        statuses[i]["title"] = data[i]
    statuses.append({"id": len(statuses), "title": "new status"})
    data_handler.save_dict_to_statuses_csv(statuses)

@app.route("/rename-card-save", methods=["POST"])
def rename_card_save():
    cards = data_handler.get_cards()
    data = request.get_json()
    card_title = data["titles"].split(",")
    for i in range(len(cards)):
        cards[i]["title"] = card_title[i]
    data_handler.save_dict_to_cards_csv(cards)


@app.route('/del-card', methods=['POST'])
@util.json_response
def del_card():
    cards = data_handler.get_cards()
    data = request.get_json()
    for i in range(len(cards)):
        if cards[i]["id"] == data["id"]:
            del cards[i]
            data_handler.save_dict_to_cards_csv(cards)
            return make_response(jsonify({"message": "JSON received"}), 200)


@app.route('/del-board', methods=['POST'])
@util.json_response
def del_board():
    boards = data_handler.get_boards()
    data = request.get_json()
    for i in range(len(boards)):
        if boards[i]["id"] == data["id"]:
            del boards[i]
            data_handler.save_dict_to_boards_csv(boards)
            data_handler.del_cards_by_board_id(data["board_id"])
            return make_response(jsonify({"message": "JSON received"}), 200)


@app.route('/del-col', methods=['POST'])
@util.json_response
def del_col():
    statuses = data_handler.get_statuses()
    data = request.get_json()
    for i in range(len(statuses)):
        if statuses[i]["id"] == data["id"]:
            del statuses[i]
            data_handler.save_dict_to_statuses_csv(statuses)
            data_handler.del_cards_by_col_id(data["col_id"])
            return make_response(jsonify({"message": "JSON received"}), 200)


def main():
    app.run(debug=True, host='0.0.0.0')

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
