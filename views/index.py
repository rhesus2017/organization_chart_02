import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import render_template, Blueprint, jsonify, request
import pymysql
import logging
from logging.handlers import TimedRotatingFileHandler

blueprint = Blueprint('index', __name__)

logger = logging.getLogger()
logger.setLevel('INFO')
formatter = logging.Formatter('%(asctime)s %(process)d %(levelname)1.1s %(lineno)3s:%(funcName)-16.16s %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)

current_dir = os.path.dirname(os.path.abspath(__file__))
current_filename = os.path.splitext(os.path.basename(__file__))[0]
filename = current_dir + os.sep + "log" + os.sep + current_filename + ".log"
handler = TimedRotatingFileHandler(filename=filename, when='midnight', backupCount=7, encoding='utf8')
handler.suffix = '%Y%m%d'
handler.setFormatter(formatter)
logger.addHandler(handler)


@blueprint.route('/')
def index():
    db = None
    try:
        db = pymysql.connect(host='127.0.0.1', user='root', passwd='root123', db='organization_chart', charset='utf8', port=3306)

        cursor = db.cursor(pymysql.cursors.DictCursor)
        cursor.execute('SELECT * FROM node_list')
        node_list = cursor.fetchall()

    except Exception as e:
        raise e

    finally:
        if db is not None:
            db.close()

    return render_template('index.jinja2', data=node_list)


@blueprint.route('/add', methods=['POST'])
def add():
    db = None
    try:
        nodes = request.get_json()

        db = pymysql.connect(host='127.0.0.1', user='root', passwd='root123', db='organization_chart', charset='utf8', port=3306)

        with db.cursor() as cursor:
            cursor.execute(
                "insert into node_list (id, name, parent) values (%s, %s, %s)", (nodes['id'], nodes['name'], nodes['parent']))
            db.commit()

    except Exception as e:
        raise e

    finally:
        if db is not None:
            db.close()

    return jsonify(result="success")


@blueprint.route('/delete', methods=['POST'])
def delete():
    db = None
    try:
        node_id = request.get_json()

        db = pymysql.connect(host='127.0.0.1', user='root', passwd='root123', db='organization_chart', charset='utf8',
                             port=3306)

        with db.cursor() as cursor:
            cursor.execute("DELETE FROM node_list WHERE id=%s",(node_id))
            db.commit()

    except Exception as e:
        raise e

    finally:
        if db is not None:
            db.close()

    return jsonify(result="success")


@blueprint.route('/edit', methods=['POST'])
def edit():
    db = None
    try:
        nodes = request.get_json()

        db = pymysql.connect(host='127.0.0.1', user='root', passwd='root123', db='organization_chart', charset='utf8',
                             port=3306)

        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE node_list SET name=%s  WHERE id=%s",(nodes['name'], nodes['id'])
            )
            db.commit()

    except Exception as e:
        raise e

    finally:
        if db is not None:
            db.close()

    return jsonify(result="success")


@blueprint.route('/icon', methods=['POST'])
def icon():
    db = None
    try:
        nodes = request.get_json()

        db = pymysql.connect(host='127.0.0.1', user='root', passwd='root123', db='organization_chart', charset='utf8',
                             port=3306)

        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE node_list SET icon=%s  WHERE id=%s",(nodes['icon'], nodes['id'])
            )
            db.commit()

    except Exception as e:
        raise e

    finally:
        if db is not None:
            db.close()

    return jsonify(result="success")
