// Reader.jsx

import { BookOpen, Bookmark, Download, LogOut, Eye, Pause } from "lucide-react";

import { useEffect, useState } from "react";

import axios from "axios";

import html2canvas from "html2canvas";

import { Search } from "lucide-react";

import jsPDF from "jspdf";

import logo from "../assets/images.png";

import { useNavigate } from "react-router-dom";

function Reader() {
  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================

  const [activePage, setActivePage] = useState("library");

  const [books, setBooks] = useState([]);

  const [savedBooks, setSavedBooks] = useState([]);

  const [pausedBooks, setPausedBooks] = useState([]);

  const [readingHistory, setReadingHistory] = useState([]);

  const [downloads, setDownloads] = useState([]);

  const [selectedBook, setSelectedBook] = useState(null);

  const [selectedBookDetails, setSelectedBookDetails] = useState(null);
  const [isReading, setIsReading] = useState(false);

  const [readingStartTime, setReadingStartTime] = useState(null);

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.clear();

    navigate("/");
  };

  // =========================================
  // FETCH BOOKS
  // =========================================

  const fetchBooks = async () => {
    try {
      const res = await axios.get("https://wms-wrnh.onrender.com/published-books");

      setBooks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // FETCH SAVED BOOKS
  // =========================================

  const fetchSavedBooks = async () => {
    try {
      const res = await axios.get("https://wms-wrnh.onrender.com/saved-books");

      setSavedBooks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // SAVE BOOK
  // =========================================
  const saveBook = async (book) => {
    try {
      const alreadySaved = savedBooks.find(
        (item) => item.book_name === book.book_name,
      );

      if (alreadySaved) {
        setMessage("Book Already Saved");

        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 3000);

        return;
        return;
      }

      await axios.post("https://wms-wrnh.onrender.com/save-book", book);

      fetchSavedBooks();
      setMessage("Book Saved Successfully");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // REMOVE SAVED BOOK
  // =========================================

  const removeSavedBook = async (bookName) => {
    try {
      await axios.delete(`https://wms-wrnh.onrender.com/remove-saved/${bookName}`);

      fetchSavedBooks();
      setMessage("Saved Book Removed");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // READ BOOK
  // =========================================

  const readBook = (book) => {
    const startTime = new Date().toLocaleString();

    setSelectedBook({
      ...book,

      reading_start_time: startTime,
    });
  };

  // =========================================
  // PAUSE READING
  // =========================================

  const pauseReading = () => {
    const pausedTime = new Date().toLocaleString();

    const updatedBook = {
      ...selectedBook,

      paused_time: pausedTime,
    };

    const oldPaused = JSON.parse(localStorage.getItem("pausedBooks")) || [];

    const updatedPaused = [
      ...oldPaused.filter((book) => book.book_name !== selectedBook.book_name),

      updatedBook,
    ];

    localStorage.setItem(
      "pausedBooks",

      JSON.stringify(updatedPaused),
    );

    setPausedBooks(updatedPaused);

    setMessage("Book Reading pending");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 3000);

    setSelectedBook(null);
  };

  // =========================================
  // CONTINUE SESSION
  // =========================================

  const continueSession = (book) => {
    setSelectedBookDetails(book);
  };

  // =========================================
  // COMPLETE READING
  // =========================================

  const completeReading = () => {
    if (!selectedBook && !selectedBookDetails) return;
    const completedTime = new Date().toLocaleString();

    const history = JSON.parse(localStorage.getItem("readingHistory")) || [];

    // START TIME
    const currentBook = selectedBook || selectedBookDetails;

    const start = new Date(currentBook.reading_start_time || new Date());
    // END TIME
    const end = new Date(completedTime);

    // TOTAL SECONDS
    const totalSeconds = Math.floor((end - start) / 1000);

    // HOURS
    const hours = Math.floor(totalSeconds / 3600);

    // MINUTES
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // SECONDS
    const seconds = totalSeconds % 60;

    // FINAL TIME
    const totalReadingTime = `${hours}h ${minutes}m ${seconds}s`;

    // SAVE HISTORY
    history.push({
      book_name: currentBook.book_name,

      publisher: currentBook.publisher,

      start_time: currentBook.reading_start_time,

      paused_time: currentBook.paused_time || "No Pause",

      completed_time: completedTime,

      total_reading_time: totalReadingTime,
    });

    // SAVE LOCAL STORAGE
    localStorage.setItem(
      "readingHistory",

      JSON.stringify(history),
    );

    setReadingHistory(history);

    // REMOVE FROM PAUSED
    const updatedPaused = pausedBooks.filter(
      (book) => book.book_name !== currentBook.book_name,
    );

    localStorage.setItem(
      "pausedBooks",

      JSON.stringify(updatedPaused),
    );

    setPausedBooks(updatedPaused);
    setMessage("Book Completed Successfully");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 3000);

    // CLOSE READER
    setSelectedBook(null);
  };
  // =========================================
  // DOWNLOAD PDF
  // =========================================
  const downloadBook = async (book) => {
    try {
      // API CALL
      await axios.get(`https://wms-wrnh.onrender.com/download-book/${book.id}`);

      // UPDATE DOWNLOADS
      const updatedDownloads = [...downloads, book];

      localStorage.setItem(
        "downloads",

        JSON.stringify(updatedDownloads),
      );

      setDownloads(updatedDownloads);

      // CREATE PDF
      const pdf = new jsPDF("p", "mm", "a4");

      let y = 20;

      // BOOK TITLE
      pdf.setFontSize(22);

      pdf.text(book.book_name, 20, y);

      y += 20;

      // CHAPTERS
      for (let i = 0; i < book.chapters.length; i++) {
        const chapter = book.chapters[i];

        // CHAPTER TITLE
        pdf.setFontSize(18);

        pdf.text(
          `Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`,

          20,

          y,
        );

        y += 10;

        // SUB TOPIC
        pdf.setFontSize(14);

        pdf.text(chapter.sub_topic, 20, y);

        y += 10;

        // HTML CONTENT
        const tempDiv = document.createElement("div");

        tempDiv.innerHTML = chapter.content;

        tempDiv.style.width = "700px";

        tempDiv.style.padding = "20px";

        tempDiv.style.fontSize = "16px";

        tempDiv.style.lineHeight = "1.8";

        tempDiv.style.background = "white";

        document.body.appendChild(tempDiv);

        // CONVERT HTML TO CANVAS
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");

        const imgWidth = 170;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // NEW PAGE IF NEEDED
        if (y + imgHeight > 280) {
          pdf.addPage();

          y = 20;
        }

        pdf.addImage(
          imgData,

          "PNG",

          20,

          y,

          imgWidth,

          imgHeight,
        );

        y += imgHeight + 20;

        // REMOVE TEMP DIV
        document.body.removeChild(tempDiv);
      }

      // SAVE PDF
      pdf.save(`${book.book_name}.pdf`);

      // MESSAGE
      setMessage("Book Downloaded Successfully");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setMessage("Download Failed");

      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };
  // =========================================
  // USE EFFECT
  // =========================================

  useEffect(() => {
    setSelectedBookDetails(null);
  }, []);

  useEffect(() => {
    fetchBooks();

    fetchSavedBooks();

    const paused = JSON.parse(localStorage.getItem("pausedBooks")) || [];

    setPausedBooks(paused);

    const history = JSON.parse(localStorage.getItem("readingHistory")) || [];

    setReadingHistory(history);

    const downloaded = JSON.parse(localStorage.getItem("downloads")) || [];

    setDownloads(downloaded);
  }, []);

  const deleteDownload = (index) => {
    const updatedDownloads = downloads.filter((_, i) => i !== index);

    setDownloads(updatedDownloads);

    localStorage.setItem(
      "downloads",

      JSON.stringify(updatedDownloads),
    );
    setMessage("Download Deleted");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const [expandedBooks, setExpandedBooks] = useState({});
  return (
    <div className="h-screen bg-[#f4f7fb] flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-[280px] bg-white shadow-xl p-6 flex flex-col justify-between fixed left-0 top-0 h-screen">
        <div>
          <img src={logo} alt="Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-[#0B4EA2] mt-5">
            Reader Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-4 leading-6 text-justify">
            Discover, read, save, and download your favorite digital books with
            an interactive reading experience. Track your reading progress,
            continue paused sessions, and manage your personal ebook collection
            easily from one place.
          </p>{" "}
          {/* MENU */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => setActivePage("library")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
  ${
    activePage === "library"
      ? "bg-[#0B4EA2] text-white"
      : "hover:bg-[#eef3f9] text-[#0B4EA2]"
  }`}
            >
              Available Books
            </button>
            <button
              onClick={() => setActivePage("available")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "available"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Completed Books
            </button>

            <button
              onClick={() => setActivePage("saved")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "saved"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Saved Books
            </button>

            <button
              onClick={() => setActivePage("paused")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "paused"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Pending Books
            </button>

            <button
              onClick={() => setActivePage("downloads")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "downloads"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Downloads
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
      {/* MODERN POPUP MESSAGE UI */}
      {message && (
        <div className="fixed top-6 right-6 z-[9999] animate-pulse">
          <div
            className={`min-w-[320px] max-w-[400px]
      px-5 py-4 rounded-2xl shadow-2xl
      border backdrop-blur-lg
      flex items-start gap-4
      transition-all duration-500

      ${
        messageType === "success"
          ? "bg-green-500/15 border-green-400 text-green-700"
          : "bg-red-500/15 border-red-400 text-red-700"
      }`}
          >
            {/* ICON */}
            <div
              className={`w-12 h-12 rounded-xl
        flex items-center justify-center
        text-white text-xl font-bold

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
          </div>
        </div>
      )}

      {/* RIGHT SIDE */}
      <div className="ml-[300px] flex-1 overflow-y-auto h-screen p-5">
        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <BookOpen className="text-[#0B4EA2]" size={28} />

            <h2 className="text-2xl font-bold text-[#0B4EA2] mt-4">
              {books.length}
            </h2>

            <p className="text-gray-500 text-sm mt-1">Available Books</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md">
            <Bookmark className="text-orange-400" size={28} />

            <h2 className="text-2xl font-bold text-orange-400 mt-4">
              {savedBooks.length}
            </h2>

            <p className="text-gray-500 text-sm mt-1">Saved Books</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md">
            <Download className="text-[#0B4EA2]" size={28} />

            <h2 className="text-2xl font-bold text-[#0B4EA2] mt-4">
              {downloads.length}
            </h2>

            <p className="text-gray-500 text-sm mt-1">Downloads</p>
          </div>
        </div>
        {/* AVAILABLE BOOKS */}
        {activePage === "available" && (
          <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
            <h2 className="text-xl font-bold text-[#0B4EA2] mb-5">
              Completed Books
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {books
                .filter((book) =>
                  readingHistory.some(
                    (item) => item.book_name === book.book_name,
                  ),
                )
                .map((book, index) => (
                  <div key={index} className="bg-[#eef3f9] p-4 rounded-2xl">
                    <h2 className="text-lg font-bold text-[#0B4EA2]">
                      {book.book_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Chapters:
                      <span className="font-semibold ml-2">
                        {book.chapters?.length}
                      </span>
                    </p>

                    {/* SHOW / HIDE BUTTON */}
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() =>
                          setExpandedBooks({
                            ...expandedBooks,

                            [book.book_name]: !expandedBooks[book.book_name],
                          })
                        }
                        className="bg-blue-500 text-white w-8 h-8 rounded-lg text-sm flex items-center justify-center cursor-pointer"
                      >
                        {expandedBooks[book.book_name] ? "▲" : "▼"}
                      </button>
                    </div>

                    {/* READING HISTORY */}
                    {(expandedBooks[book.book_name]
                      ? readingHistory.filter(
                          (item) => item.book_name === book.book_name,
                        )
                      : readingHistory
                          .filter((item) => item.book_name === book.book_name)
                          .slice(-1)
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="mt-4 bg-green-10 border border-green-200 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-green-600">
                            Completed
                          </p>

                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                          Started Time
                        </p>

                        <p className="text-sm font-semibold text-gray-500  mt-1">
                          {item.start_time}
                        </p>

                        <p className="text-xs text-gray-500 mt-3">
                          Paused Time
                        </p>

                        <p className="text-sm font-semibold text-gray-500 mt-1">
                          {item.paused_time}
                        </p>

                        <p className="text-xs text-gray-500 mt-3">
                          Completed Time
                        </p>

                        <p className="text-sm font-semibold text-gray-500 mt-1">
                          {item.completed_time}
                        </p>

                        <p className="text-xs text-gray-500 mt-3">
                          Total Reading Time
                        </p>

                        <p className="text-sm font-bold text-gray-600 mt-1">
                          {item.total_reading_time || "0h 0m 0s"}
                        </p>
                      </div>
                    ))}

                    {/* BUTTONS */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      <button
                        onClick={() => downloadBook(book)}
                        className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Download size={16} />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SAVED BOOKS */}
        {activePage === "saved" && (
          <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
            <h2 className="text-xl font-bold text-green-600 mb-5">
              Saved Books
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedBooks.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <Bookmark size={60} className="text-gray-300 mx-auto" />

                    <h2 className="text-2xl font-bold text-gray-400 mt-5">
                      No Saved Books
                    </h2>

                    <p className="text-gray-400 text-sm mt-2">
                      Your saved books will appear here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 w-full">
                  {" "}
                  {savedBooks.map((book, index) => (
                    <div
                      key={index}
                      className="bg-[#eef3f9] p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 w-full"
                    >
                      <h2 className="text-xl font-bold text-[#0B4EA2] break-words leading-10">
                        {" "}
                        {book.book_name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-2">
                        Chapters:
                        <span className="font-semibold ml-2">
                          {book.chapters?.length}
                        </span>
                      </p>

                      <div className="flex flex-col gap-3 mt-5">
                        {" "}
                        <button
                          onClick={() => setSelectedBookDetails(book)}
                          className="w-full bg-[#0B4EA2] hover:bg-[#083c7d] text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => removeSavedBook(book.book_name)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AVAILABLE BOOK LIBRARY */}
        {activePage === "library" && (
          <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
              {/* TITLE */}
              <div>
                <h2 className="text-3xl font-bold text-[#0B4EA2]">
                  Ebook Library
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Explore trending digital ebooks and discover new reading
                  experiences
                </p>
              </div>

              {/* SEARCH BAR */}
              <div className="relative w-full lg:w-[420px]">
                <Search
                  className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-gray-400
      "
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search books, publishers, chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
        w-full
        pl-12
        pr-5
        py-4
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-md
        text-sm
        outline-none
        focus:ring-4
        focus:ring-blue-100
        focus:border-[#0B4EA2]
        transition-all
        duration-300
      "
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {books
                .filter(
                  (book) =>
                    book.book_name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    book.publisher
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((book, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedBookDetails(book)}
                    className="group cursor-pointer"
                  >
                    {/* BOOK COVER */}
                    <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white transition-all duration-500 group-hover:-translate-y-3 group-hover:rotate-1">
                      {book.cover_image &&
                      book.cover_image !== "null" &&
                      book.cover_image !== "" ? (
                        <img
                          src={`https://wms-wrnh.onrender.com/${book.cover_image}`}
                          alt="Book Cover"
                          className="
      w-full
      h-[320px]
      object-cover
      rounded-2xl
    "
                        />
                      ) : (
                        <div
                          className="
      w-full
      h-[320px]
      rounded-2xl
      bg-gradient-to-br
      from-[#0B4EA2]
      to-[#083b7e]
      flex
      flex-col
      items-center
      justify-center
      text-white
      shadow-xl
      p-5
    "
                        >
                          <BookOpen size={50} />

                          <h2 className="text-xl font-bold mt-4 text-center">
                            {book.book_name}
                          </h2>

                          <p className="text-sm mt-2 opacity-80">
                            Digital Ebook
                          </p>
                        </div>
                      )}

                      {/* HOVER DETAILS */}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 text-white">
                        <h2 className="text-xl font-bold leading-8">
                          {book.book_name}
                        </h2>

                        <p className="text-sm mt-2 text-gray-300">
                          Publisher: {book.publisher}
                        </p>

                        <p className="text-sm mt-1 text-gray-300">
                          Chapters: {book.chapters?.length}
                        </p>

                        <button className="mt-4 bg-[#0B4EA2] hover:bg-blue-700 text-white py-2 rounded-xl text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* BOOK DETAILS PAGE */}

        {/* BOOK DETAILS PAGE */}

        {selectedBookDetails && (
          <div className="fixed inset-0 z-50 bg-[#f5f7fb] overflow-y-auto">
            {/* TOP NAVBAR */}
            {/* TOP NAVBAR */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
              <div
                className="
      max-w-7xl
      mx-auto
      px-4
      sm:px-6
      lg:px-10
      py-4
      flex
      items-center
      justify-between
    "
              >
                {/* LOGO / TITLE */}
                <div className="flex items-center gap-3">
                  <div
                    className="
          w-10
          h-10
          rounded-xl
          bg-[#0B4EA2]
          flex
          items-center
          justify-center
          shadow-md
        "
                  >
                    <span className="text-white text-lg font-bold">E</span>
                  </div>

                  <div>
                    <h1
                      className="
            text-xl
            sm:text-2xl
            font-bold
            text-[#0B4EA2]
            leading-none
          "
                    >
                      Ebook Hub
                    </h1>

                    <p className="text-xs text-gray-400 mt-1">
                      Digital Reading Platform
                    </p>
                  </div>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    const pendingBook = {
                      ...selectedBookDetails,
                      reading_start_time:
                        selectedBookDetails.reading_start_time ||
                        new Date().toLocaleString(),

                      paused_time: new Date().toLocaleString(),
                    };

                    const oldPaused =
                      JSON.parse(localStorage.getItem("pausedBooks")) || [];

                    const updatedPaused = [
                      ...oldPaused.filter(
                        (book) => book.book_name !== pendingBook.book_name,
                      ),
                      pendingBook,
                    ];

                    localStorage.setItem(
                      "pausedBooks",
                      JSON.stringify(updatedPaused),
                    );

                    setPausedBooks(updatedPaused);

                    setSelectedBookDetails(null);

                    setMessage("Book moved to Pending");

                    setMessageType("success");

                    setTimeout(() => {
                      setMessage("");
                    }, 3000);
                  }}
                  className="
        w-11
        h-11
        flex
        items-center
        justify-center
        rounded-full
        bg-white
        border
        border-gray-200
        shadow-md
        text-gray-500
        hover:bg-red-500
        hover:text-white
        hover:rotate-90
        hover:scale-110
        transition-all
        duration-300
        cursor-pointer
      "
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            </div>

            {/* MAIN SECTION */}
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                {/* LEFT SIDE */}
                <div className="flex justify-center">
                  <div className="sticky top-28">
                    {/* BOOK IMAGE */}
                    <div className="relative group">
                      <img
                        src={
                          selectedBookDetails.cover_image
                            ? selectedBookDetails.cover_image
                            : "https://via.placeholder.com/220x320?text=No+Image"
                        }
                        alt="Book Cover"
                        className="
    w-[220px]
    h-[320px]
    object-cover
    rounded-3xl
    shadow-xl
    transition-all
    duration-500
    group-hover:scale-105
  "
                      />

                      <div
                        className="
                absolute
                inset-0
                rounded-3xl
                bg-gradient-to-t
                from-black/20
                to-transparent
              "
                      />
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-7 space-y-4 w-[220px]">
                      <button
                        onClick={() => saveBook(selectedBookDetails)}
                        className="
                  w-full
                  bg-[#0B4EA2]
                  hover:bg-[#083b7e]
                  text-white
                  py-3
                  rounded-2xl
                  text-sm
                  font-semibold
                  shadow-lg
                  transition-all
                  duration-300
                  cursor-pointer
                "
                      >
                        Save Book
                      </button>

                      <button
                        onClick={() => downloadBook(selectedBookDetails)}
                        className="
                  w-full
                  bg-orange-500
                  hover:bg-orange-600
                  text-white
                  py-3
                  rounded-2xl
                  text-sm
                  font-semibold
                  shadow-lg
                  transition-all
                  duration-300
                  cursor-pointer
                "
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div>
                  {/* CATEGORY */}
                  <p
                    className="
            text-[11px]
            text-gray-400
            uppercase
            tracking-[2px]
            font-medium
          "
                  >
                    Digital Ebook
                  </p>

                  {/* TITLE */}
                  <h1
                    className="
            text-3xl
            lg:text-4xl
            font-bold
            text-[#0B4EA2]
            mt-2
            leading-tight
          "
                  >
                    {selectedBookDetails.book_name}
                  </h1>

                  {/* AUTHOR */}
                  <p className="text-base text-gray-500 mt-3">
                    by {selectedBookDetails.publisher}
                  </p>

                  {/* STATS */}
                  <div className="flex flex-wrap gap-5 mt-9">
                    {/* CHAPTERS */}
                    <div
                      className="
              bg-white
              shadow-md
              rounded-2xl
              px-6
              py-4
              min-w-[130px]
              border
              border-gray-100
            "
                    >
                      <p className="text-sm text-gray-400">Chapters</p>

                      <h2
                        className="
                text-2xl
                font-bold
                text-[#0B4EA2]
                mt-1
              "
                      >
                        {selectedBookDetails.chapters?.length}
                      </h2>
                    </div>

                    {/* STATUS */}
                    <div
                      className="
              bg-white
              shadow-md
              rounded-2xl
              px-6
              py-4
              min-w-[130px]
              border
              border-gray-100
            "
                    >
                      <p className="text-sm text-gray-400">Status</p>

                      <h2
                        className="
                text-2xl
                font-bold
                text-green-500
                mt-1
              "
                      >
                        Available
                      </h2>
                    </div>
                  </div>

                  {/* ABOUT */}
                  <div className="mt-12">
                    <h2
                      className="
              text-2xl
              font-bold
              text-[#0B4EA2]
              mb-4
            "
                    >
                      About This Book
                    </h2>

                    <p
                      className="
              text-[14px]
              text-gray-600
              leading-7
            "
                    >
                      This ebook contains high-quality chapter-based content
                      with interactive reading support, downloadable PDF access,
                      progress tracking, saved collections, and a professional
                      digital reading experience for all readers.
                    </p>
                  </div>

                  {/* CHAPTER PREVIEW */}
                  <div className="mt-14">
                    <h2
                      className="
              text-2xl
              font-bold
              text-[#0B4EA2]
              mb-6
            "
                    >
                      Chapter Preview
                    </h2>

                    <div className="space-y-5">
                      {selectedBookDetails.chapters?.map((chapter, index) => (
                        <div
                          key={index}
                          className="
                    bg-white
                    border
                    border-gray-100
                    rounded-3xl
                    p-6
                    shadow-sm
                    hover:shadow-xl
                    transition-all
                    duration-300
                  "
                        >
                          {/* TOP */}
                          <div className="flex items-center justify-between">
                            <h2
                              className="
                      text-lg
                      font-bold
                      text-[#0B4EA2]
                    "
                            >
                              Chapter {chapter.chapter_number}
                            </h2>

                            <div
                              className="
                      bg-[#eef3ff]
                      text-[#0B4EA2]
                      px-3
                      py-1.5
                      rounded-xl
                      text-xs
                      font-semibold
                    "
                            >
                              Preview
                            </div>
                          </div>

                          {/* SUBTOPIC */}
                          <h3
                            className="
                    text-orange-500
                    text-sm
                    font-semibold
                    mt-3
                  "
                          >
                            {chapter.sub_topic}
                          </h3>

                          {/* CONTENT */}
                          <div
                            className="
                      mt-3
                      text-[13px]
                      text-gray-600
                      leading-6
                      line-clamp-4
                    "
                            dangerouslySetInnerHTML={{
                              __html: chapter.content,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* FIXED COMPLETED BUTTON */}
              <div
                className="
    fixed
    bottom-0
    left-[0px]
    right-0
    bg-white
    border-t
    border-gray-200
    shadow-2xl
    p-4
    z-50
  "
              >
                <button
                  onClick={() => {
                    const completedBook = {
                      ...selectedBookDetails,
                      reading_start_time: new Date().toLocaleString(),
                    };

                    setSelectedBook(completedBook);

                    setTimeout(() => {
                      completeReading();
                      setSelectedBookDetails(null);
                      setActivePage("available");
                    }, 100);
                  }}
                  className="
      w-full
      bg-green-500
      hover:bg-green-600
      text-white
      py-4
      rounded-2xl
      text-base
      font-bold
      shadow-lg
      transition-all
      duration-300
      cursor-pointer
    "
                >
                  Completed Reading
                </button>
              </div>
            </div>
          </div>
        )}
        {/* PAUSED BOOKS */}
        {activePage === "paused" && (
          <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
            <h2 className="text-xl font-bold text-orange-500 mb-5">
              Pending Books
            </h2>

            {pausedBooks.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Pause size={60} className="text-gray-300 mx-auto" />

                  <h2 className="text-2xl font-bold text-gray-400 mt-5">
                    No Pending Books
                  </h2>

                  <p className="text-gray-400 text-sm mt-2">
                    Your paused reading sessions will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pausedBooks.map((book, index) => (
                  <div
                    key={index}
                    className="bg-[#eef3f9] p-4 rounded-2xl border border-gray-200"
                  >
                    <h2 className="text-lg font-bold text-[#0B4EA2]">
                      {book.book_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-3">
                      Paused Time:
                      <span className="font-semibold ml-2 text-orange-500">
                        {book.paused_time}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Started Time:
                      <span className="font-semibold ml-2 text-[#0B4EA2]">
                        {book.reading_start_time}
                      </span>
                    </p>

                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => continueSession(book)}
                        className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* DOWNLOADS */}
        {activePage === "downloads" && (
          <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
            <h2 className="text-xl font-bold text-[#0B4EA2] mb-5">
              Downloaded Books
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {downloads.map((book, index) => (
                <div
                  key={index}
                  className="bg-[#eef3f9] p-4 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#0B4EA2]">
                      {book.book_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Downloaded Successfully
                    </p>
                  </div>

                  <div className="flex justify-end mt-5">
                    <button
                      onClick={() => deleteDownload(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reader;
