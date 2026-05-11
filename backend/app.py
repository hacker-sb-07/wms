from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os

# =========================================
# APP
# =========================================

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)

# =========================================
# FILES
# =========================================

USER_FILE = "users.json"
BOOK_FILE = "books.json"
SAVED_BOOK_FILE = "saved_books.json"

# =========================================
# CREATE JSON FILES
# =========================================

for file_name in [
    USER_FILE,
    BOOK_FILE,
    SAVED_BOOK_FILE
]:

    if not os.path.exists(file_name):

        with open(file_name, "w") as file:

            json.dump([], file)

# =========================================
# READ / WRITE USERS
# =========================================

def read_users():

    with open(USER_FILE, "r") as file:

        return json.load(file)

def write_users(users):

    with open(USER_FILE, "w") as file:

        json.dump(
            users,
            file,
            indent=4
        )

# =========================================
# READ / WRITE BOOKS
# =========================================

def read_books():

    with open(BOOK_FILE, "r") as file:

        return json.load(file)

def write_books(books):

    with open(BOOK_FILE, "w") as file:

        json.dump(
            books,
            file,
            indent=4
        )

# =========================================
# READ / WRITE SAVED BOOKS
# =========================================

def read_saved_books():

    with open(SAVED_BOOK_FILE, "r") as file:

        return json.load(file)

def write_saved_books(data):

    with open(SAVED_BOOK_FILE, "w") as file:

        json.dump(
            data,
            file,
            indent=4
        )

# =========================================
# SIGNUP
# =========================================

@app.route(
    "/signup",
    methods=["POST"]
)
def signup():

    try:

        data = request.get_json()

        users = read_users()

        for user in users:

            if (
                user["email"]
                ==
                data["email"]
            ):

                return jsonify({

                    "message":
                    "Email already exists"

                }), 400

        new_user = {

            "name":
            data["name"],

            "email":
            data["email"],

            "password":
            data["password"],

            "role":
            data["role"]
        }

        users.append(new_user)

        write_users(users)

        return jsonify({

            "message":
            "Signup Successful"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# LOGIN
# =========================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    try:

        data = request.get_json()

        users = read_users()

        for user in users:

            if (
                user["email"]
                ==
                data["email"]
                and
                user["password"]
                ==
                data["password"]
            ):

                return jsonify({

                    "message":
                    "Login Successful",

                    "name":
                    user["name"],

                    "email":
                    user["email"],

                    "role":
                    user["role"]
                })

        return jsonify({

            "message":
            "Invalid Email or Password"

        }), 401

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# GET USERS
# =========================================

@app.route(
    "/users",
    methods=["GET"]
)
def get_users():

    try:

        users = read_users()

        return jsonify(users)

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# UPDATE USER
# =========================================

@app.route(
    "/update-user/<email>",
    methods=["PUT"]
)
def update_user(email):

    try:

        data = request.get_json()

        users = read_users()

        for user in users:

            if user["email"] == email:

                user["name"] = data["name"]

                user["role"] = data["role"]

        write_users(users)

        return jsonify({

            "message":
            "User Updated Successfully"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# DELETE USER
# =========================================

@app.route(
    "/delete-user/<email>",
    methods=["DELETE"]
)
def delete_user(email):

    try:

        users = read_users()

        updated_users = []

        for user in users:

            if (
                user["email"]
                !=
                email
            ):

                updated_users.append(user)

        write_users(updated_users)

        return jsonify({

            "message":
            "User Deleted Successfully"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# UPLOAD BOOK
# =========================================

# =========================================
# UPLOAD BOOK
# =========================================

@app.route(
    "/upload-book",
    methods=["POST"]
)
def upload_book():

    try:

        data = request.get_json()

        books = read_books()

        cover_image = data.get("cover_image")

        upload_date = datetime.now()

        deadline = upload_date + timedelta(days=6)

        new_book = {
"id":
max(
    [book["id"] for book in books],
    default=0
) + 1,

            "book_name":
            data["book_name"],

            "publisher":
            data["publisher"],

            "publisher_email":
            data["publisher_email"],

            "chapters":
            data["chapters"],

            "cover_image": cover_image,

            "upload_date":
            upload_date.strftime("%Y-%m-%d"),

            "deadline":
            deadline.strftime("%Y-%m-%d"),

            "status":
            "Published",

            "delay":
            False,

            "downloads":
            0,

            "last_download_time":
            "",

            "file":
            data["file"]

        }

        books.append(new_book)

        write_books(books)

        return jsonify({

            "message":
            "Book Uploaded Successfully"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500
# =========================================
# GET BOOKS
# =========================================

@app.route(
    "/books",
    methods=["GET"]
)
def get_books():

    try:

        books = read_books()

        return jsonify(books)

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# GET PUBLISHED BOOKS
# =========================================

@app.route(
    "/published-books",
    methods=["GET"]
)
def published_books():

    try:

        books = read_books()

        published = []

        for book in books:

            if (
                book["status"]
                ==
                "Published"
            ):

                published.append(book)

        return jsonify(published)

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# PUBLISH BOOK
# =========================================

@app.route(
    "/publish-book/<int:id>",
    methods=["PUT"]
)
def publish_book(id):

    try:

        books = read_books()

        for book in books:

            if book["id"] == id:

                today = datetime.now()

                deadline = datetime.strptime(
                    book["deadline"],
                    "%Y-%m-%d"
                )

                if today > deadline:

                    book["delay"] = True

                book["status"] = "Published"

                write_books(books)

                return jsonify({

                    "message":
                    "Book Published Successfully"

                })

        return jsonify({

            "message":
            "Book Not Found"

        }), 404

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# DOWNLOAD BOOK
# =========================================

@app.route(
    "/download-book/<int:id>",
    methods=["GET"]
)
def download_book(id):

    try:

        books = read_books()

        for book in books:

            if (
                book["id"] == id
                and
                book["status"] == "Published"
            ):

                book["downloads"] += 1

                book["last_download_time"] = datetime.now().strftime(
                    "%d-%m-%Y %I:%M %p"
                )

                write_books(books)

                return jsonify({

                    "message":
                    "Download Started",

                    "file":
                    book["file"],

                    "downloads":
                    book["downloads"],

                    "last_download_time":
                    book["last_download_time"]
                })

        return jsonify({

            "message":
            "Book Not Published Yet"

        }), 400

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# UPDATE BOOK
# =========================================

@app.route(
    "/update-book/<int:id>",
    methods=["PUT"]
)
def update_book(id):

    try:

        data = request.get_json()

        books = read_books()

        for book in books:

            if book["id"] == id:

                book["book_name"] = data["book_name"]

                book["publisher"] = data["publisher"]

                book["publisher_email"] = data["publisher_email"]

                book["chapters"] = data["chapters"]

                book["file"] = data["file"]

                write_books(books)

                return jsonify({

                    "message":
                    "Book Updated Successfully"

                })

        return jsonify({

            "message":
            "Book Not Found"

        }), 404

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# DELETE BOOK
# =========================================

@app.route(
    "/delete-book/<int:id>",
    methods=["DELETE"]
)
def delete_book(id):

    try:

        books = read_books()

        updated_books = []

        for book in books:

            if (
                book["id"]
                !=
                id
            ):

                updated_books.append(book)

        write_books(updated_books)

        return jsonify({

            "message":
            "Book Deleted Successfully"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# SAVE BOOK
# =========================================

@app.route(
    "/save-book",
    methods=["POST"]
)
def save_book():

    try:

        data = request.get_json()

        saved_books = read_saved_books()

        exists = False

        for book in saved_books:

            if (
                book["book_name"]
                ==
                data["book_name"]
            ):

                exists = True

        if not exists:

            saved_books.append(data)

            write_saved_books(saved_books)

        return jsonify({

            "message":
            "Book Saved Successfully"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# GET SAVED BOOKS
# =========================================

@app.route(
    "/saved-books",
    methods=["GET"]
)
def get_saved_books():

    try:

        books = read_saved_books()

        return jsonify(books)

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# REMOVE SAVED BOOK
# =========================================

@app.route(
    "/remove-saved/<book_name>",
    methods=["DELETE"]
)
def remove_saved_book(book_name):

    try:

        books = read_saved_books()

        updated_books = []

        for book in books:

            if (
                book["book_name"]
                !=
                book_name
            ):

                updated_books.append(book)

        write_saved_books(updated_books)

        return jsonify({

            "message":
            "Saved Book Removed"

        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# DASHBOARD DATA
# =========================================

@app.route(
    "/dashboard-data",
    methods=["GET"]
)
def dashboard_data():

    try:

        users = read_users()

        books = read_books()

        total_downloads = 0

        published_books = 0

        delayed_books = 0

        for book in books:

            total_downloads += book.get(
                "downloads",
                0
            )

            if (
                book["status"]
                ==
                "Published"
            ):

                published_books += 1

            if (
                book["delay"]
                ==
                True
            ):

                delayed_books += 1

        return jsonify({

            "total_users":
            len(users),

            "total_books":
            len(books),

            "published_books":
            published_books,

            "delayed_books":
            delayed_books,

            "total_downloads":
            total_downloads
        })

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# SEARCH BOOK
# =========================================

@app.route(
    "/search-book/<name>",
    methods=["GET"]
)
def search_book(name):

    try:

        books = read_books()

        result = []

        for book in books:

            if (
                name.lower()
                in
                book["book_name"].lower()
            ):

                result.append(book)

        return jsonify(result)

    except Exception as e:

        return jsonify({

            "message":
            str(e)

        }), 500

# =========================================
# HOME
# =========================================

@app.route("/")
def home():

    return jsonify({

        "message":
        "Flask Server Running Successfully"

    })

# =========================================
# RUN SERVER
# =========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )