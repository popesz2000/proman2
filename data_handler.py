import persistence
import connection
from psycopg2.extras import RealDictCursor
import csv


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_statuses():
    return persistence.get_statuses()


def get_boards():
    """
    Gather all boards
    :return:
    """
    return persistence.get_boards(force=True)


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards


@connection.connection_handler
def add_new_user(cursor: RealDictCursor, user) -> list:
    query = """
        INSERT INTO users (username, password)
        VALUES (%(username)s, %(password)s)"""
    cursor.execute(query, user)


@connection.connection_handler
def get_usernames(cursor: RealDictCursor) -> list:
    query = "SELECT username FROM users"
    cursor.execute(query)
    return cursor.fetchall()


@connection.connection_handler
def get_password(cursor: RealDictCursor, username) -> list:
    query = """
        SELECT password FROM users
        WHERE username = %(name)s"""
    cursor.execute(query, {'name': username})
    return cursor.fetchone()


def save_dict_to_boards_csv(dictionary):
    if len(dictionary) > 0:
        keys = dictionary[0].keys()
        with open(persistence.BOARDS_FILE, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, keys)
            dict_writer.writeheader()
            dict_writer.writerows(dictionary)
    else:
        f = open(persistence.BOARDS_FILE, "w+")
        f.close()


def get_cards():
    persistence.clear_cache()
    return persistence.get_cards()


def save_dict_to_cards_csv(dictionary):
    if len(dictionary) > 0:
        persistence.clear_cache()
        keys = dictionary[0].keys()
        with open(persistence.CARDS_FILE, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, keys)
            dict_writer.writeheader()
            dict_writer.writerows(dictionary)
    else:
        f = open(persistence.CARDS_FILE, "w+")
        f.close()


def save_dict_to_statuses_csv(dictionary):
    keys = dictionary[0].keys()
    with open(persistence.STATUSES_FILE, 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(dictionary)


def del_cards_by_board_id(board_id):
    cards = get_cards()
    for i in range(len(cards)):
        if cards[i]["board_id"] == board_id:
            del cards[i]
            save_dict_to_cards_csv(cards)
            del_cards_by_board_id(board_id)


def del_cards_by_col_id(col_id):
    cards = get_cards()
    for i in range(len(cards)):
        if cards[i]["status_id"] == col_id:
            del cards[i]
            save_dict_to_cards_csv(cards)
            del_cards_by_col_id(col_id)
