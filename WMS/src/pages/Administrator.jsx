// Administrator.jsx

import {
  Users,
  BookOpen,
  Download,
  BarChart3,
  LogOut,
  Trash2,
  Eye,
  Pencil,
  Calendar,
  Clock3,
  Mail,
} from "lucide-react";

import { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import logo from "../assets/images.png";

function Administrator() {
  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================

  const [users, setUsers] = useState([]);

  const [books, setBooks] = useState([]);

  const [pendingBooks, setPendingBooks] = useState([]);

  const [downloads, setDownloads] = useState(0);

  const [activePage, setActivePage] = useState("dashboard");

  const [selectedBook, setSelectedBook] = useState(null);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.clear();

    navigate("/");
  };

  // =========================================
  // FETCH USERS
  // =========================================

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/users");

      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // FETCH BOOKS
  // =========================================
  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/books");

      const updatedBooks = res.data.map((book) => ({
        ...book,

        downloads: book.downloads || 0,

        publisher: book.publisher || "Unknown User",

        publisher_email: book.publisher_email || "No Email",

        last_download_time: book.last_download_time || "No Downloads",
      }));

      setBooks(updatedBooks);

      // TOTAL DOWNLOAD COUNT

      let totalDownloads = 0;

      updatedBooks.forEach((book) => {
        totalDownloads += Number(book.downloads);
      });

      setDownloads(totalDownloads);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // DELETE USER
  // =========================================

  const deleteUser = async (email) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-user/${email}`);

      fetchUsers();

      setMessage("User Deleted Successfully");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // DELETE BOOK
  // =========================================

  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-book/${id}`);

      fetchBooks();

      setMessage("Book Deleted Successfully");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // VIEW BOOK
  // =========================================

  const viewBook = (book) => {
    setSelectedBook(book);
  };

  // =========================================
  // EDIT BOOK
  // =========================================
  // =========================================
  // EDIT BOOK
  // =========================================

  const editBook = (book) => {
    navigate(
      "/publisher",

      {
        state: {
          editBook: book,
        },
      },
    );
  };

  // =========================================
  // USE EFFECT
  // =========================================

  useEffect(() => {
    fetchUsers();

    fetchBooks();

    const drafts = JSON.parse(localStorage.getItem("pendingBooks")) || [];

    setPendingBooks(drafts);
  }, []);

  const deleteDraft = (id) => {
    const updatedDrafts = pendingBooks.filter((book) => book.id !== id);

    setPendingBooks(updatedDrafts);

    localStorage.setItem(
      "pendingBooks",

      JSON.stringify(updatedDrafts),
    );

    setMessage("Draft Deleted Successfully");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      {/* SIDEBAR */}
      <div className="w-[300px] bg-white shadow-xl p-6 fixed left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto">
        <div>
          <img src={logo} alt="Logo" className="w-32 mx-auto" />

          <h1 className="text-2xl font-bold text-[#0B4EA2] text-center mt-5 cursor-pointer">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 text-sm mt-4 text-center leading-6">
            Full access to manage users, publishers, readers, books, downloads
            and analytics.
          </p>

          {/* MENU */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => setActivePage("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer
              ${
                activePage === "dashboard"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActivePage("users")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer
              ${
                activePage === "users"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              User Management
            </button>

            <button
              onClick={() => setActivePage("books")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer
              ${
                activePage === "books"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Book Management
            </button>

            <button
              onClick={() => setActivePage("pending")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "pending"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Pending Books
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 mt-8 cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-[320px] w-full p-6">
        {/* MODERN MESSAGE UI */}
        {message && (
          <div className="fixed top-6 right-6 z-[9999] animate-bounce">
            <div
              className={`min-w-[320px] max-w-[400px]
      px-5 py-4 rounded-2xl shadow-2xl
      border backdrop-blur-lg flex items-start gap-4
      transition-all duration-500

      ${
        messageType === "success"
          ? "bg-green-500/15 border-green-400 text-green-700"
          : "bg-red-500/15 border-red-400 text-red-700"
      }`}
            >
              {/* ICON */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold

        ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}
              >
                {messageType === "success" ? "✓" : "!"}
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h2 className="font-bold text-lg">
                  {messageType === "success" ? "Success" : "Failed"}
                </h2>

                <p className="text-sm mt-1 leading-6">{message}</p>
              </div>

              {/* CLOSE */}
              <button
                onClick={() => setMessage("")}
                className="text-xl font-bold opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {activePage === "dashboard" && (
          <>
            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* USERS */}
              <div className="bg-white p-5 rounded-2xl shadow-md">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center">
                  <Users className="text-[#0B4EA2]" size={28} />
                </div>

                <h2 className="text-3xl font-bold text-[#0B4EA2] mt-4">
                  {users.length}
                </h2>

                <p className="text-gray-500 mt-2">Total Users</p>
              </div>

              {/* BOOKS */}
              <div className="bg-white p-5 rounded-2xl shadow-md">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-orange-400" size={28} />
                </div>

                <h2 className="text-3xl font-bold text-orange-400 mt-4">
                  {books.length}
                </h2>

                <p className="text-gray-500 mt-2">Uploaded Books</p>
              </div>

              {/* DOWNLOADS */}
              <div className="bg-white p-5 rounded-2xl shadow-md">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center">
                  <Download className="text-[#0B4EA2]" size={28} />
                </div>

                <h2 className="text-3xl font-bold text-[#0B4EA2] mt-4">
                  {downloads}
                </h2>

                <p className="text-gray-500 mt-2">Total Downloads</p>
              </div>

              {/* PERFORMANCE */}
              <div className="bg-white p-5 rounded-2xl shadow-md">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-orange-400" size={28} />
                </div>

                <h2 className="text-3xl font-bold text-orange-400 mt-4">
                  {books.length > 0
                    ? Math.round(
                        (books.filter((book) => book.status === "Published")
                          .length /
                          books.length) *
                          100,
                      )
                    : 0}
                  %
                </h2>

                <p className="text-gray-500 mt-2">System Performance</p>
              </div>
            </div>

            {/* RECENT BOOKS */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-[#0B4EA2] mb-6">
                Recent Uploaded Books
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="bg-[#eef3f9] p-5 rounded-2xl relative group hover:shadow-xl transition"
                  >
                    {/* ACTIONS */}
                    <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                      <button
                        onClick={() => viewBook(book)}
                        className="bg-[#0B4EA2] text-white p-2 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => editBook(book)}
                        className="bg-orange-400 text-white p-2 rounded-lg"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteBook(book.id)}
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h2 className="text-xl font-bold text-[#0B4EA2]">
                      {book.book_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-3">
                      Publisher:
                      <span className="font-semibold ml-2">
                        {book.publisher}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <Mail size={14} />

                      {book.publisher_email}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Chapters:
                      <span className="font-semibold ml-2">
                        {book.chapters?.length}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Downloads:
                      <span className="font-semibold ml-2 text-[#0B4EA2]">
                        {book.downloads || 0}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <Calendar size={15} />

                      {book.upload_date}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock3 size={15} />

                      {book.last_download_time || "No Downloads"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PENDING PAGE */}
        {activePage === "pending" && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-500 mb-6">
              Pending Draft Books
            </h2>

            {pendingBooks.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400">
                  No Pending Books
                </h2>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingBooks.map((book, index) => (
                  <div key={index} className="bg-[#eef3f9] p-5 rounded-2xl">
                    <h2 className="text-xl font-bold text-[#0B4EA2]">
                      {book.book_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-3">
                      Publisher:
                      <span className="ml-2 font-semibold">
                        {book.publisher}
                      </span>
                    </p>

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() =>
                          navigate("/publisher", {
                            state: {
                              draftBook: book,
                            },
                          })
                        }
                        className="bg-orange-400 text-white px-4 py-2 rounded-xl"
                      >
                        Continue Draft
                      </button>

                      <button
                        onClick={() => deleteDraft(book.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
{/* USERS */}
{activePage === "users" && (
  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">

    <h2 className="text-2xl font-bold text-[#0B4EA2] mb-6">
      User Management
    </h2>

    {/* DESKTOP TABLE */}
    <div className="hidden lg:block overflow-x-auto rounded-xl">

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b text-left">

            <th className="py-4">
              Name
            </th>

            <th>
              Email
            </th>

            <th>
              Role
            </th>

            <th>
              Status
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map((user, index) => (

            <tr
              key={index}
              className="border-b h-16"
            >

              <td className="font-semibold">
                {user.name}
              </td>

              <td>
                {user.email}
              </td>

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-white text-xs

                  ${
                    user.role ===
                    "Administrator"

                      ? "bg-gray-500"

                      : user.role ===
                        "Publisher"

                      ? "bg-gray-400"

                      : "bg-gray-500"
                  }`}
                >

                  {user.role}

                </span>

              </td>

              <td className="text-green-500 font-semibold">
                Active
              </td>

              <td>

                <button
                  onClick={() =>
                    deleteUser(user.email)
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >

                  Delete

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

    {/* MOBILE CARD UI */}
    <div className="lg:hidden space-y-4">

      {users.map((user, index) => (

        <div
          key={index}
          className="bg-[#f5f7fb] rounded-2xl p-4 shadow-sm border"
        >

          <div className="space-y-3">

            <div>

              <h2 className="text-lg font-bold text-[#0B4EA2]">
                {user.name}
              </h2>

              <p className="text-sm text-gray-600 break-all">
                {user.email}
              </p>

            </div>

            <div className="flex items-center justify-between">

              <span
                className={`px-3 py-1 rounded-full text-white text-xs

                ${
                  user.role ===
                  "Administrator"

                    ? "bg-[#0B4EA2]"

                    : user.role ===
                      "Publisher"

                    ? "bg-orange-400"

                    : "bg-green-500"
                }`}
              >

                {user.role}

              </span>

              <span className="text-green-500 text-sm font-semibold">
                Active
              </span>

            </div>

            <button
              onClick={() =>
                deleteUser(user.email)
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
            >

              Delete User

            </button>

          </div>

        </div>

      ))}

    </div>

  </div>
)}

        {/* BOOK MANAGEMENT */}
{/* BOOK MANAGEMENT */}
{activePage === "books" && (
  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">

    <h2 className="text-2xl font-bold text-[#0B4EA2] mb-6">
      Book Management
    </h2>

    {/* DESKTOP TABLE */}
    <div className="hidden lg:block overflow-x-auto rounded-xl">

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b text-left">

            <th className="py-4">
              Book
            </th>

            <th>
              Publisher
            </th>

            <th>
              Email
            </th>

            <th>
              Chapters
            </th>

            <th>
              Downloads
            </th>

            <th>
              Last Download
            </th>

            <th>
              Upload Date
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {books.map((book, index) => (

            <tr
              key={index}
              className="border-b h-16"
            >

              <td className="font-semibold text-[#0B4EA2]">
                {book.book_name}
              </td>

              <td>
                {book.publisher}
              </td>

              <td>
                {book.publisher_email}
              </td>

              <td>
                {book.chapters?.length}
              </td>

              <td className="font-semibold text-[#0B4EA2]">
                {book.downloads || 0}
              </td>

              <td>
                {book.last_download_time || "No Downloads"}
              </td>

              <td>
                {book.upload_date}
              </td>

              <td>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      viewBook(book)
                    }
                    className="bg-[#0B4EA2] text-white p-2 rounded-lg"
                  >

                    <Eye size={15} />

                  </button>

                  <button
                    onClick={() =>
                      editBook(book)
                    }
                    className="bg-orange-400 text-white p-2 rounded-lg"
                  >

                    <Pencil size={15} />

                  </button>

                  <button
                    onClick={() =>
                      deleteBook(book.id)
                    }
                    className="bg-red-500 text-white p-2 rounded-lg"
                  >

                    <Trash2 size={15} />

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

    {/* MOBILE CARD UI */}
    <div className="lg:hidden space-y-4">

      {books.map((book, index) => (

        <div
          key={index}
          className="bg-[#f5f7fb] rounded-2xl p-4 shadow-sm border"
        >

          <div className="space-y-3">

            <div>

              <h2 className="text-lg font-bold text-[#0B4EA2]">
                {book.book_name}
              </h2>

              <p className="text-sm text-gray-600">
                Publisher: {book.publisher}
              </p>

              <p className="text-sm text-gray-600 break-all">
                {book.publisher_email}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">

              <div className="bg-white rounded-xl p-3">

                <p className="text-gray-500">
                  Chapters
                </p>

                <h2 className="font-bold text-[#0B4EA2]">
                  {book.chapters?.length}
                </h2>

              </div>

              <div className="bg-white rounded-xl p-3">

                <p className="text-gray-500">
                  Downloads
                </p>

                <h2 className="font-bold text-[#0B4EA2]">
                  {book.downloads || 0}
                </h2>

              </div>

            </div>

            <div className="text-sm text-gray-600">

              <p>
                Upload Date:
              </p>

              <p className="font-semibold">
                {book.upload_date}
              </p>

            </div>

            <div className="text-sm text-gray-600">

              <p>
                Last Download:
              </p>

              <p className="font-semibold">
                {book.last_download_time || "No Downloads"}
              </p>

            </div>
<div className="grid grid-cols-1 gap-3 pt-3">

  <button
    onClick={() =>
      viewBook(book)
    }
    className="w-full bg-[#0B4EA2] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
  >

    <Eye size={18} />

    View Book

  </button>

  <button
    onClick={() =>
      editBook(book)
    }
    className="w-full bg-orange-400 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
  >

    <Pencil size={18} />

    Edit Book

  </button>

  <button
    onClick={() =>
      deleteBook(book.id)
    }
    className="w-full bg-red-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
  >

    <Trash2 size={18} />

    Delete Book

  </button>

</div>

          </div>

        </div>

      ))}

    </div>

  </div>
)}
      </div>

      {/* BOOK VIEW MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5">
          <div className="bg-white w-full max-w-5xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-[#0B4EA2]">
                {selectedBook.book_name}
              </h2>

              <button
                onClick={() => setSelectedBook(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {selectedBook.chapters?.map((chapter, index) => (
                <div key={index} className="border rounded-2xl p-5">
                  <h2 className="text-xl font-bold text-[#0B4EA2]">
                    Chapter {chapter.chapter_number}
                  </h2>

                  <h3 className="font-semibold mt-3">
                    {chapter.chapter_title}
                  </h3>

                  <p className="text-gray-500 mt-2">{chapter.sub_topic}</p>

                  <div
                    className="mt-4 leading-7"
                    dangerouslySetInnerHTML={{
                      __html: chapter.content,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Administrator;
