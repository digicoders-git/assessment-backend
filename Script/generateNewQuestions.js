import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const questionsDir = path.resolve('../questions');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// 1. CS / IT / BCA / MCA / BSC (100 Questions)
// ─────────────────────────────────────────────────────────────
const csQuestions = [
  // C / C++ / Fundamentals (1-20)
  {
    question: "C language mein 'int' data type normally 32-bit compiler par kitne bytes memory occupy karta hai?",
    optionA: "1 Byte", optionB: "2 Bytes", optionC: "4 Bytes", optionD: "8 Bytes",
    correctOption: "C"
  },
  {
    question: "C language mein formatted output screen par display karne ke liye kaun sa function use hota hai?",
    optionA: "scanf()", optionB: "printf()", optionC: "print()", optionD: "display()",
    correctOption: "B"
  },
  {
    question: "C/C++ mein kisi variable ka address pane ke liye kaun sa operator use kiya jata hai?",
    optionA: "*", optionB: "&", optionC: "->", optionD: "%",
    correctOption: "B"
  },
  {
    question: "C language mein dynamically memory allocate karne ke liye kaun sa standard function use hota hai?",
    optionA: "alloc()", optionB: "malloc()", optionC: "create()", optionD: "new()",
    correctOption: "B"
  },
  {
    question: "C language mein string ke last mein kaun sa terminating character hota hai?",
    optionA: "\\0 (Null character)", optionB: "\\n (Newline)", optionC: "\\t (Tab)", optionD: "EOF",
    correctOption: "A"
  },
  {
    question: "Agar 'int x = 5; int y = x++;' ho, to x aur y ki final values kya hongi?",
    optionA: "x = 5, y = 5", optionB: "x = 6, y = 5", optionC: "x = 6, y = 6", optionD: "x = 5, y = 6",
    correctOption: "B"
  },
  {
    question: "C++ mein class ke private members ko class ke bahar se access karne ki permission kis function ko hoti hai?",
    optionA: "Virtual Function", optionB: "Inline Function", optionC: "Friend Function", optionD: "Static Function",
    correctOption: "C"
  },
  {
    question: "C++ mein Object Oriented Programming (OOP) ka kaun sa concept code reusability provide karta hai?",
    optionA: "Encapsulation", optionB: "Polymorphism", optionC: "Inheritance", optionD: "Abstraction",
    correctOption: "C"
  },
  {
    question: "C/C++ mein 'switch' statement ke andar break statement na lagane par kya hota hai?",
    optionA: "Compilation Error", optionB: "Fall-through behavior hota hai", optionC: "Infinite loop chalta hai", optionD: "Program terminate ho jata hai",
    correctOption: "B"
  },
  {
    question: "C++ mein class ke object create hote hi automatically kaun sa special member function call hota hai?",
    optionA: "Destructor", optionB: "Constructor", optionC: "Virtual Method", optionD: "Main Method",
    correctOption: "B"
  },
  {
    question: "C language mein 'sizeof' kya hai?",
    optionA: "Ek built-in function", optionB: "Ek compile-time operator", optionC: "Ek keyword and loop", optionD: "Ek preprocessor directive",
    correctOption: "B"
  },
  {
    question: "C language mein single line comment ke liye kaun sa symbol use kiya jata hai?",
    optionA: "/*", optionB: "//", optionC: "#", optionD: "--",
    correctOption: "B"
  },
  {
    question: "Pointer jo kisi bhi valid memory location ko point nahi karta, use kya kehte hain?",
    optionA: "Dangling Pointer", optionB: "Null Pointer", optionC: "Wild Pointer", optionD: "Void Pointer",
    correctOption: "B"
  },
  {
    question: "malloc() dwara allocate ki gayi memory ko deallocate (free) karne ke liye kya use hota hai?",
    optionA: "delete()", optionB: "free()", optionC: "remove()", optionD: "clear()",
    correctOption: "B"
  },
  {
    question: "C++ mein Polymorphism achieve karne ke liye base class mein functions ke aage kaun sa keyword lagaya jata hai?",
    optionA: "static", optionB: "virtual", optionC: "abstract", optionD: "override",
    correctOption: "B"
  },
  {
    question: "C language mein Header files ko program mein include karne ke liye preprocessor command kaun si hai?",
    optionA: "#include", optionB: "#define", optionC: "#import", optionD: "#require",
    correctOption: "A"
  },
  {
    question: "Array ke sabhi elements memory mein kis pattern mein store hote hain?",
    optionA: "Random locations par", optionB: "Contiguous (lagataar) memory locations par", optionC: "Linked list ki tarah", optionD: "Tree structure mein",
    correctOption: "B"
  },
  {
    question: "Recursion ka matlab programming mein kya hota hai?",
    optionA: "Loop ka infinite chalna", optionB: "Function ka apne aap ko call karna", optionC: "Pointer ka address change hona", optionD: "Array ka size badhana",
    correctOption: "B"
  },
  {
    question: "C++ mein multiple functions ka name same hona lekin parameters alag hona kya kehlata hai?",
    optionA: "Function Overriding", optionB: "Function Overloading", optionC: "Function Hiding", optionD: "Dynamic Binding",
    correctOption: "B"
  },
  {
    question: "C language kis type ki programming language hai?",
    optionA: "Pure Object Oriented", optionB: "Procedural / Structured Language", optionC: "Functional Only", optionD: "No-code Language",
    correctOption: "B"
  },

  // Python & Java (21-40)
  {
    question: "Python language mein code blocks ko define karne ke liye brackets ki jagah kya use kiya jata hai?",
    optionA: "Semicolon (;)", optionB: "Indentation (Spaces/Tabs)", optionC: "Parenthesis ()", optionD: "Curly Braces {}",
    correctOption: "B"
  },
  {
    question: "Python mein immutable (jiski value badli na ja sake) data type kaun sa hai?",
    optionA: "List", optionB: "Dictionary", optionC: "Tuple", optionD: "Set",
    correctOption: "C"
  },
  {
    question: "Python mein function define karne ke liye kaun sa keyword use hota hai?",
    optionA: "function", optionB: "def", optionC: "fun", optionD: "define",
    correctOption: "B"
  },
  {
    question: "Python mein 'print(type([]))' ka output kya aayega?",
    optionA: "<class 'tuple'>", optionB: "<class 'list'>", optionC: "<class 'set'>", optionD: "<class 'dict'>",
    correctOption: "B"
  },
  {
    question: "Python mein anonymous (bina naam ka) single-line function banane ke liye kaun sa keyword use hota hai?",
    optionA: "inline", optionB: "lambda", optionC: "short", optionD: "anonymous",
    correctOption: "B"
  },
  {
    question: "Python mein dictionary se keys aur values ka pair lene ke liye kaun sa method use hota hai?",
    optionA: "dict.all()", optionB: "dict.items()", optionC: "dict.pairs()", optionD: "dict.getPairs()",
    correctOption: "B"
  },
  {
    question: "Java mein compilation ke baad generated byte code file ka extension kya hota hai?",
    optionA: ".java", optionB: ".class", optionC: ".exe", optionD: ".obj",
    correctOption: "B"
  },
  {
    question: "Java code ko run karne ke liye kaun sa runtime environment responsible hota hai?",
    optionA: "JDK", optionB: "JVM (Java Virtual Machine)", optionC: "JRE only", optionD: "JIT Compiler only",
    correctOption: "B"
  },
  {
    question: "Java mein multiple inheritance classes ke through directly support kyu nahi hoti?",
    optionA: "Diamond Problem se bachne ke liye", optionB: "Memory kam hoti hai", optionC: "Speed slow hoti hai", optionD: "JVM error deta hai",
    correctOption: "A"
  },
  {
    question: "Java mein interface ko implement karne ke liye kaun sa keyword use kiya jata hai?",
    optionA: "extends", optionB: "implements", optionC: "inherits", optionD: "using",
    correctOption: "B"
  },
  {
    question: "Java mein string comparison ke liye content match karne hetu kaun sa method use karna chahiye?",
    optionA: "==", optionB: "equals()", optionC: "compare()", optionD: "match()",
    correctOption: "B"
  },
  {
    question: "Java mein unreferenced objects ki memory ko automatically reclaim kaun karta hai?",
    optionA: "Destructor", optionB: "Garbage Collector", optionC: "Memory Allocator", optionD: "System Clear",
    correctOption: "B"
  },
  {
    question: "Java mein 'final' keyword variable ke sath lagane par kya hota hai?",
    optionA: "Variable delete ho jata hai", optionB: "Variable constant ban jata hai", optionC: "Variable private ban jata hai", optionD: "Variable static ban jata hai",
    correctOption: "B"
  },
  {
    question: "Python mein list ke end mein ek element add karne ke liye kaun sa method use hota hai?",
    optionA: "push()", optionB: "append()", optionC: "insertEnd()", optionD: "add()",
    correctOption: "B"
  },
  {
    question: "Python mein kisi string ko number mein convert karne ke liye kaun sa function use hota hai?",
    optionA: "toInt()", optionB: "int()", optionC: "parse()", optionD: "convert()",
    correctOption: "B"
  },
  {
    question: "Java mein sabhi classes ki root (parent) superclass kaun si hoti hai?",
    optionA: "Main", optionB: "Object", optionC: "System", optionD: "Runtime",
    correctOption: "B"
  },
  {
    question: "Java mein exception handling ke liye kaun sa block har haal mein execute hota hai chahe exception aaye ya na aaye?",
    optionA: "try", optionB: "catch", optionC: "finally", optionD: "throw",
    correctOption: "C"
  },
  {
    question: "Python mein multi-line comment ke liye commonly kya use kiya jata hai?",
    optionA: "/* ... */", optionB: "Triple quotes (''' ya \"\"\")", optionC: "<!-- ... -->", optionD: "## ... ##",
    correctOption: "B"
  },
  {
    question: "Python mein list slicing 'lst[1:4]' ka kya matlab hota hai?",
    optionA: "Index 1 se 4 tak sabhi", optionB: "Index 1 se lekar index 3 tak ke elements", optionC: "First 4 elements", optionD: "Index 4 se 1 tak reverse",
    correctOption: "B"
  },
  {
    question: "Java mein 'super' keyword ka use kiske liye kiya jata hai?",
    optionA: "Parent class ke members aur constructor ko access karne ke liye", optionB: "Child class ko call karne ke liye", optionC: "Static method call karne ke liye", optionD: "Program terminate karne ke liye",
    correctOption: "A"
  },

  // Web Technologies: HTML, CSS, JavaScript (41-60)
  {
    question: "HTML ka full form kya hai?",
    optionA: "High Text Markup Language", optionB: "Hyper Text Markup Language", optionC: "Hyper Transfer Model Language", optionD: "Home Tool Markup Language",
    correctOption: "B"
  },
  {
    question: "HTML5 mein webpage ke main navigation links ko wrap karne ke liye kaun sa semantic tag use hota hai?",
    optionA: "<menu>", optionB: "<navigate>", optionC: "<nav>", optionD: "<links>",
    correctOption: "C"
  },
  {
    question: "CSS ka full form kya hai?",
    optionA: "Creative Style Sheets", optionB: "Cascading Style Sheets", optionC: "Computer Style Syntax", optionD: "Color Style Sheets",
    correctOption: "B"
  },
  {
    question: "CSS Box Model mein element content aur border ke beech ka space kya kehlata hai?",
    optionA: "Margin", optionB: "Padding", optionC: "Outline", optionD: "Gap",
    correctOption: "B"
  },
  {
    question: "CSS mein kisi element ko flex container banane ke liye kaun si property use hoti hai?",
    optionA: "display: flex;", optionB: "layout: flex;", optionC: "flex: box;", optionD: "position: flex;",
    correctOption: "A"
  },
  {
    question: "JavaScript mein block-scoped variable declare karne ke liye ES6 mein kaun sa keyword introduce kiya gaya?",
    optionA: "var", optionB: "let aur const", optionC: "dim", optionD: "define",
    correctOption: "B"
  },
  {
    question: "JavaScript mein 'typeof null' ka return value kya hota hai?",
    optionA: "'null'", optionB: "'undefined'", optionC: "'object'", optionD: "'boolean'",
    correctOption: "C"
  },
  {
    question: "JavaScript mein '===' (Strict Equality) aur '==' (Loose Equality) mein kya antar hai?",
    optionA: "Koi antar nahi hai", optionB: "'===' value aur data type dono check karta hai", optionC: "'==' type check karta hai aur '===' nahi", optionD: "'===' sirf numbers ke liye hota hai",
    correctOption: "B"
  },
  {
    question: "JavaScript mein DOM ka full form kya hota hai?",
    optionA: "Data Object Model", optionB: "Document Object Model", optionC: "Document Oriented Method", optionD: "Digital Operation Management",
    correctOption: "B"
  },
  {
    question: "JavaScript mein asynchronous operations ko handle karne ke liye modern syntax kaun sa hai?",
    optionA: "threads and mutex", optionB: "async / await", optionC: "goto label", optionD: "wait() only",
    correctOption: "B"
  },
  {
    question: "HTML document mein images display karne ke liye kaun sa tag use kiya jata hai?",
    optionA: "<picture>", optionB: "<img>", optionC: "<src>", optionD: "<image>",
    correctOption: "B"
  },
  {
    question: "CSS mein element ko exact screen ke relative fix karne ke liye kaun si position use hoti hai?",
    optionA: "position: relative;", optionB: "position: absolute;", optionC: "position: fixed;", optionD: "position: static;",
    correctOption: "C"
  },
  {
    question: "JavaScript mein array ke elements ko transform karke naya array banane ke liye kaun sa method best hai?",
    optionA: "forEach()", optionB: "map()", optionC: "filter()", optionD: "reduce()",
    correctOption: "B"
  },
  {
    question: "JSON ka full form kya hai?",
    optionA: "Java Server Oriented Network", optionB: "JavaScript Object Notation", optionC: "Java Standard Output Node", optionD: "JavaScript Operation Name",
    correctOption: "B"
  },
  {
    question: "HTML mein hyperlinks create karne ke liye kaun sa tag aur attribute use hota hai?",
    optionA: "<a href='...'>", optionB: "<link src='...'>", optionC: "<nav url='...'>", optionD: "<href to='...'>",
    correctOption: "A"
  },
  {
    question: "CSS Grid layout mein columns define karne ke liye kaun si property use hoti hai?",
    optionA: "grid-template-columns", optionB: "grid-columns-count", optionC: "column-layout", optionD: "display-columns",
    correctOption: "A"
  },
  {
    question: "JavaScript mein kisi function ko execute hone se pehle specific delay dene ke liye kaun sa timer function use hota hai?",
    optionA: "delay()", optionB: "setTimeout()", optionC: "setInterval()", optionD: "wait()",
    correctOption: "B"
  },
  {
    question: "HTML5 form input mein user se mandatory value lene ke liye kaun sa attribute lagaya jata hai?",
    optionA: "mandatory", optionB: "required", optionC: "validate", optionD: "needed",
    correctOption: "B"
  },
  {
    question: "JavaScript mein 'Promise.all()' ka kya use hota hai?",
    optionA: "Pehle promise ko resolve karna", optionB: "Multiple promises ko parallel resolve hone ka wait karna", optionC: "Promises ko cancel karna", optionD: "Memory free karna",
    correctOption: "B"
  },
  {
    question: "Browser mein client-side data securely store karne ke liye modern Web Storage API kaun si hai?",
    optionA: "Cookies only", optionB: "localStorage & sessionStorage", optionC: "Flash Storage", optionD: "Applet Storage",
    correctOption: "B"
  },

  // DBMS & SQL (61-75)
  {
    question: "DBMS mein ACID properties ka full form kya hai?",
    optionA: "Atomicity, Consistency, Isolation, Durability",
    optionB: "Accuracy, Completeness, Integrity, Durability",
    optionC: "Action, Connection, Isolation, Data",
    optionD: "Access, Control, Information, Database",
    correctOption: "A"
  },
  {
    question: "Relational Database table mein har row (record) ko uniquely identify karne wali key kya kehlati hai?",
    optionA: "Foreign Key", optionB: "Candidate Key", optionC: "Primary Key", optionD: "Super Key only",
    correctOption: "C"
  },
  {
    question: "SQL mein existing table se matching records filter karne ke liye kaun sa clause use hota hai?",
    optionA: "GROUP BY", optionB: "ORDER BY", optionC: "WHERE", optionD: "HAVING only",
    correctOption: "C"
  },
  {
    question: "SQL mein do tables ko unke common columns ke basis par combine karne ke liye kya use kiya jata hai?",
    optionA: "MERGE", optionB: "JOIN (e.g. INNER JOIN)", optionC: "UNION ALL only", optionD: "ATTACH",
    correctOption: "B"
  },
  {
    question: "Database Normalization ka primary goal kya hota hai?",
    optionA: "Data Redundancy kam karna aur Data Integrity badhana", optionB: "Table ka size double karna", optionC: "SQL queries ko slow karna", optionD: "Security disable karna",
    correctOption: "A"
  },
  {
    question: "SQL command 'DROP TABLE' aur 'TRUNCATE TABLE' mein kya antar hai?",
    optionA: "Dono same hain", optionB: "DROP table structure aur data dono delete karta hai, jabki TRUNCATE sirf data delete karta hai", optionC: "TRUNCATE table delete karta hai", optionD: "DROP sirf single row delete karta hai",
    correctOption: "B"
  },
  {
    question: "NoSQL databases (jaise MongoDB) kis format mein data store karte hain?",
    optionA: "Tables aur Rows", optionB: "JSON/BSON Documents ya Key-Value pairs", optionC: "Spreadsheet XML", optionD: "Text files only",
    correctOption: "B"
  },
  {
    question: "SQL mein table me naya column add karne ke liye kaun si DDL command use hoti hai?",
    optionA: "UPDATE TABLE", optionB: "ALTER TABLE", optionC: "MODIFY SCHEMA", optionD: "INSERT COLUMN",
    correctOption: "B"
  },
  {
    question: "SQL mein aggregate functions (COUNT, SUM, AVG) ke sath condition check karne ke liye kaun sa clause use hota hai?",
    optionA: "WHERE", optionB: "HAVING", optionC: "FILTER", optionD: "CHECK",
    correctOption: "B"
  },
  {
    question: "Database mein Foreign Key ka primary purpose kya hota hai?",
    optionA: "Query speed badhana", optionB: "Do tables ke beech Referential Integrity maintain karna", optionC: "Null values allow na karna", optionD: "Table ko encrypt karna",
    correctOption: "B"
  },
  {
    question: "SQL mein DDL (Data Definition Language) commands ka example kaun sa hai?",
    optionA: "SELECT, INSERT", optionB: "CREATE, ALTER, DROP", optionC: "GRANT, REVOKE", optionD: "COMMIT, ROLLBACK",
    correctOption: "B"
  },
  {
    question: "SQL mein table se specific duplicate records ko remove karke unique results lane ke liye kaun sa keyword use hota hai?",
    optionA: "UNIQUE", optionB: "DISTINCT", optionC: "DIFFERENT", optionD: "SINGLE",
    correctOption: "B"
  },
  {
    question: "Database Indexing ka main fayda kya hota hai?",
    optionA: "Disk storage kam karna", optionB: "Search aur Data Retrieval speed ko fast karna", optionC: "Data delete hone se bachana", optionD: "Automatic backup lena",
    correctOption: "B"
  },
  {
    question: "Transaction ko rollback ya commit karne wali commands kis category mein aati hain?",
    optionA: "DML", optionB: "DDL", optionC: "TCL (Transaction Control Language)", optionD: "DQL",
    correctOption: "C"
  },
  {
    question: "MongoDB mein ek individual record ko kya kaha jata hai?",
    optionA: "Row", optionB: "Document", optionC: "Tuple", optionD: "Entity",
    correctOption: "B"
  },

  // Data Structures & Algorithms (76-90)
  {
    question: "Stack Data Structure kis principle par work karta hai?",
    optionA: "FIFO (First In First Out)", optionB: "LIFO (Last In First Out)", optionC: "Random Access", optionD: "Priority Order",
    correctOption: "B"
  },
  {
    question: "Queue Data Structure kis principle par work karta hai?",
    optionA: "LIFO", optionB: "FIFO (First In First Out)", optionC: "Binary Search", optionD: "Tree Traversal",
    correctOption: "B"
  },
  {
    question: "Sorted array mein element search karne ke liye sabse efficient search algorithm kaun sa hai?",
    optionA: "Linear Search", optionB: "Binary Search (O(log n))", optionC: "Bubble Search", optionD: "Depth First Search",
    correctOption: "B"
  },
  {
    question: "Binary Search Algorithm ki average aur worst case time complexity kya hoti hai?",
    optionA: "O(1)", optionB: "O(n)", optionC: "O(log n)", optionD: "O(n^2)",
    correctOption: "C"
  },
  {
    question: "Merge Sort Algorithm kis approach par work karta hai?",
    optionA: "Greedy Approach", optionB: "Dynamic Programming", optionC: "Divide and Conquer", optionD: "Backtracking",
    correctOption: "C"
  },
  {
    question: "Singly Linked List mein ek node mein kitne main parts hote hain?",
    optionA: "1 (Data)", optionB: "2 (Data aur Next pointer)", optionC: "3 (Prev, Data, Next)", optionD: "4 parts",
    correctOption: "B"
  },
  {
    question: "Binary Tree mein har node ke maximum kitne children ho sakte hain?",
    optionA: "1", optionB: "2", optionC: "3", optionD: "Unlimited",
    correctOption: "B"
  },
  {
    question: "Array ke kisi bhi index par direct access karne ki time complexity kya hoti hai?",
    optionA: "O(1) - Constant Time", optionB: "O(n)", optionC: "O(log n)", optionD: "O(n log n)",
    correctOption: "A"
  },
  {
    question: "QuickSort algorithm ki best/average case time complexity kya hoti hai?",
    optionA: "O(n)", optionB: "O(n log n)", optionC: "O(n^2)", optionD: "O(log n)",
    correctOption: "B"
  },
  {
    question: "Graph traversal ke do most common algorithms kaun se hain?",
    optionA: "Linear aur Binary Search", optionB: "BFS (Breadth-First) aur DFS (Depth-First)", optionC: "Push aur Pop", optionD: "Min aur Max Heap",
    correctOption: "B"
  },
  {
    question: "Circular Queue mein front aur rear ko advance karne ke liye kaun sa operator use hota hai?",
    optionA: "Division (/)", optionB: "Modulo (%)", optionC: "Multiplication (*)", optionD: "Bitwise AND (&)",
    correctOption: "B"
  },
  {
    question: "Hash Table mein collision resolve karne ki standard technique kaun si hai?",
    optionA: "Sorting", optionB: "Chaining / Open Addressing", optionC: "Binary Search", optionD: "Recursion",
    correctOption: "B"
  },
  {
    question: "Binary Search Tree (BST) ka Inorder Traversal elements ko kis order mein display karta hai?",
    optionA: "Random order", optionB: "Descending order", optionC: "Ascending (Sorted) order", optionD: "Level by level",
    correctOption: "C"
  },
  {
    question: "Shortest path algorithm (single source) ke liye kaun sa algorithm sabse famous hai?",
    optionA: "Prim's Algorithm", optionB: "Kruskal's Algorithm", optionC: "Dijkstra's Algorithm", optionD: "Huffman Coding",
    correctOption: "C"
  },
  {
    question: "Dynamic Programming ka core concept kya hota hai?",
    optionA: "Har bar fresh calculation karna", optionB: "Overlapping subproblems ke results ko memoize/store karke reuse karna", optionC: "Random guessing", optionD: "Brute force search",
    correctOption: "B"
  },

  // Operating Systems & Computer Networks (91-100)
  {
    question: "Operating System mein 'Deadlock' hone ke liye kaun si char conditions jaruri hain?",
    optionA: "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait",
    optionB: "Paging, Segmentation, Swapping, Buffering",
    optionC: "Cache, RAM, ROM, Register",
    optionD: "Read, Write, Execute, Terminate",
    correctOption: "A"
  },
  {
    question: "Virtual Memory kis technique ke through implement ki jati hai?",
    optionA: "Direct Memory Access", optionB: "Paging aur Demand Paging", optionC: "RAID Configuration", optionD: "Static Partitioning",
    correctOption: "B"
  },
  {
    question: "OSI Model mein kitni layers hoti hain?",
    optionA: "4 Layers", optionB: "5 Layers", optionC: "7 Layers", optionD: "8 Layers",
    correctOption: "C"
  },
  {
    question: "TCP aur UDP protocols OSI Model ki kis layer par work karte hain?",
    optionA: "Network Layer", optionB: "Transport Layer", optionC: "Data Link Layer", optionD: "Session Layer",
    correctOption: "B"
  },
  {
    question: "IP Address (IPv4) kitne bits ka hota hai?",
    optionA: "16 bits", optionB: "32 bits (4 bytes)", optionC: "64 bits", optionD: "128 bits",
    correctOption: "B"
  },
  {
    question: "Domain Name ko IP address mein resolve karne ka kaam kaun sa protocol karta hai?",
    optionA: "HTTP", optionB: "FTP", optionC: "DNS (Domain Name System)", optionD: "DHCP",
    correctOption: "C"
  },
  {
    question: "HTTPS protocol secure communication ke liye kaun sa encryption layer use karta hai?",
    optionA: "IPSec", optionB: "SSL / TLS", optionC: "SSH only", optionD: "WEP",
    correctOption: "B"
  },
  {
    question: "CPU Scheduling mein 'Round Robin' algorithm kis concept par based hota hai?",
    optionA: "Priority basis par", optionB: "Fixed Time Quantum basis par", optionC: "Shortest Job First", optionD: "Random selection",
    correctOption: "B"
  },
  {
    question: "Computer networks mein MAC Address kis layer par physically identify karta hai?",
    optionA: "Data Link Layer", optionB: "Transport Layer", optionC: "Application Layer", optionD: "Presentation Layer",
    correctOption: "A"
  },
  {
    question: "HTTP standard response status code '404' ka kya meaning hota hai?",
    optionA: "Internal Server Error", optionB: "Resource / Page Not Found", optionC: "Unauthorized Access", optionD: "Request Successful",
    correctOption: "B"
  }
];

// ─────────────────────────────────────────────────────────────
// 2. Civil & Architecture Engineering (50 Questions)
// ─────────────────────────────────────────────────────────────
const civilQuestions = [
  {
    question: "Ordinary Portland Cement (OPC) ka initial setting time minimum kitna hona chahiye?",
    optionA: "15 minutes", optionB: "30 minutes", optionC: "60 minutes", optionD: "600 minutes",
    correctOption: "B"
  },
  {
    question: "Ordinary Portland Cement (OPC) ka final setting time maximum kitna hona chahiye?",
    optionA: "30 minutes", optionB: "120 minutes", optionC: "600 minutes (10 Hours)", optionD: "24 Hours",
    correctOption: "C"
  },
  {
    question: "Concrete ki workability measure karne ke liye field par sabse commonly kaun sa test kiya jata hai?",
    optionA: "Tensile test", optionB: "Slump Test", optionC: "Impact test", optionD: "Abrasion test",
    correctOption: "B"
  },
  {
    question: "IS 456:2000 ke according M20 grade concrete ka nominal mix ratio kya hota hai?",
    optionA: "1 : 2 : 4", optionB: "1 : 1.5 : 3", optionC: "1 : 1 : 2", optionD: "1 : 3 : 6",
    correctOption: "B"
  },
  {
    question: "Concrete mein M25 grade ka matlab kya hai?",
    optionA: "Mix ratio 25%", optionB: "28 days compressive strength 25 N/mm²", optionC: "Tensile strength 25 N/mm²", optionD: "Slump value 25 mm",
    correctOption: "B"
  },
  {
    question: "Reinforced Cement Concrete (RCC) structure mein steel reinforcement primarily kis force ko resist karne ke liye provide kiya jata hai?",
    optionA: "Compression", optionB: "Tension", optionC: "Torsion only", optionD: "Thermal expansion",
    correctOption: "B"
  },
  {
    question: "Chain Surveying mein chain length ko measure karne ke liye standard Metric Chain ki length kitni hoti hai?",
    optionA: "10m ya 15m", optionB: "20m ya 30m", optionC: "50m ya 100m", optionD: "5m ya 8m",
    correctOption: "B"
  },
  {
    question: "Levelling mein 'Bench Mark (BM)' ka kya matlab hota hai?",
    optionA: "Temporary ground point", optionB: "Known elevation (RL) ka fixed reference point", optionC: "Instrument station", optionD: "Magnetic North",
    correctOption: "B"
  },
  {
    question: "Horizontal aur Vertical dono angles ko precisely measure karne ke liye kaun sa surveying instrument use hota hai?",
    optionA: "Dumpy Level", optionB: "Theodolite / Total Station", optionC: "Prismatic Compass", optionD: "Planimeter",
    correctOption: "B"
  },
  {
    question: "Total Station instrument kin do technologies ka combination hota hai?",
    optionA: "Compass aur Chain", optionB: "Electronic Theodolite aur EDM (Electronic Distance Meter)", optionC: "Level aur Staff", optionD: "GPS aur Clinometer",
    correctOption: "B"
  },
  {
    question: "Building construction mein DPC (Damp Proof Course) kis purpose ke liye provide kiya jata hai?",
    optionA: "Structural strength badhane ke liye", optionB: "Ground moisture / nami ko walls mein upar aane se rokne ke liye", optionC: "Painting base banane ke liye", optionD: "Thermal insulation ke liye",
    correctOption: "B"
  },
  {
    question: "First class brick ki 24 hours water absorption limit uske dry weight ka kitna percent se jyada nahi honi chahiye?",
    optionA: "10%", optionB: "20%", optionC: "30%", optionD: "40%",
    correctOption: "B"
  },
  {
    question: "Soil Mechanics mein Darcy's Law kiske flow ke liye valid hota hai?",
    optionA: "Turbulent flow of water in pipe", optionB: "Laminar flow of water through saturated soil", optionC: "Air flow in soil", optionD: "Gas expansion",
    correctOption: "B"
  },
  {
    question: "Soil ka 'Liquid Limit' aur 'Plastic Limit' determine karne ke liye kaun sa index use hota hai?",
    optionA: "Atterberg Limits", optionB: "Mohs Hardness", optionC: "Specific Gravity test only", optionD: "Slump index",
    correctOption: "A"
  },
  {
    question: "Fluid Mechanics mein Continuity Equation kis conservation principle par based hoti hai?",
    optionA: "Conservation of Energy", optionB: "Conservation of Mass", optionC: "Conservation of Momentum", optionD: "Conservation of Volume",
    correctOption: "B"
  },
  {
    question: "Bernoulli's Equation kiske conservation par based hai?",
    optionA: "Mass", optionB: "Energy", optionC: "Linear Momentum", optionD: "Angular Momentum",
    correctOption: "B"
  },
  {
    question: "Simply supported beam par center par point load 'W' lagne par maximum bending moment kitna hota hai?",
    optionA: "WL / 2", optionB: "WL / 4", optionC: "WL / 8", optionD: "WL / 12",
    correctOption: "B"
  },
  {
    question: "Uniformly Distributed Load (UDL) 'w' per unit length wale simply supported beam mein maximum bending moment kitna hota hai?",
    optionA: "wL² / 4", optionB: "wL² / 8", optionC: "wL / 2", optionD: "wL³ / 12",
    correctOption: "B"
  },
  {
    question: "Hydraulic jump open channel flow mein kis condition mein occur hota hai?",
    optionA: "Subcritical se Supercritical flow mein", optionB: "Supercritical se Subcritical flow mein", optionC: "Laminar se Turbulent flow mein", optionD: "Constant depth flow mein",
    correctOption: "B"
  },
  {
    question: "Soil ki Bearing Capacity badhane ke liye kaun sa method use kiya jata hai?",
    optionA: "Compaction aur Grouting", optionB: "Water content badhana", optionC: "Excavation depth kam karna", optionD: "Soil ko loose karna",
    correctOption: "A"
  },
  {
    question: "Architecture mein 'Scale' ka kya significance hota hai?",
    optionA: "Building ka color", optionB: "Actual dimensions aur drawing dimensions ke beech ka proportional ratio", optionC: "Brick ki quality", optionD: "Cost estimation",
    correctOption: "B"
  },
  {
    question: "AutoCAD mein 2D drawing mein orthogonal (straight 90 degree) lines draw karne ke liye kaun sa mode on kiya jata hai?",
    optionA: "OSNAP (F3)", optionB: "ORTHO (F8)", optionC: "GRID (F7)", optionD: "POLAR (F10)",
    correctOption: "B"
  },
  {
    question: "Building mein FAR (Floor Area Ratio) ka formula kya hota hai?",
    optionA: "Total Plot Area / Total Covered Area", optionB: "Total Built-up (Covered) Floor Area / Total Plot Area", optionC: "Carpet Area / Plinth Area", optionD: "Wall Area / Room Area",
    correctOption: "B"
  },
  {
    question: "Plinth Area aur Carpet Area ke beech kya relation hota hai?",
    optionA: "Carpet Area hamesha Plinth Area se chhota hota hai (excluding wall thickness)", optionB: "Carpet Area hamesha bada hota hai", optionC: "Dono barabar hote hain", optionD: "Carpet Area plot area ke barabar hota hai",
    correctOption: "A"
  },
  {
    question: "IS 456:2000 ke according RCC slab ke liye minimum clear cover kitna specify kiya gaya hai?",
    optionA: "15 mm ya 20 mm", optionB: "40 mm", optionC: "50 mm", optionD: "75 mm",
    correctOption: "A"
  },
  {
    question: "RCC Column ke liye minimum clear cover kitna hota hai?",
    optionA: "20 mm", optionB: "40 mm", optionC: "15 mm", optionD: "75 mm",
    correctOption: "B"
  },
  {
    question: "Water-Cement ratio badhane se concrete ki strength par kya prabhav padta hai?",
    optionA: "Strength badh jati hai", optionB: "Strength decrease (kam) ho jati hai", optionC: "Strength unchanged rehti hai", optionD: "Durability double ho jati hai",
    correctOption: "B"
  },
  {
    question: "Building construction mein 'Lintel' kahan provide kiya jata hai?",
    optionA: "Foundation ke niche", optionB: "Door aur Window openings ke upar load support karne ke liye", optionC: "Roof slab ke upar", optionD: "Parapet wall par",
    correctOption: "B"
  },
  {
    question: "Surveying mein 'Contour Line' kya represent karti hai?",
    optionA: "Same pressure wale points", optionB: "Ground par equal elevation (height) wale points ko join karne wali imaginary line", optionC: "Same temperature points", optionD: "Road boundary lines",
    correctOption: "B"
  },
  {
    question: "Compass surveying mein Local Attraction kis wajah se hota hai?",
    optionA: "Magnetic needle ki defect", optionB: "Nearby magnetic bodies jaise steel structures, iron ore, electric cables", optionC: "Sun rays", optionD: "Wind speed",
    correctOption: "B"
  },
  {
    question: "Hooke's Law kis limit tak valid hota hai?",
    optionA: "Plastic Limit", optionB: "Proportional Limit (Elastic Limit)", optionC: "Ultimate Strength Point", optionD: "Breaking Point",
    correctOption: "B"
  },
  {
    question: "Modulus of Elasticity (Young's Modulus 'E') kiska ratio hota hai?",
    optionA: "Stress to Strain", optionB: "Shear Stress to Shear Strain", optionC: "Direct Stress to Volumetric Strain", optionD: "Lateral Strain to Longitudinal Strain",
    correctOption: "A"
  },
  {
    question: "Poisson's Ratio kiska ratio hota hai?",
    optionA: "Lateral Strain to Longitudinal Strain", optionB: "Longitudinal Strain to Lateral Strain", optionC: "Stress to Strain", optionD: "Shear Strain to Normal Strain",
    correctOption: "A"
  },
  {
    question: "Cantilever beam jisme free end par point load 'W' ho, usme maximum deflection kahan hota hai?",
    optionA: "Fixed support par", optionB: "Free end par", optionC: "Mid-span par", optionD: "Span ke one-third par",
    correctOption: "B"
  },
  {
    question: "Steel structure mein tension members ko connect karne ke liye standard fasteners kaun se hain?",
    optionA: "Rivets, Bolts aur Welds", optionB: "Cement paste", optionC: "Timber pins", optionD: "Nails only",
    correctOption: "A"
  },
  {
    question: "Road pavement mein 'Camber' kiske liye provide kiya jata hai?",
    optionA: "Fast speed ke liye", optionB: "Rainwater ko road surface se effectively drain out karne ke liye", optionC: "Vehicle overtaking ke liye", optionD: "Road aesthetic look ke liye",
    correctOption: "B"
  },
  {
    question: "Highway engineering mein 'Super-elevation' kis force ko counter-balance karne ke liye curve par diya jata hai?",
    optionA: "Centripetal Force", optionB: "Centrifugal Force", optionC: "Frictional Force only", optionD: "Gravitational Force only",
    correctOption: "B"
  },
  {
    question: "Public health engineering mein drinking water ka standard pH range kitna hona chahiye?",
    optionA: "4.5 se 5.5", optionB: "6.5 se 8.5", optionC: "9.0 se 11.0", optionD: "1.0 se 3.0",
    correctOption: "B"
  },
  {
    question: "Water treatment plant mein disinfection ke liye commonly kaun sa chemical add kiya jata hai?",
    optionA: "Alum", optionB: "Chlorine", optionC: "Lime", optionD: "Copper Sulphate",
    correctOption: "B"
  },
  {
    question: "BOD (Biochemical Oxygen Demand) test wastewater ki kis quality ko measure karta hai?",
    optionA: "Inorganic minerals", optionB: "Organic matter pollution load", optionC: "Total Dissolved Solids (TDS)", optionD: "Turbidity",
    correctOption: "B"
  },
  {
    question: "RCC Beam mein Shear Reinforcement kis form mein provide kiya jata hai?",
    optionA: "Vertical Stirrups aur Bent-up bars", optionB: "Longitudinal main bars", optionC: "Cover blocks only", optionD: "Plaster layer",
    correctOption: "A"
  },
  {
    question: "Soil compaction ka primary objective kya hota hai?",
    optionA: "Void ratio kam karke dry density aur shear strength badhana", optionB: "Moisture content maximum karna", optionC: "Soil volume badhana", optionD: "Permeability badhana",
    correctOption: "A"
  },
  {
    question: "Venturimeter kiska flow rate (discharge) measure karne ke liye use hota hai?",
    optionA: "Open Channel", optionB: "Closed Pipe", optionC: "River surface", optionD: "Air atmosphere",
    correctOption: "B"
  },
  {
    question: "Hydraulic structures jaise dams mein 'Spillway' ka kya function hota hai?",
    optionA: "Water store karna", optionB: "Excess flood water ko safely release karna", optionC: "Turbine chalana", optionD: "Silt collect karna",
    correctOption: "B"
  },
  {
    question: "Timber ko fungal attack aur decay se protect karne ke liye kaun sa treatment kiya jata hai?",
    optionA: "Seasoning aur Creosoting / Preservative coating", optionB: "Water immersion", optionC: "Heating in oven", optionD: "Plastering",
    correctOption: "A"
  },
  {
    question: "Foundation jo pure building area ke niche ek continuous RCC slab ke roop mein banti hai, use kya kehte hain?",
    optionA: "Isolated Footing", optionB: "Raft / Mat Foundation", optionC: "Combined Footing", optionD: "Strap Footing",
    correctOption: "B"
  },
  {
    question: "Deep Foundation ka sabse standard example kaun sa hai?",
    optionA: "Spread Footing", optionB: "Pile Foundation / Well Foundation", optionC: "Strip Footing", optionD: "Pad Footing",
    correctOption: "B"
  },
  {
    question: "Architecture drawing mein 'Elevation' view kya dikhata hai?",
    optionA: "Top-down floor plan", optionB: "Building ka vertical external view (Front, Rear, Side)", optionC: "Internal sectional cut", optionD: "Electrical single line diagram",
    correctOption: "B"
  },
  {
    question: "IS Code standard mein Plain aur Reinforced Concrete ke liye kaun sa code use hota hai?",
    optionA: "IS 800", optionB: "IS 456", optionC: "IS 875", optionD: "IS 1893",
    correctOption: "B"
  },
  {
    question: "Steel Structures design ke liye kaun sa Indian Standard Code follow kiya jata hai?",
    optionA: "IS 456:2000", optionB: "IS 800:2007", optionC: "IS 1343", optionD: "IS 383",
    correctOption: "B"
  }
];

// ─────────────────────────────────────────────────────────────
// 3. Electrical Engineering (50 Questions)
// ─────────────────────────────────────────────────────────────
const electricalQuestions = [
  {
    question: "Ohm's Law ke according linear conductor mein current (I) kiske directly proportional hota hai?",
    optionA: "Resistance (R)", optionB: "Potential Difference (V)", optionC: "Inductance (L)", optionD: "Capacitance (C)",
    correctOption: "B"
  },
  {
    question: "Kirchhoff's Current Law (KCL) kis conservation principle par based hai?",
    optionA: "Conservation of Energy", optionB: "Conservation of Charge", optionC: "Conservation of Momentum", optionD: "Conservation of Magnetic Flux",
    correctOption: "B"
  },
  {
    question: "Kirchhoff's Voltage Law (KVL) kis conservation principle par based hai?",
    optionA: "Conservation of Charge", optionB: "Conservation of Energy", optionC: "Conservation of Mass", optionD: "Conservation of Power",
    correctOption: "B"
  },
  {
    question: "Transformer kis basic electromagnetic principle par work karta hai?",
    optionA: "Self Induction only", optionB: "Mutual Induction (Faraday's Law)", optionC: "Coulomb's Law", optionD: "Gauss Law",
    correctOption: "B"
  },
  {
    question: "Transformer DC supply par kaam kyu nahi karta?",
    optionA: "Voltage bohot high ho jata hai", optionB: "DC mein rate of change of flux zero hota hai aur primary winding burn ho sakti hai", optionC: "Current flow nahi hota", optionD: "Frequency bohot high hoti hai",
    correctOption: "B"
  },
  {
    question: "Ideal transformer mein efficiency kitni mani jati hai?",
    optionA: "50%", optionB: "80%", optionC: "100%", optionD: "90%",
    correctOption: "C"
  },
  {
    question: "Transformer core mein Eddy Current Losses ko kam karne ke liye core ko kaisa banaya jata hai?",
    optionA: "Solid solid block", optionB: "Laminated silicon steel sheets", optionC: "Copper block", optionD: "Aluminum coating",
    correctOption: "B"
  },
  {
    question: "AC circuit mein Power Factor kiska ratio hota hai?",
    optionA: "True Power (kW) to Apparent Power (kVA)", optionB: "Reactive Power (kVAR) to True Power (kW)", optionC: "Voltage to Current", optionD: "Resistance to Conductance",
    correctOption: "A"
  },
  {
    question: "Pure Inductive circuit mein current voltage se kitna angle lag karta hai?",
    optionA: "0 degree", optionB: "45 degree", optionC: "90 degree", optionD: "180 degree",
    correctOption: "C"
  },
  {
    question: "Pure Capacitive circuit mein current voltage se kitna angle lead karta hai?",
    optionA: "0 degree", optionB: "90 degree", optionC: "180 degree", optionD: "45 degree",
    correctOption: "B"
  },
  {
    question: "3-Phase balanced star connection mein Line Voltage (VL) aur Phase Voltage (Vph) mein kya relation hota hai?",
    optionA: "VL = Vph", optionB: "VL = √3 * Vph", optionC: "VL = Vph / √3", optionD: "VL = 3 * Vph",
    correctOption: "B"
  },
  {
    question: "3-Phase balanced delta connection mein Line Current (IL) aur Phase Current (Iph) mein kya relation hota hai?",
    optionA: "IL = Iph", optionB: "IL = √3 * Iph", optionC: "IL = Iph / √3", optionD: "IL = 3 * Iph",
    correctOption: "B"
  },
  {
    question: "3-Phase Induction Motor ki Synchronous Speed (Ns) ka formula kya hai?",
    optionA: "Ns = 120 f / P", optionB: "Ns = 120 P / f", optionC: "Ns = 60 f / P", optionD: "Ns = f * P / 120",
    correctOption: "A"
  },
  {
    question: "Induction Motor mein 'Slip (s)' ka formula kya hota hai?",
    optionA: "(Ns - Nr) / Ns", optionB: "(Nr - Ns) / Nr", optionC: "Ns / Nr", optionD: "Nr / Ns",
    correctOption: "A"
  },
  {
    question: "DC Motor mein torque kiske directly proportional hota hai?",
    optionA: "Flux (Φ) aur Armature Current (Ia)", optionB: "Voltage only", optionC: "Speed only", optionD: "Resistance only",
    correctOption: "A"
  },
  {
    question: "DC Series Motor ko bina kisi load ke (No-load) start kyu nahi karna chahiye?",
    optionA: "Motor start nahi hogi", optionB: "Speed dangerously high ho jayegi aur motor damage ho sakti hai", optionC: "Current zero ho jayega", optionD: "Fuse blow nahi hoga",
    correctOption: "B"
  },
  {
    question: "High starting torque required applications (jaise electric cranes aur traction/locomotives) mein kaun si motor use hoti hai?",
    optionA: "DC Shunt Motor", optionB: "DC Series Motor", optionC: "Synchronous Motor", optionD: "Single phase capacitor run motor",
    correctOption: "B"
  },
  {
    question: "Synchronous Motor kis unique characteristic ke liye jani jati hai?",
    optionA: "Variable speed", optionB: "Constant synchronous speed par run karti hai aur power factor control kar sakti hai", optionC: "Self-starting hoti hai", optionD: "Zero torque deti hai",
    correctOption: "B"
  },
  {
    question: "Thermal Power Plant mein chemical energy ko steam energy mein convert karne ka kaam kaun sa equipment karta hai?",
    optionA: "Condenser", optionB: "Boiler", optionC: "Turbine", optionD: "Generator",
    correctOption: "B"
  },
  {
    question: "Transmission lines mein 'Skin Effect' ka kya matlab hota hai?",
    optionA: "Current ka conductor ke cross-section mein evenly flow hona", optionB: "AC current ka conductor ki outer surface (skin) par concentrate hona", optionC: "Insulation ka crack hona", optionD: "Corona discharge hona",
    correctOption: "B"
  },
  {
    question: "Long high voltage transmission lines mein light load par receiving end voltage sending end voltage se jyada ho jana kya kehlata hai?",
    optionA: "Skin Effect", optionB: "Ferranti Effect", optionC: "Proximity Effect", optionD: "Hall Effect",
    correctOption: "B"
  },
  {
    question: "Transmission line conductors ke aas-pass violet glow, hissing sound aur ozone gas generation kis phenomenon ke karan hota hai?",
    optionA: "Corona Effect", optionB: "Skin Effect", optionC: "Surge Impedance", optionD: "Pinch Effect",
    correctOption: "A"
  },
  {
    question: "Electrical safety mein 'Earthing' ka primary objective kya hota hai?",
    optionA: "Voltage badhana", optionB: "Human life ko electric shock se protect karna aur fault current ko earth mein safely bypass karna", optionC: "Power save karna", optionD: "Motor speed badhana",
    correctOption: "B"
  },
  {
    question: "MCB ka full form kya hota hai?",
    optionA: "Main Circuit Box", optionB: "Miniature Circuit Breaker", optionC: "Micro Control Board", optionD: "Multiple Current Bridge",
    correctOption: "B"
  },
  {
    question: "Electric energy (Ghar ke meter mein) kis unit mein measure ki jati hai?",
    optionA: "Watt (W)", optionB: "Kilowatt-hour (kWh ya Unit)", optionC: "Ampere-hour (Ah)", optionD: "Volt-Ampere (VA)",
    correctOption: "B"
  },
  {
    question: "Semiconductor device jo AC ko DC mein convert karta hai, use kya kehte hain?",
    optionA: "Inverter", optionB: "Rectifier", optionC: "Amplifier", optionD: "Chopper",
    correctOption: "B"
  },
  {
    question: "DC power ko AC power mein convert karne wale device ko kya kehte hain?",
    optionA: "Rectifier", optionB: "Inverter", optionC: "Transformer", optionD: "Converter only",
    correctOption: "B"
  },
  {
    question: "Bridge Rectifier mein minimum kitne diodes use hote hain?",
    optionA: "1", optionB: "2", optionC: "4", optionD: "6",
    correctOption: "C"
  },
  {
    question: "Electrical circuits mein Inductance ki standard SI unit kya hoti hai?",
    optionA: "Farad", optionB: "Henry (H)", optionC: "Ohm", optionD: "Tesla",
    correctOption: "B"
  },
  {
    question: "Capacitance ki standard SI unit kya hoti hai?",
    optionA: "Henry", optionB: "Farad (F)", optionC: "Coulomb", optionD: "Weber",
    correctOption: "B"
  },
  {
    question: "Magnetic Flux ki SI unit kya hoti hai?",
    optionA: "Tesla", optionB: "Weber (Wb)", optionC: "Henry", optionD: "Ampere-turn",
    correctOption: "B"
  },
  {
    question: "Magnetic Flux Density (B) ki SI unit kya hoti hai?",
    optionA: "Weber", optionB: "Tesla (Wb/m²)", optionC: "Henry/m", optionD: "Gauss only",
    correctOption: "B"
  },
  {
    question: "DC generator mein Fleming's Right Hand Rule kiski direction find karne ke liye use hota hai?",
    optionA: "Magnetic field", optionB: "Induced EMF / Induced Current", optionC: "Conductor motion", optionD: "Torque",
    correctOption: "B"
  },
  {
    question: "DC Motor mein Fleming's Left Hand Rule kiski direction identify karta hai?",
    optionA: "Force / Motion on conductor", optionB: "Current", optionC: "Magnetic Field", optionD: "Back EMF",
    correctOption: "A"
  },
  {
    question: "Ammeter ko circuit mein hamesha kis order mein connect kiya jata hai?",
    optionA: "Parallel mein", optionB: "Series mein", optionC: "Bridge mein", optionD: "Star connection mein",
    correctOption: "B"
  },
  {
    question: "Voltmeter ko circuit mein hamesha kis order mein connect kiya jata hai?",
    optionA: "Series mein", optionB: "Parallel (Across components) mein", optionC: "Neutral ke sath series mein", optionD: "Ground line mein",
    correctOption: "B"
  },
  {
    question: "Ek ideal ammeter ka internal resistance kitna hona chahiye?",
    optionA: "Infinity", optionB: "Zero", optionC: "100 Ohm", optionD: "1 Mega Ohm",
    correctOption: "B"
  },
  {
    question: "Ek ideal voltmeter ka internal resistance kitna hona chahiye?",
    optionA: "Zero", optionB: "Infinite (Bohat High)", optionC: "1 Ohm", optionD: "100 Ohm",
    correctOption: "B"
  },
  {
    question: "Megger instrument ka use primarily kya measure karne ke liye kiya jata hai?",
    optionA: "Low resistance", optionB: "High Insulation Resistance", optionC: "Voltage fluctuation", optionD: "Frequency",
    correctOption: "B"
  },
  {
    question: "Series RLC circuit mein Resonance condition par impedance (Z) kitna hota hai?",
    optionA: "Maximum", optionB: "Minimum (Z = R)", optionC: "Zero", optionD: "Infinity",
    correctOption: "B"
  },
  {
    question: "Resonance par Series RLC circuit ka Power Factor kitna hota hai?",
    optionA: "Zero", optionB: "0.5 Lagging", optionC: "Unity (1.0)", optionD: "0.8 Leading",
    correctOption: "C"
  },
  {
    question: "India mein standard AC domestic electricity supply ki frequency kitni hoti hai?",
    optionA: "60 Hz", optionB: "50 Hz", optionC: "100 Hz", optionD: "120 Hz",
    correctOption: "B"
  },
  {
    question: "Buchholz Relay transformer mein kahan aur kiske liye install ki jati hai?",
    optionA: "Tank aur Conservator ke beech, internal incipient faults detect karne ke liye", optionB: "Breather ke andar", optionC: "Bushing ke upar", optionD: "Cooling tubes mein",
    correctOption: "A"
  },
  {
    question: "Transformer breather mein moisture absorb karne ke liye kaun sa material bhara hota hai?",
    optionA: "Charcoal", optionB: "Silica Gel", optionC: "Calcium Carbonate", optionD: "Sand",
    correctOption: "B"
  },
  {
    question: "Dry (fresh) Silica Gel ka color normal condition mein kaisa hota hai?",
    optionA: "Deep Blue", optionB: "Pale Pink", optionC: "White", optionD: "Black",
    correctOption: "A"
  },
  {
    question: "Silicon controlled Rectifier (SCR) mein kitne terminals hote hain?",
    optionA: "2 (Anode, Cathode)", optionB: "3 (Anode, Cathode, Gate)", optionC: "4", optionD: "1",
    correctOption: "B"
  },
  {
    question: "Overhead lines mein ACSR conductors ka use hota hai. ACSR ka full form kya hai?",
    optionA: "All Copper Steel Reinforced", optionB: "Aluminum Conductor Steel Reinforced", optionC: "Aluminum Cable System Radio", optionD: "Alloy Conductor Standard Rating",
    correctOption: "B"
  },
  {
    question: "Power System mein 'Busbar' kya hota hai?",
    optionA: "Ek heavy copper ya aluminum rod jo multiple circuits ko common point par connect karti hai", optionB: "Insulator pipe", optionC: "Lightning arrester", optionD: "Current transformer",
    correctOption: "A"
  },
  {
    question: "High voltage protection ke liye sub-stations par 'Lightning Arrester' kahan lagaya jata hai?",
    optionA: "Substation ke entry par incoming lines ke parallel", optionB: "Control room ke andar", optionC: "Battery room mein", optionD: "Generator shaft par",
    correctOption: "A"
  },
  {
    question: "Solar Photovoltaic (PV) cell kis effect par light energy ko directly electricity mein convert karta hai?",
    optionA: "Thermoelectric Effect", optionB: "Photovoltaic Effect", optionC: "Seebeck Effect", optionD: "Piezoelectric Effect",
    correctOption: "B"
  }
];

// ─────────────────────────────────────────────────────────────
// 4. Mechanical Engineering (50 Questions)
// ─────────────────────────────────────────────────────────────
const mechanicalQuestions = [
  {
    question: "First Law of Thermodynamics kis fundamental principle par based hai?",
    optionA: "Conservation of Momentum", optionB: "Conservation of Energy", optionC: "Conservation of Mass", optionD: "Entropy Principle",
    correctOption: "B"
  },
  {
    question: "Second Law of Thermodynamics kis concept ko introduce karta hai?",
    optionA: "Enthalpy", optionB: "Entropy (Disorder of system)", optionC: "Internal Energy", optionD: "Pressure",
    correctOption: "B"
  },
  {
    question: "Petrol Engine (Spark Ignition Engine) kis thermodynamic cycle par work karta hai?",
    optionA: "Diesel Cycle", optionB: "Otto Cycle (Constant Volume Cycle)", optionC: "Carnot Cycle", optionD: "Rankine Cycle",
    correctOption: "B"
  },
  {
    question: "Diesel Engine (Compression Ignition Engine) kis cycle par work karta hai?",
    optionA: "Otto Cycle", optionB: "Diesel Cycle (Constant Pressure Heat Addition)", optionC: "Stirling Cycle", optionD: "Brayton Cycle",
    correctOption: "B"
  },
  {
    question: "Gas Turbine power plants kis thermodynamic cycle par work karte hain?",
    optionA: "Rankine Cycle", optionB: "Brayton Cycle (Joule Cycle)", optionC: "Carnot Cycle", optionD: "Dual Cycle",
    correctOption: "B"
  },
  {
    question: "Steam Power Plants mein working fluid steam kis cycle par circulate hoti hai?",
    optionA: "Otto Cycle", optionB: "Rankine Cycle", optionC: "Brayton Cycle", optionD: "Diesel Cycle",
    correctOption: "B"
  },
  {
    question: "Carnot Engine ki theoretical efficiency hamesha kiske temperatures par depend karti hai?",
    optionA: "Source (T1) aur Sink (T2) ke absolute temperatures par", optionB: "Working fluid ke volume par", optionC: "Engine ke weight par", optionD: "Piston speed par",
    correctOption: "A"
  },
  {
    question: "IC Engine mein 'Knocking / Detonation' kiske karan hoti hai?",
    optionA: "Air filter block hona", optionB: "End gas ka uncontrolled spontaneous auto-ignition hona", optionC: "Exhaust valve khula rehna", optionD: "Oil leakage",
    correctOption: "B"
  },
  {
    question: "Petrol fuel ki anti-knocking quality measure karne ke liye kaun sa rating number use hota hai?",
    optionA: "Cetane Number", optionB: "Octane Number", optionC: "Viscosity Index", optionD: "API Gravity",
    correctOption: "B"
  },
  {
    question: "Diesel fuel ki ignition quality measure karne ke liye kaun sa number use hota hai?",
    optionA: "Octane Number", optionB: "Cetane Number", optionC: "Flash Point", optionD: "Fire Point",
    correctOption: "B"
  },
  {
    question: "Four-stroke engine mein crankshaft ke do complete revolutions (720°) mein kitne power strokes milte hain?",
    optionA: "1 Power stroke", optionB: "2 Power strokes", optionC: "4 Power strokes", optionD: "Half stroke",
    correctOption: "A"
  },
  {
    question: "Workshop mein 'Lathe Machine' par cylindrical workpiece par threads katne ke liye kaun sa mechanism engage kiya jata hai?",
    optionA: "Rack and Pinion", optionB: "Lead Screw aur Half-Nut Mechanism", optionC: "Tailstock Clamp", optionD: "Cross slide lock",
    correctOption: "B"
  },
  {
    question: "Milling machine par gears cut karne ke liye kaun sa indexing attachment use hota hai?",
    optionA: "Dividing Head (Indexing Head)", optionB: "Vice clamp", optionC: "Collet Chuck", optionD: "Mandrel only",
    correctOption: "A"
  },
  {
    question: "Shaper machine mein cutting operation kis stroke mein hota hai?",
    optionA: "Return stroke mein", optionB: "Forward stroke mein", optionC: "Dono strokes mein", optionD: "Idle stroke mein",
    correctOption: "B"
  },
  {
    question: "Shaper aur Planer machine mein non-cutting return stroke ko tez karne ke liye kaun sa mechanism use hota hai?",
    optionA: "Geneva Mechanism", optionB: "Quick Return Mechanism (Whitworth / Crank & Slotted Lever)", optionC: "Differential Gear", optionD: "Cam Follower",
    correctOption: "B"
  },
  {
    question: "Grinding wheel ki specific composition mein bonding material aur abrasives ko clean/sharpen karne ki process kya kehlati hai?",
    optionA: "Turning", optionB: "Dressing and Truing", optionC: "Polishing", optionD: "Buffing",
    correctOption: "B"
  },
  {
    question: "Welding mein Arc generate karne ke liye electrode aur workpiece ke beech kya required hota hai?",
    optionA: "High Voltage low current", optionB: "High Current aur Low Voltage AC/DC supply", optionC: "Zero current", optionD: "High Pressure air",
    correctOption: "B"
  },
  {
    question: "TIG Welding ka full form kya hai?",
    optionA: "Total Iron Gas Welding", optionB: "Tungsten Inert Gas Welding", optionC: "Thermal Induction Gas Welding", optionD: "Titanium Inert Gas Welding",
    correctOption: "B"
  },
  {
    question: "MIG Welding ka full form kya hai?",
    optionA: "Metal Inert Gas Welding", optionB: "Manual Iron Gas Welding", optionC: "Mechanical Induction Gas Welding", optionD: "Modular Inert Gas Welding",
    correctOption: "A"
  },
  {
    question: "Cast Iron ko machine karte waqt chips kis form mein bante hain?",
    optionA: "Continuous long ribbon chips", optionB: "Discontinuous (chote-chote) brittle chips", optionC: "Continuous with built-up edge", optionD: "Dust powder only",
    correctOption: "B"
  },
  {
    question: "Fluid Mechanics mein Fluid ki dynamic viscosity ki SI unit kya hoti hai?",
    optionA: "Poise", optionB: "Pascal-second (Pa·s ya N·s/m²)", optionC: "m²/s (Stokes)", optionD: "N/m",
    correctOption: "B"
  },
  {
    question: "Kinematic viscosity ki SI unit kya hoti hai?",
    optionA: "Pa·s", optionB: "m²/s", optionC: "N/m²", optionD: "kg/m³",
    correctOption: "B"
  },
  {
    question: "Pipe flow mein Laminar aur Turbulent flow ko differentiate karne ke liye kaun sa dimensionless number use hota hai?",
    optionA: "Mach Number", optionB: "Reynolds Number (Re)", optionC: "Froude Number", optionD: "Prandtl Number",
    correctOption: "B"
  },
  {
    question: "Circular pipe flow ke liye Laminar flow ki upper limit Reynolds Number kitna hota hai?",
    optionA: "Re < 500", optionB: "Re < 2000", optionC: "Re > 4000", optionD: "Re = 10000",
    correctOption: "B"
  },
  {
    question: "Mach Number (M) kiska ratio hota hai?",
    optionA: "Object ki speed to Speed of sound in the medium", optionB: "Inertia force to Viscous force", optionC: "Pressure force to Gravity force", optionD: "Viscous force to Surface tension",
    correctOption: "A"
  },
  {
    question: "Jab flow speed sound ki speed se jyada (M > 1) ho jaye, to use kya kehte hain?",
    optionA: "Subsonic flow", optionB: "Supersonic flow", optionC: "Sonic flow", optionD: "Hypersonic flow (M > 5)",
    correctOption: "B"
  },
  {
    question: "Pascal's Law hydraulic lifts aur hydraulic brakes mein kis principle par apply hota hai?",
    optionA: "Enclosed fluid par lagaya gaya external pressure sabhi directions mein equally transmit hota hai", optionB: "Pressure volume ke inversely proportional hai", optionC: "Fluid hamesha accelerate karta hai", optionD: "Viscosity zero ho jati hai",
    correctOption: "A"
  },
  {
    question: "Strength of Materials mein 'Stress' ki SI unit kya hoti hai?",
    optionA: "Joule (J)", optionB: "Pascal (N/m²)", optionC: "Newton (N)", optionD: "Watt (W)",
    correctOption: "B"
  },
  {
    question: "Ductile material (jaise Mild Steel) ke Tensile Test mein fracture kis angle par cup-and-cone shape mein hota hai?",
    optionA: "90° to axis", optionB: "45° (Maximum Shear Stress plane par)", optionC: "0°", optionD: "30°",
    correctOption: "B"
  },
  {
    question: "Brittle material (jaise Cast Iron) tension test mein kis plane par fail hota hai?",
    optionA: "45° shear plane", optionB: "90° flat normal cross-section plane par", optionC: "Cup and Cone shape mein", optionD: "Bending plane mein",
    correctOption: "B"
  },
  {
    question: "Solid circular shaft ke Torsion formula mein Polar Moment of Inertia (J) kitna hota hai?",
    optionA: "π d⁴ / 64", optionB: "π d⁴ / 32", optionC: "π d³ / 16", optionD: "π d² / 4",
    correctOption: "B"
  },
  {
    question: "Euler's Column Theory ke according Column ki Buckling Load (Pcr) kis par depend karti hai?",
    optionA: "π² E I / (Le)²", optionB: "E I / L", optionC: "2 π E L", optionD: "E / I",
    correctOption: "A"
  },
  {
    question: "Involute Gear profile mein do mating gears ke beech Contact line kahan se pass hoti hai?",
    optionA: "Pitch point se through Line of Action (Pressure angle path)", optionB: "Root circle se", optionC: "Addendum circle se", optionD: "Shaft center se",
    correctOption: "A"
  },
  {
    question: "Gears mein 'Module (m)' ka formula kya hota hai?",
    optionA: "Pitch Diameter (D) / Number of Teeth (T)", optionB: "Number of Teeth (T) / Pitch Diameter (D)", optionC: "π * D", optionD: "Circular Pitch * T",
    correctOption: "A"
  },
  {
    question: "Flywheel ka primary function engine mein kya hota hai?",
    optionA: "Engine speed ko long term govern karna", optionB: "Cyclic energy fluctuations ko absorb/release karke speed fluctuations ko control karna", optionC: "Fuel pump karna", optionD: "Exhaust cool karna",
    correctOption: "B"
  },
  {
    question: "Governor ka primary function engine mein kya hota hai?",
    optionA: "Engine par load change hone par mean speed ko fuel supply adjust karke maintain karna", optionB: "Vibrations absorb karna", optionC: "Lubrication provide karna", optionD: "Torque double karna",
    correctOption: "A"
  },
  {
    question: "Heat Transfer ke teen primary modes kaun se hain?",
    optionA: "Conduction, Convection, Radiation", optionB: "Evaporation, Condensation, Fusion", optionC: "Friction, Compression, Expansion", optionD: "Enthalpy, Entropy, Exergy",
    correctOption: "A"
  },
  {
    question: "Fourier's Law of Heat Conduction kiske proportional heat flow rate define karta hai?",
    optionA: "Temperature Gradient (dT/dx) aur Area (A)", optionB: "Volume only", optionC: "Specific heat only", optionD: "Pressure gradient",
    correctOption: "A"
  },
  {
    question: "Stefan-Boltzmann Law ke according Blackbody se radiated heat energy kiske directly proportional hoti hai?",
    optionA: "T (Absolute Temperature)", optionB: "T²", optionC: "T⁴ (Fourth power of absolute temperature)", optionD: "T³",
    correctOption: "C"
  },
  {
    question: "Domestic Refrigerator kis refrigeration cycle par work karta hai?",
    optionA: "Vapour Absorption System", optionB: "Vapour Compression Refrigeration System (VCRS)", optionC: "Air Refrigeration (Bell-Coleman)", optionD: "Steam Jet Refrigeration",
    correctOption: "B"
  },
  {
    question: "Refrigeration system mein COP ka full form kya hota hai?",
    optionA: "Capacity of Plant", optionB: "Coefficient of Performance", optionC: "Compression Operating Pressure", optionD: "Cooling Output Power",
    correctOption: "B"
  },
  {
    question: "1 Ton of Refrigeration (1 TR) kiske equivalent heat extraction rate hota hai?",
    optionA: "1 kW", optionB: "3.5 kW (ya 210 kJ/min / 50 kcal/min)", optionC: "5.0 kW", optionD: "10 kW",
    correctOption: "B"
  },
  {
    question: "VCRS system mein Throttle Valve / Expansion Valve ke across kaun sa property constant rehti hai?",
    optionA: "Entropy", optionB: "Enthalpy (Isenthalpic process)", optionC: "Pressure", optionD: "Temperature",
    correctOption: "B"
  },
  {
    question: "Centrifugal Pump mein kinetic energy ko pressure energy mein convert karne ka kaam kaun karta hai?",
    optionA: "Impeller", optionB: "Volute Casing aur Diffuser", optionC: "Foot Valve", optionD: "Suction Pipe",
    correctOption: "B"
  },
  {
    question: "Pelton Wheel Turbine kis type ki hydraulic turbine hai?",
    optionA: "High Head, Low Discharge Tangential Impulse Turbine", optionB: "Low Head, High Discharge Reaction Turbine", optionC: "Medium Head Francis Turbine", optionD: "Axial Flow Turbine",
    correctOption: "A"
  },
  {
    question: "Kaplan Turbine kis type ki turbine hai?",
    optionA: "High Head Impulse", optionB: "Low Head, High Discharge Axial Flow Reaction Turbine", optionC: "Radial Impulse Turbine", optionD: "Mixed flow turbine",
    correctOption: "B"
  },
  {
    question: "Metal Casting mein Pattern par 'Draft Allowance' kyu diya jata hai?",
    optionA: "Shrinkage compensate karne ke liye", optionB: "Pattern ko sand mould se bina damage kiye easily nikalne ke liye", optionC: "Machining allowance ke liye", optionD: "Weight kam karne ke liye",
    correctOption: "B"
  },
  {
    question: "Casting mein molten metal solidifying ke dauran shrink hone par shrinkage cavity se bachane ke liye kya provide kiya jata hai?",
    optionA: "Gate", optionB: "Riser (Feeder)", optionC: "Runner", optionD: "Sprue only",
    correctOption: "B"
  },
  {
    question: "Steel mein Carbon percentage badhane par steel ki hardness aur tensile strength par kya asar hota hai?",
    optionA: "Hardness aur Tensile Strength badh jati hai jabki Ductility kam hoti hai", optionB: "Steel soft ho jata hai", optionC: "Corrosion resistance khatam ho jati hai", optionD: "Weight 50% kam ho jata hai",
    correctOption: "A"
  },
  {
    question: "Heat treatment process 'Annealing' ka primary purpose kya hota hai?",
    optionA: "Hardness extreme badhana", optionB: "Internal stresses relieve karna, grain structure refine karna aur ductility badhana", optionC: "Surface oxidize karna", optionD: "Melting point reduce karna",
    correctOption: "B"
  }
];

// ─────────────────────────────────────────────────────────────
// 5. Electronics Engineering (50 Questions)
// ─────────────────────────────────────────────────────────────
const electronicsQuestions = [
  {
    question: "Intrinsic (Pure) Semiconductor mein charge carriers kaun se hote hain?",
    optionA: "Sirf Electrons", optionB: "Sirf Holes", optionC: "Equal number of Electrons aur Holes", optionD: "Positive Ions",
    correctOption: "C"
  },
  {
    question: "Silicon atom ke outermost (valence) shell mein kitne valence electrons hote hain?",
    optionA: "2", optionB: "4", optionC: "6", optionD: "8",
    correctOption: "B"
  },
  {
    question: "N-type semiconductor banane ke liye pure silicon mein kis valence ki impurity (doping) add ki jati hai?",
    optionA: "Trivalent (3 valence e.g. Boron)", optionB: "Pentavalent (5 valence e.g. Phosphorus, Arsenic)", optionC: "Divalent", optionD: "Monovalent",
    correctOption: "B"
  },
  {
    question: "P-type semiconductor banane ke liye kaun si impurity use hoti hai?",
    optionA: "Pentavalent (Phosphorus)", optionB: "Trivalent (Boron, Aluminum, Gallium)", optionC: "Hexavalent", optionD: "Inert gas",
    correctOption: "B"
  },
  {
    question: "Room temperature par Silicon PN junction diode ka forward cut-in (barrier) potential kitna hota hai?",
    optionA: "0.2 V", optionB: "0.7 V", optionC: "1.2 V", optionD: "0.0 V",
    correctOption: "B"
  },
  {
    question: "Germanium diode ka barrier potential kitna hota hai?",
    optionA: "0.3 V", optionB: "0.7 V", optionC: "1.1 V", optionD: "2.0 V",
    correctOption: "A"
  },
  {
    question: "Zener Diode ko voltage regulator circuit mein hamesha kis bias mein connect kiya jata hai?",
    optionA: "Forward Bias", optionB: "Reverse Bias (Breakdown Region mein)", optionC: "Zero Bias", optionD: "Pulse Bias",
    correctOption: "B"
  },
  {
    question: "Light Emitting Diode (LED) kis biasing condition mein light emit karta hai?",
    optionA: "Reverse Bias", optionB: "Forward Bias", optionC: "High Breakdown Bias", optionD: "Zero Voltage",
    correctOption: "B"
  },
  {
    question: "Photodiode light intensity detect karne ke liye kis bias mein operate hota hai?",
    optionA: "Forward Bias", optionB: "Reverse Bias", optionC: "Saturated Forward", optionD: "AC condition only",
    correctOption: "B"
  },
  {
    question: "Bipolar Junction Transistor (BJT) mein teen regions kaun se hote hain?",
    optionA: "Source, Gate, Drain", optionB: "Emitter, Base, Collector", optionC: "Anode, Cathode, Gate", optionD: "Input, Channel, Output",
    correctOption: "B"
  },
  {
    question: "BJT transistor mein sabse heavily doped region kaun sa hota hai?",
    optionA: "Base", optionB: "Emitter", optionC: "Collector", optionD: "All equal",
    correctOption: "B"
  },
  {
    question: "BJT transistor mein physical size mein sabse bada region kaun sa hota hai (heat dissipation ke liye)?",
    optionA: "Emitter", optionB: "Base", optionC: "Collector", optionD: "Substrate",
    correctOption: "C"
  },
  {
    question: "Transistor ko linear Amplifier ki tarah use karne ke liye use kis region mein operate karwaya jata hai?",
    optionA: "Cut-off Region", optionB: "Saturation Region", optionC: "Active Region (Emitter-Base Forward, Collector-Base Reverse)", optionD: "Breakdown Region",
    correctOption: "C"
  },
  {
    question: "Transistor ko electronic Switch (ON/OFF) ki tarah use karte waqt kin do regions mein operate kiya jata hai?",
    optionA: "Active aur Linear", optionB: "Saturation (ON state) aur Cut-off (OFF state)", optionC: "Breakdown aur Active", optionD: "Reverse Active only",
    correctOption: "B"
  },
  {
    question: "Common Emitter (CE) configuration mein current gain (β) kiska ratio hota hai?",
    optionA: "IC / IB (Collector current to Base current)", optionB: "IC / IE", optionC: "IB / IC", optionD: "IE / IB",
    correctOption: "A"
  },
  {
    question: "Transistor ke α (Common Base gain) aur β (Common Emitter gain) ke beech standard relation kya hota hai?",
    optionA: "β = α / (1 - α)", optionB: "β = α / (1 + α)", optionC: "α = β / (1 - β)", optionD: "α * β = 1",
    correctOption: "A"
  },
  {
    question: "Field Effect Transistor (FET) BJT ke comparison mein kis type ka device hota hai?",
    optionA: "Current Controlled Device", optionB: "Voltage Controlled Device (Unipolar)", optionC: "Power Controlled Device", optionD: "Thermal Device",
    correctOption: "B"
  },
  {
    question: "JFET aur MOSFET mein input impedance kaisi hoti hai?",
    optionA: "Very Low", optionB: "Extremely High (Mega-ohms / Giga-ohms)", optionC: "Zero", optionD: "Negative",
    correctOption: "B"
  },
  {
    question: "Ideal Operational Amplifier (Op-Amp 741) ka Open Loop Voltage Gain kitna hota hai?",
    optionA: "0", optionB: "100", optionC: "Infinity (∞)", optionD: "1",
    correctOption: "C"
  },
  {
    question: "Ideal Op-Amp ka Input Impedance aur Output Impedance kramashah (respectively) kitna hota hai?",
    optionA: "Input = Infinity, Output = 0", optionB: "Input = 0, Output = Infinity", optionC: "Input = 100 kΩ, Output = 50 Ω", optionD: "Input = 0, Output = 0",
    correctOption: "A"
  },
  {
    question: "Ideal Op-Amp ka Common Mode Rejection Ratio (CMRR) kitna hota hai?",
    optionA: "Zero", optionB: "Unity", optionC: "Infinite (∞)", optionD: "100 dB",
    correctOption: "C"
  },
  {
    question: "Op-Amp inverting amplifier configuration mein closed-loop voltage gain (Av) ka formula kya hota hai?",
    optionA: "- (Rf / R1)", optionB: "1 + (Rf / R1)", optionC: "Rf * R1", optionD: "R1 / Rf",
    correctOption: "A"
  },
  {
    question: "Op-Amp non-inverting amplifier configuration ka voltage gain kitna hota hai?",
    optionA: "- (Rf / R1)", optionB: "1 + (Rf / R1)", optionC: "Rf / R1", optionD: "1 - (Rf / R1)",
    correctOption: "B"
  },
  {
    question: "Digital Electronics mein kaun se do Universal Logic Gates hote hain jinki help se koi bhi gate banaya ja sakta hai?",
    optionA: "AND aur OR", optionB: "NAND aur NOR", optionC: "XOR aur XNOR", optionD: "NOT aur BUFFER",
    correctOption: "B"
  },
  {
    question: "XOR gate ka output '1' (HIGH) kab hota hai?",
    optionA: "Jab dono inputs same (0,0 ya 1,1) hon", optionB: "Jab dono inputs different (0,1 ya 1,0) hon (Odd 1s detector)", optionC: "Jab sabhi inputs 0 hon", optionD: "Hamesha",
    correctOption: "B"
  },
  {
    question: "De Morgan's First Law ke according expression (A + B)' kiske barabar hota hai?",
    optionA: "A' + B'", optionB: "A' . B'", optionC: "A . B", optionD: "(A . B)'",
    correctOption: "B"
  },
  {
    question: "De Morgan's Second Law ke according expression (A . B)' kiske barabar hota hai?",
    optionA: "A' + B'", optionB: "A' . B'", optionC: "A + B", optionD: "A' . B",
    correctOption: "A"
  },
  {
    question: "1-bit binary data store karne ke liye basic memory cell / sequential circuit kaun sa hota hai?",
    optionA: "Multiplexer", optionB: "Flip-Flop / Latch", optionC: "Decoder", optionD: "Encoder",
    correctOption: "B"
  },
  {
    question: "JK Flip-Flop mein 'Toggle' condition kab aati hai?",
    optionA: "J = 0, K = 0", optionB: "J = 0, K = 1", optionC: "J = 1, K = 0", optionD: "J = 1, K = 1",
    correctOption: "D"
  },
  {
    question: "JK Flip-Flop mein Race-Around Condition se bachne ke liye kaun sa flip-flop design use hota hai?",
    optionA: "SR Flip-Flop", optionB: "Master-Slave JK Flip-Flop", optionC: "D Flip-Flop", optionD: "T Flip-Flop",
    correctOption: "B"
  },
  {
    question: "Combinational circuit jo 2^n input lines mein se ek line select karke single output par bhejta hai, use kya kehte hain?",
    optionA: "Demultiplexer", optionB: "Multiplexer (MUX / Data Selector)", optionC: "Decoder", optionD: "Encoder",
    correctOption: "B"
  },
  {
    question: "8085 Microprocessor kitne bits ka microprocessor hota hai?",
    optionA: "4 bits", optionB: "8 bits", optionC: "16 bits", optionD: "32 bits",
    correctOption: "B"
  },
  {
    question: "8085 Microprocessor mein Address Bus aur Data Bus kitne bits ki hoti hain?",
    optionA: "Address Bus = 16 bits, Data Bus = 8 bits", optionB: "Address Bus = 8 bits, Data Bus = 16 bits", optionC: "Dono 16 bits", optionD: "Dono 8 bits",
    correctOption: "A"
  },
  {
    question: "8085 Microprocessor kitni maximum memory address kar sakta hai?",
    optionA: "64 KB (2^16 bytes)", optionB: "1 MB", optionC: "16 KB", optionD: "4 GB",
    correctOption: "A"
  },
  {
    question: "8085 Microprocessor mein highest priority non-maskable hardware interrupt kaun sa hota hai?",
    optionA: "RST 7.5", optionB: "RST 6.5", optionC: "TRAP", optionD: "INTR",
    correctOption: "C"
  },
  {
    question: "Microprocessor mein Program Counter (PC) register ka primary function kya hota hai?",
    optionA: "Data calculate karna", optionB: "Next execute hone wale instruction ka memory address hold karna", optionC: "Flags store karna", optionD: "Stack top point karna",
    correctOption: "B"
  },
  {
    question: "Microcontroller (jaise 8051) aur Microprocessor mein main difference kya hai?",
    optionA: "Microcontroller mein CPU, RAM, ROM, Timers aur I/O ports single chip par integrated hote hain", optionB: "Microprocessor single chip complete computer hai", optionC: "Koi difference nahi hai", optionD: "Microcontroller mein RAM nahi hoti",
    correctOption: "A"
  },
  {
    question: "8051 Microcontroller mein on-chip internal RAM kitni hoti hai?",
    optionA: "128 Bytes", optionB: "4 KB", optionC: "64 KB", optionD: "256 KB",
    correctOption: "A"
  },
  {
    question: "555 Timer IC kis application ke liye universally popular hai?",
    optionA: "Astable (Multivibrator) aur Monostable clock pulse generation", optionB: "Power amplification", optionC: "Microprocessor programming", optionD: "Audio filtering only",
    correctOption: "A"
  },
  {
    question: "Communication System mein carrier wave ke amplitude ko message signal ke according vary karna kya kehlata hai?",
    optionA: "Frequency Modulation (FM)", optionB: "Amplitude Modulation (AM)", optionC: "Phase Modulation (PM)", optionD: "Pulse Code Modulation (PCM)",
    correctOption: "B"
  },
  {
    question: "FM (Frequency Modulation) AM (Amplitude Modulation) ke comparison mein kyu superior mana jata hai?",
    optionA: "FM mein noise aur interference bohot kam hota hai aur audio quality better hoti hai", optionB: "FM ka circuit bohot simple hota hai", optionC: "FM kam bandwidth leta hai", optionD: "FM low frequency par chalta hai",
    correctOption: "A"
  },
  {
    question: "Optical Fiber communication kis optical principle par based hoti hai?",
    optionA: "Refraction", optionB: "Total Internal Reflection (TIR)", optionC: "Diffraction", optionD: "Polarization",
    correctOption: "B"
  },
  {
    question: "Optical fiber cable mein Light signal Core ke andar kyu travel karta hai?",
    optionA: "Core ka refractive index Cladding se jyada hota hai (n1 > n2)", optionB: "Cladding ka refractive index jyada hota hai", optionC: "Dono ka same hota hai", optionD: "Core hollow pipe hota hai",
    correctOption: "A"
  },
  {
    question: "Analog signal ko Digital signal mein convert karne ke liye standard technique kaun si hai?",
    optionA: "Sampling, Quantization aur Encoding (PCM)", optionB: "Demodulation only", optionC: "Filtering only", optionD: "Rectification",
    correctOption: "A"
  },
  {
    question: "Nyquist Sampling Theorem ke according aliasing se bachne ke liye minimum sampling frequency (fs) kitni honi chahiye?",
    optionA: "fs >= 2 * fm (Maximum signal frequency ka double)", optionB: "fs = fm", optionC: "fs = fm / 2", optionD: "fs = 4 * fm",
    correctOption: "A"
  },
  {
    question: "Barkhausen Criterion oscillator circuit mein continuous oscillations produce karne ke liye kya state karta hai?",
    optionA: "Loop gain |Aβ| = 1 aur Total phase shift 0° ya 360°", optionB: "Loop gain < 1", optionC: "Phase shift = 90°", optionD: "Gain = 0",
    correctOption: "A"
  },
  {
    question: "Oscilloscope (CRO / DSO) ka primary use electronics lab mein kya hota hai?",
    optionA: "Voltage waveform, amplitude, frequency aur phase angle visually display karna", optionB: "Resistance measure karna", optionC: "Current generate karna", optionD: "Capacitor charge karna",
    correctOption: "A"
  },
  {
    question: "Schottky Diode kis feature ke liye jani jati hai?",
    optionA: "Metal-semiconductor junction, zero reverse recovery time aur ultra-fast switching speed", optionB: "High forward voltage drop", optionC: "High capacitance", optionD: "Slow response",
    correctOption: "A"
  },
  {
    question: "SCR (Silicon Controlled Rectifier) ko turn-off (commutation) karne ke liye kya jaruri hai?",
    optionA: "Gate voltage badhana", optionB: "Anode current ko Holding Current se niche lana", optionC: "Cathode disconnect karna", optionD: "Supply voltage double karna",
    correctOption: "B"
  },
  {
    question: "Analog to Digital Converter (ADC) mein sabse fastest ADC architecture kaun sa hota hai?",
    optionA: "Successive Approximation (SAR) ADC", optionB: "Flash (Parallel Comparator) ADC", optionC: "Dual Slope Integrating ADC", optionD: "Counter Type ADC",
    correctOption: "B"
  }
];

// Helper to save Excel
function saveSheet(fileName, sheetName, data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const fullPath = path.join(questionsDir, fileName);
  XLSX.writeFile(wb, fullPath);
  console.log(`Saved ${data.length} questions to: ${fullPath}`);
}

saveSheet('CS-Final.xlsx', 'Sheet1', csQuestions);
saveSheet('Civil_Diploma_50-fina.xlsx', 'Questions', civilQuestions);
saveSheet('Electrical_Final_50.xlsx', 'Sheet1', electricalQuestions);
saveSheet('Mechanical_Final_50.xlsx', 'Sheet1', mechanicalQuestions);
saveSheet('elx-final.xlsx', 'Sheet1', electronicsQuestions);

console.log('All 5 Excel files created successfully!');
