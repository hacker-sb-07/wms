// IMPORTANT:
// INSTALL BEFORE RUN:
//
// npm install axios react-quill-new
//
// IF ERROR:
//
// npm install --legacy-peer-deps
//

// Publisher.jsx

import {
  Upload,
  FileText,
  BookMarked,
  LogOut,
  Bold,
  Italic,
  Underline,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import axios from "axios";
import { useLocation } from "react-router-dom";

import logo from "../assets/images.png";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

function Publisher() {
  const navigate = useNavigate();

  const location = useLocation();

  const editBookData = location.state?.editBook;
  const [dragActive, setDragActive] = useState(false);

  const savedFormData = JSON.parse(
    localStorage.getItem("currentBookData") || "null",
  );

  // =========================================
  // STATES
  // =========================================
const [activePage, setActivePage] = useState("upload");

const [books, setBooks] = useState([]);

const [pendingBooks, setPendingBooks] = useState([]);

const [message, setMessage] = useState("");

const [messageType, setMessageType] = useState("");

// BOOK IMAGE
const [bookImage, setBookImage] = useState(null);

const [bookImagePreview, setBookImagePreview] = useState("");

// CURRENT CHAPTER
const [currentChapter, setCurrentChapter] = useState(0);

// WORD EDITOR
const [editorOpen, setEditorOpen] = useState(false);

const [editorContent, setEditorContent] = useState("");

const [bookData, setBookData] = useState({
  book_name: "",

  publisher: "",

  publisher_email: "",

  file: "",

  totalChapters: "",

  chapters: [],
});

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.clear();

    navigate("/");
  };

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // DYNAMIC CHAPTERS
    if (name === "totalChapters") {
      const chapterCount = Number(value);

      const dynamicChapters = Array.from(
        { length: chapterCount },
        (_, index) => ({
          chapter_number: index + 1,

          chapter_title: "",

          sub_topic: "",

          content: "",

          completed: false,
        }),
      );

      setBookData({
        ...bookData,

        totalChapters: value,

        chapters: dynamicChapters,
      });
    } else {
      setBookData({
        ...bookData,

        [name]: value,
      });
    }
  };

  // =========================================
  // HANDLE CHAPTER CHANGE
  // =========================================

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...bookData.chapters];

    updatedChapters[index][field] = value;

    // CHECK COMPLETED
    if (
      updatedChapters[index].chapter_title &&
      updatedChapters[index].sub_topic &&
      updatedChapters[index].content
    ) {
      updatedChapters[index].completed = true;
    } else {
      updatedChapters[index].completed = false;
    }

    setBookData({
      ...bookData,

      chapters: updatedChapters,
    });
  };

  // =========================================
  // OPEN WORD EDITOR
  // =========================================

  const openEditor = () => {
    setEditorContent(bookData.chapters[currentChapter]?.content || "");

    setEditorOpen(true);
  };

  // =========================================
  // SAVE WORD EDITOR
  // =========================================

  const saveEditorContent = () => {
    const updatedChapters = [...bookData.chapters];

    updatedChapters[currentChapter] = {
      ...updatedChapters[currentChapter],

      content: editorContent,

      completed:
        updatedChapters[currentChapter].chapter_title &&
        updatedChapters[currentChapter].sub_topic &&
        editorContent
          ? true
          : false,
    };

    setBookData({
      ...bookData,

      chapters: updatedChapters,
    });

    setEditorOpen(false);

    setMessage("Chapter Saved Successfully");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 1000);
  };
  // =========================================
  // COMPLETED COUNT
  // =========================================

  const completedChapters = bookData.chapters.filter(
    (chapter) => chapter.completed,
  ).length;

  const totalChapters = Number(bookData.totalChapters) || 0;

  // =========================================
  // FETCH BOOKS
  // =========================================

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/books");

      setBooks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================
  // SAVE DRAFT
  // =========================================

  const saveDraft = () => {
    const pendingData = {
      id: Date.now(),

      book_name: bookData.book_name,

      publisher: bookData.publisher,

      file: bookData.file,

      totalChapters,

      completedChapters,

      pendingChapters: totalChapters - completedChapters,

      chapters: bookData.chapters,

      status: "Pending",
    };

    const oldDrafts = JSON.parse(localStorage.getItem("pendingBooks")) || [];

    oldDrafts.push(pendingData);

    localStorage.setItem(
      "pendingBooks",

      JSON.stringify(oldDrafts),
    );

    setPendingBooks(oldDrafts);
    setBookData({
      book_name: "",

      publisher: "",

      publisher_email: "",

      file: "",

      totalChapters: "",

      chapters: [],
    });

    localStorage.removeItem("currentBookData");

    setMessage("Draft Saved Successfully");

    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  // =========================================
  // CONTINUE DRAFT
  // =========================================

  const continueDraft = (book) => {
    setBookData({
      book_name: book.book_name,

      publisher: book.publisher,

      file: book.file,

      totalChapters: book.totalChapters,

      chapters: book.chapters,
    });

    const nextPendingIndex = book.chapters.findIndex(
      (chapter) => !chapter.completed,
    );

    if (nextPendingIndex !== -1) {
      setCurrentChapter(nextPendingIndex);
    }

    setActivePage("upload");

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  // =========================================
  // UPLOAD BOOK
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
   const sendData = {
  book_name: bookData.book_name,
  publisher: bookData.publisher,
  publisher_email: localStorage.getItem("email"),
  file: bookData.file,
  totalChapters,
  chapters: bookData.chapters,

  // ADD THIS
  cover_image: bookImagePreview,
};

      let res;

      // =====================================
      // UPDATE BOOK
      // =====================================

      if (editingBookId !== null) {
        res = await axios.put(
          `http://127.0.0.1:5000/update-book/${editingBookId}`,

          sendData,
        );
      }

      // =====================================
      // UPLOAD NEW BOOK
      // =====================================
      else {
        res = await axios.post(
          "http://127.0.0.1:5000/upload-book",

          sendData,
        );
      }

      // SUCCESS
      setMessage(res.data.message);

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2000);

      fetchBooks();

      // REMOVE PENDING
      const updatedPendingBooks = pendingBooks.filter(
        (book) => book.book_name !== bookData.book_name,
      );

      setPendingBooks(updatedPendingBooks);

      localStorage.setItem(
        "pendingBooks",

        JSON.stringify(updatedPendingBooks),
      );

      // =====================================
      // RESET FORM
      // =====================================

      setBookData({
        book_name: "",

        publisher: "",

        publisher_email: "",

        file: "",

        totalChapters: "",

        chapters: [],
      });

      // VERY IMPORTANT
      setEditingBookId(null);

      // REMOVE OLD EDIT STATE
      navigate("/publisher", {
        replace: true,
        state: null,
      });

      localStorage.removeItem("currentBookData");
    } catch (error) {
      console.log(error);

      setMessage("Upload Failed");

      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };
  // =========================================
  // USE EFFECT
  // =========================================
  useEffect(() => {
    if (savedFormData && !editBookData && savedFormData.book_name) {
      setBookData(savedFormData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "currentBookData",

      JSON.stringify(bookData),
    );
  }, [bookData]);

  useEffect(() => {
    if (editBookData) {
      setActivePage("upload");

      setEditingBookId(editBookData.id);

      setBookData({
        book_name: editBookData.book_name,

        publisher: editBookData.publisher,

        publisher_email: editBookData.publisher_email,

        file: editBookData.file,

        totalChapters: editBookData.chapters?.length,

        chapters: editBookData.chapters,
      });

      setCurrentChapter(0);

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    }
  }, [editBookData]);

  useEffect(() => {
    fetchBooks();

    const drafts = JSON.parse(localStorage.getItem("pendingBooks")) || [];

    setPendingBooks(drafts);
  }, []);

  // =========================================
  // EDIT BOOK
  // =========================================

  // =========================================
  // DELETE BOOK
  // =========================================

  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-book/${id}`);

      const updatedBooks = books.filter((book) => book.id !== id);

      setBooks(updatedBooks);

      setMessage("Book Deleted Successfully");

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.log(error);

      setMessage("Delete Failed");

      setMessageType("error");
    }
  };

  const [editingBookId, setEditingBookId] = useState(null);

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

  const handlePdfUpload = async (file) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result);

        // LOAD PDF
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        const totalPages = pdf.numPages;

        // AUTO TITLE
        let cleanTitle = file.name
          .replace(".pdf", "")
          .replace(/_/g, " ")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const fileName = file.name;

        let fullText = "";

        // READ ALL PAGES
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);

          const textContent = await page.getTextContent();

          const text = textContent.items.map((item) => item.str).join(" ");

          fullText += text + "\n";
        }

        // SPLIT CHAPTERS
        let chapterBlocks = fullText
          .split(/(?=Chapter\s+\d+)/gi)
          .filter(Boolean);

        let detectedChapters = [];

        if (chapterBlocks.length === 0) {
          detectedChapters = [
            {
              chapter_number: 1,

              chapter_title: "Chapter 1",

              sub_topic: "Introduction",

              content: `
        <h2>Introduction</h2>

        <p>${fullText}</p>
      `,

              completed: true,
            },
          ];
        }

        // CREATE CHAPTER DATA
        chapterBlocks.forEach((block, index) => {
          const lines = block
            .split(".")
            .map((line) => line.trim())
            .filter(Boolean);

          // CHAPTER TITLE
          const chapterMatch = lines[0]?.match(/Chapter\s+\d+/i);

          const chapterTitle = chapterMatch?.[0] || `Chapter ${index + 1}`;

          // REMOVE CHAPTER TITLE
          let remainingText = block.replace(chapterTitle, "");

          remainingText = remainingText.trim();
          // SUB TOPIC// SPLIT LINES
          const textLines = remainingText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          // REMOVE BOOK TITLE IF EXISTS
          if (
            textLines[0] &&
            textLines[0].toLowerCase() === cleanTitle.toLowerCase()
          ) {
            textLines.shift();
          }

          // SUB TOPIC
          let subTopicLine = textLines[0] || `Topic ${index + 1}`;

          // CONTENT
          let contentText = textLines.slice(1).join(" ");

          // REMOVE TITLE FROM CONTENT
          contentText = contentText.replace(cleanTitle, "");
          detectedChapters.push({
            chapter_number: index + 1,

            chapter_title: chapterTitle,

            sub_topic: subTopicLine,

            content: `
            <h2>${chapterTitle}</h2>

            <h3>${subTopicLine}</h3>

            <p>${contentText}</p>
          `,

            completed: true,
          });
        });

        // FALLBACK
        if (detectedChapters.length === 0) {
          detectedChapters = [
            {
              chapter_number: 1,

              chapter_title: "Chapter 1",

              sub_topic: "Introduction",

              content: `
              <h2>Chapter 1</h2>

              <h3>Introduction</h3>

              <p>${fullText}</p>
            `,

              completed: true,
            },
          ];
        }

        // SET DATA
        setBookData({
          ...bookData,

          book_name: cleanTitle,

          publisher: localStorage.getItem("name") || "",

          publisher_email: localStorage.getItem("email") || "",

          file: fileName,

          totalChapters: detectedChapters.length,

          chapters: detectedChapters,
        });

        // SUCCESS
        setMessage("PDF Uploaded Successfully");

        setMessageType("success");

        setTimeout(() => {
          setMessage("");
        }, 2000);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.log(error);

      setMessage("PDF Upload Failed");

      setMessageType("error");
    }
  };
  return (
    <div className="min-h-screen bg-[#f4f7fb] ml-[320px] p-6">
      {/* SIDEBAR */}
      <div className="w-[300px] bg-white shadow-xl p-6 flex flex-col fixed left-0 top-0 h-screen overflow-y-auto">
        <div>
          <img src={logo} alt="Logo" className="w-32 mx-auto" />

          <h1 className="text-2xl font-bold text-[#0B4EA2] mt-5 text-center">
            Publisher Dashboard
          </h1>

          <p className="text-gray-500 text-sm mt-4 leading-6 text-justify">
            Create, manage, and publish digital books with chapter-based content
            management.
          </p>

          {/* MENU */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => setActivePage("upload")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "upload"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Upload Books
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

            <button
              onClick={() => setActivePage("published")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer
              ${
                activePage === "published"
                  ? "bg-[#0B4EA2] text-white"
                  : "hover:bg-[#eef3f9] text-[#0B4EA2]"
              }`}
            >
              Published Books
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer mt-55"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* MESSAGE */}
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

      {/* UPLOAD PAGE */}
      {activePage === "upload" && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#0B4EA2] mb-6">
            Upload New Book
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* DRAG & DROP PDF */}
            <div
              onDragOver={(e) => {
                e.preventDefault();

                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();

                setDragActive(false);

                const file = e.dataTransfer.files[0];

                if (file && file.type === "application/pdf") {
                  handlePdfUpload(file);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300

  ${
    dragActive ? "border-[#0B4EA2] bg-blue-50" : "border-gray-300 bg-[#f8fbff]"
  }`}
            >
              <Upload size={50} className="mx-auto text-[#0B4EA2]" />

              <h2 className="text-xl font-bold text-[#0B4EA2] mt-4">
                Drag & Drop PDF Here
              </h2>

              <p className="text-gray-500 mt-2">
                Upload PDF to auto fill book details
              </p>

              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="pdfUpload"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    handlePdfUpload(file);
                  }
                }}
              />

              <label
                htmlFor="pdfUpload"
                className="inline-block mt-5 bg-[#0B4EA2] hover:bg-[#083c7d] text-white px-6 py-3 rounded-xl cursor-pointer transition-all duration-300"
              >
                Choose PDF
              </label>
            </div>
            <input
              type="text"
              name="book_name"
              placeholder="Book Title"
              value={bookData.book_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-xl"
            />

            <input
              type="text"
              name="publisher"
              placeholder="Publisher Name"
              value={bookData.publisher}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-xl"
            />

            <input
              type="text"
              name="file"
              placeholder="Book File Name"
              value={bookData.file}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-xl"
            />

<div className="mb-5">
  <label className="block text-[#0B4EA2] font-semibold mb-2">
    Upload Book Cover
  </label>

  <label
    htmlFor="bookImage"
    className="w-full h-[180px] border-2 border-dashed border-gray-300 rounded-2xl bg-[#F8FAFF] hover:bg-[#EEF4FF] transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group"
  >
    {bookImagePreview ? (
      <img
        src={bookImagePreview}
        alt="Book Cover"
        className="w-full h-full object-cover rounded-2xl"
      />
    ) : (
      <>
        <div className="w-16 h-16 rounded-full bg-[#0B4EA2]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-[#0B4EA2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="text-[#0B4EA2] font-bold text-lg">
          Upload Book Image
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          Click to choose image
        </p>
      </>
    )}
  </label>

  <input
    id="bookImage"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];

      if (file) {
        setBookImage(file);
        setBookImagePreview(URL.createObjectURL(file));
      }
    }}
  />
</div>
            <input
              type="number"
              name="totalChapters"
              placeholder="Enter Total Chapters"
              value={bookData.totalChapters}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-xl"
            />

            {/* CHAPTER SECTION */}
            {totalChapters > 0 && (
              <div className="border rounded-2xl p-5 bg-[#f8fbff]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#0B4EA2]">
                    Chapter {currentChapter + 1}
                  </h2>

                  <span className="bg-orange-400 text-white px-4 py-1 rounded-full text-sm">
                    {completedChapters} /{totalChapters}
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Chapter Title"
                  value={bookData.chapters[currentChapter]?.chapter_title}
                  onChange={(e) =>
                    handleChapterChange(
                      currentChapter,
                      "chapter_title",
                      e.target.value,
                    )
                  }
                  className="w-full border border-gray-300 p-3 rounded-xl mb-3"
                />
                

                <input
                  type="text"
                  placeholder="Sub Topic"
                  value={bookData.chapters[currentChapter]?.sub_topic}
                  onChange={(e) =>
                    handleChapterChange(
                      currentChapter,
                      "sub_topic",
                      e.target.value,
                    )
                  }
                  className="w-full border border-gray-300 p-3 rounded-xl mb-3"
                />

                {/* OPEN EDITOR */}
                <div
                  onClick={openEditor}
                  className="w-full border border-gray-300 p-5 rounded-xl bg-white cursor-pointer hover:border-orange-400 min-h-[200px]"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        bookData.chapters[currentChapter]?.content ||
                        "<p>Click to open MS Word Editor...</p>",
                    }}
                  ></div>
                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between mt-5">
                  <button
                    type="button"
                    disabled={currentChapter === 0}
                    onClick={() => setCurrentChapter(currentChapter - 1)}
                    className="bg-[#0B4EA2] text-white px-4 py-2 rounded-xl"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentChapter === bookData.chapters.length - 1}
                    onClick={() => setCurrentChapter(currentChapter + 1)}
                    className="bg-orange-400 text-white px-4 py-2 rounded-xl"
                  >
                    Next
                  </button>
                </div>

                <button
                  type="button"
                  onClick={saveDraft}
                  className="w-full bg-[#0B4EA2] text-white py-3 rounded-xl mt-5"
                >
                  Save Draft
                </button>
              </div>
            )}

            <button
              disabled={completedChapters !== totalChapters}
              className={`w-full py-3 rounded-xl text-white font-semibold
                ${
                  completedChapters === totalChapters
                    ? "bg-orange-400"
                    : "bg-gray-400"
                }`}
            >
              {editingBookId ? "Update Book" : "Upload & Publish Book"}
            </button>
          </form>
        </div>
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
                    <span className="ml-2 font-semibold">{book.publisher}</span>
                  </p>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => continueDraft(book)}
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

      {/* PUBLISHED PAGE */}
      {activePage === "published" && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#0B4EA2] mb-6">
            Published Books
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {books.map((book, index) => (
              <div
                key={index}
                className="bg-[#eef3f9] p-5 rounded-2xl relative group hover:shadow-xl transition"
              >
                {/* HOVER ACTIONS */}
                <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                  <button
                    onClick={() =>
                      navigate("/publisher", {
                        state: {
                          editBook: book,
                        },
                      })
                    }
                    className="bg-[#0B4EA2] hover:bg-[#083c7d] text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteBook(book.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Delete
                  </button>
                </div>

                <h2 className="text-xl font-bold text-[#0B4EA2]">
                  {book.book_name}
                </h2>

                <p className="text-sm text-gray-500 mt-3">
                  Chapters:
                  <span className="ml-2 font-semibold">
                    {book.chapters?.length}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORD EDITOR */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#f1f3f4] w-full max-w-7xl h-[95vh] rounded-2xl overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="bg-[#0B4EA2] text-white px-6 py-4 flex justify-between">
              <h2 className="text-xl font-bold">MS Word Editor</h2>

              <button
                onClick={() => setEditorOpen(false)}
                className="bg-red-500 px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white border-b px-6 py-3 flex flex-wrap gap-3">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Bold size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <Italic size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <Underline size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <AlignLeft size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <AlignCenter size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <AlignRight size={18} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <Type size={18} />
              </button>
            </div>

            {/* PAPER */}
            <div className="flex-1 overflow-y-auto bg-[#d9d9d9] p-10">
              <div className="bg-white max-w-4xl mx-auto min-h-[1100px] shadow-2xl">
                <ReactQuill
                  theme="snow"
                  value={editorContent}
                  onChange={setEditorContent}
                  className="h-[1000px]"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-white border-t px-6 py-4 flex justify-end">
              <button
                onClick={saveEditorContent}
                className="bg-green-500 text-white px-6 py-3 rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Publisher;
