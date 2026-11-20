import mongoose from "mongoose";
import dotenv from "dotenv";
import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";
import courseModel from "../Models/courseModel.js";
import academicYearModel from "../Models/academicYearModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

const questionsData = [
  // ==========================================
  // 10 EASY QUESTIONS (Fundamentals & Basics)
  // ==========================================
  {
    num: 1,
    question: "What is the mandatory entry point function for any standalone Dart program?",
    options: {
      A: "void start()",
      B: "void main()",
      C: "void run()",
      D: "int init()"
    },
    correctOption: "B"
  },
  {
    num: 2,
    question: "How do you embed an expression's value inside a Dart string literal (String interpolation)?",
    options: {
      A: "#expression",
      B: "{{expression}}",
      C: "${expression}",
      D: "@(expression)"
    },
    correctOption: "C"
  },
  {
    num: 3,
    question: "What is the fundamental difference between 'final' and 'const' variables in Dart?",
    options: {
      A: "'final' can be reassigned once, while 'const' cannot be reassigned.",
      B: "'const' is a compile-time constant, whereas 'final' is initialized at runtime and cannot be reassigned.",
      C: "'const' variables are mutable inside objects, 'final' variables are immutable.",
      D: "There is no difference; they are exact aliases."
    },
    correctOption: "B"
  },
  {
    num: 4,
    question: "In Dart null safety, how do you declare a variable of type int that can also store null?",
    options: {
      A: "nullable int x;",
      B: "int? x;",
      C: "int x = null;",
      D: "Optional<int> x;"
    },
    correctOption: "B"
  },
  {
    num: 5,
    question: "What is the default value of an uninitialized nullable variable in Dart?",
    options: {
      A: "0",
      B: "undefined",
      C: "null",
      D: "Empty object"
    },
    correctOption: "C"
  },
  {
    num: 6,
    question: "Which operator is known as the Cascade notation operator in Dart?",
    options: {
      A: "::",
      B: "->",
      C: "..",
      D: "?."
    },
    correctOption: "C"
  },
  {
    num: 7,
    question: "What is the type of variable 'numbers' in: var numbers = {1, 2, 3}; ?",
    options: {
      A: "List<int>",
      B: "Set<int>",
      C: "Map<int, int>",
      D: "Array<int>"
    },
    correctOption: "B"
  },
  {
    num: 8,
    question: "Which keyword is used in Dart to explicitly allow type inference when declaring a variable?",
    options: {
      A: "let",
      B: "auto",
      C: "var",
      D: "val"
    },
    correctOption: "C"
  },
  {
    num: 9,
    question: "What does the null-coalescing operator '??' evaluate to in: a ?? b ?",
    options: {
      A: "Returns 'b' if 'a' is null, otherwise returns 'a'.",
      B: "Returns 'b' only if 'a' is true.",
      C: "Returns null if both 'a' and 'b' are equal.",
      D: "Assigns 'b' to 'a' if 'a' is zero."
    },
    correctOption: "A"
  },
  {
    num: 10,
    question: "Which collection literal creates an empty Map with String keys and dynamic values?",
    options: {
      A: "<String, dynamic>[]",
      B: "<String, dynamic>{}",
      C: "Map() with size 0",
      D: "Set<String, dynamic>()"
    },
    correctOption: "B"
  },

  // =========================================================================
  // 40 HIGH-LEVEL & LOGICAL TRICKY QUESTIONS (Deep Reasoning, Output Tracing)
  // =========================================================================
  {
    num: 11,
    question: "Consider the following Dart code execution:\nvoid main() {\n  print('A');\n  scheduleMicrotask(() => print('B'));\n  Future(() => print('C'));\n  Future.microtask(() => print('D'));\n  print('E');\n}\nWhat is the exact printed sequence?",
    options: {
      A: "A, E, B, D, C",
      B: "A, E, C, B, D",
      C: "A, B, D, C, E",
      D: "A, E, B, C, D"
    },
    correctOption: "A"
  },
  {
    num: 12,
    question: "In Dart's Sound Null Safety, why does the following check NOT promote 'x' to non-nullable?\nclass Sample {\n  int? x;\n  void run() {\n    if (x != null) {\n      print(x + 1); // Compile Error!\n    }\n  }\n}",
    options: {
      A: "Because 'int' cannot be added to an integer literal.",
      B: "Because 'x' is an instance field (or getter) that could be overridden or modified by another thread/subclass between the check and use.",
      C: "Because Dart does not support type promotion in class methods.",
      D: "Because 'print' requires a String argument."
    },
    correctOption: "B"
  },
  {
    num: 13,
    question: "What is the output of the following Dart program?\nclass Point {\n  final int x, y;\n  const Point(this.x, this.y);\n}\nvoid main() {\n  var p1 = const Point(1, 2);\n  var p2 = const Point(1, 2);\n  var p3 = Point(1, 2);\n  print('${identical(p1, p2)} ${identical(p1, p3)}');\n}",
    options: {
      A: "true true",
      B: "false false",
      C: "true false",
      D: "false true"
    },
    correctOption: "C"
  },
  {
    num: 14,
    question: "What is printed by this Dart code?\nint counter = 0;\nint compute() { counter++; return 42; }\nvoid main() {\n  late int val = compute();\n  print(counter);\n  print(val);\n  print(counter);\n}",
    options: {
      A: "1 followed by 42 followed by 1",
      B: "0 followed by 42 followed by 1",
      C: "0 followed by 42 followed by 0",
      D: "Compilation error: late variables cannot call functions"
    },
    correctOption: "B"
  },
  {
    num: 15,
    question: "What happens if you attempt to reassign a 'late final' variable that has already been initialized at runtime?",
    options: {
      A: "It successfully overrides the previous value.",
      B: "It throws a LateInitializationError at runtime.",
      C: "It silently ignores the new assignment.",
      D: "It triggers a compile-time warning but runs fine."
    },
    correctOption: "B"
  },
  {
    num: 16,
    question: "What will be printed by the following code involving Closures inside a for loop?\nvoid main() {\n  var actions = <Function>[];\n  for (var i = 0; i < 3; i++) {\n    actions.add(() => i);\n  }\n  print(actions.map((f) => f()).toList());\n}",
    options: {
      A: "[3, 3, 3]",
      B: "[0, 1, 2]",
      C: "[2, 2, 2]",
      D: "[null, null, null]"
    },
    correctOption: "B"
  },
  {
    num: 17,
    question: "Consider this mixin inheritance order in Dart:\nclass Base { String name = 'Base'; }\nmixin M1 on Base { String get title => 'M1->' + super.name; }\nmixin M2 on Base { String get title => 'M2->' + super.name; }\nclass App extends Base with M1, M2 {}\nvoid main() => print(App().title);\nWhat is the output?",
    options: {
      A: "M1->Base",
      B: "M2->Base",
      C: "M1->M2->Base",
      D: "Compile-time error: multiple mixins cannot override the same getter"
    },
    correctOption: "B"
  },
  {
    num: 18,
    question: "What does the following synchronous generator code produce?\nIterable<int> count() sync* {\n  int i = 1;\n  while (true) {\n    yield i++;\n  }\n}\nvoid main() {\n  print(count().skip(3).take(3).toList());\n}",
    options: {
      A: "Causes an infinite loop and crashes with OutOfMemoryError.",
      B: "[4, 5, 6]",
      C: "[3, 4, 5]",
      D: "[1, 2, 3]"
    },
    correctOption: "B"
  },
  {
    num: 19,
    question: "What is the output of this Dart program?\nvoid main() {\n  var list = [1, 2, 3];\n  var mapped = list.map((e) {\n    print('mapped: $e');\n    return e * 2;\n  });\n  print('Done mapping');\n  print(mapped.first);\n}",
    options: {
      A: "mapped: 1, mapped: 2, mapped: 3, Done mapping, 2",
      B: "Done mapping, mapped: 1, 2",
      C: "Done mapping, 2, mapped: 1",
      D: "Done mapping, mapped: 1, mapped: 2, mapped: 3, 2"
    },
    correctOption: "B"
  },
  {
    num: 20,
    question: "What will happen if you listen to a single-subscription Stream twice in Dart?",
    options: {
      A: "Both listeners receive all events simultaneously.",
      B: "The first listener is canceled and the second listener takes over.",
      C: "A StateError: 'Bad state: Stream has already been listened to.' is thrown.",
      D: "Events are alternatingly distributed between the listeners."
    },
    correctOption: "C"
  },
  {
    num: 21,
    question: "What is printed by the following asynchronous Dart code?\nFuture<void> main() async {\n  Future(() => print('F1'))\n    .then((_) => print('F2'));\n  Future(() => print('F3'));\n  print('Start');\n}",
    options: {
      A: "Start, F1, F2, F3",
      B: "Start, F1, F3, F2",
      C: "F1, F2, F3, Start",
      D: "Start, F3, F1, F2"
    },
    correctOption: "A"
  },
  {
    num: 22,
    question: "What is the result of destructuring the record in Dart 3:\nvoid main() {\n  var (a, [b, c], {d: e}) = (10, [20, 30], d: 40);\n  print('$a $b $c $e');\n}",
    options: {
      A: "10 20 30 40",
      B: "10 [20, 30] 40 null",
      C: "Compile error: Invalid pattern structure",
      D: "10 20 30 {d: 40}"
    },
    correctOption: "A"
  },
  {
    num: 23,
    question: "What will this Dart program print?\nint test() {\n  try {\n    return 1;\n  } finally {\n    return 2;\n  }\n}\nvoid main() => print(test());",
    options: {
      A: "1",
      B: "2",
      C: "Compile Error: return inside finally is forbidden",
      D: "Unhandled exception: FinallyOverrideException"
    },
    correctOption: "B"
  },
  {
    num: 24,
    question: "What is the output of the following reduce vs fold operations?\nvoid main() {\n  List<int> emptyList = [];\n  try {\n    print(emptyList.reduce((a, b) => a + b));\n  } catch (e) {\n    print('Err');\n  }\n  print(emptyList.fold<int>(10, (a, b) => a + b));\n}",
    options: {
      A: "0 followed by 10",
      B: "Err followed by 10",
      C: "Err followed by Err",
      D: "null followed by 10"
    },
    correctOption: "B"
  },
  {
    num: 25,
    question: "What is the difference between 'yield' and 'yield*' in an async* or sync* generator function?",
    options: {
      A: "'yield' emits a single value, whereas 'yield*' delegates to another Stream or Iterable to emit all its values.",
      B: "'yield*' emits values synchronously, while 'yield' emits them asynchronously.",
      C: "'yield*' terminates the generator, while 'yield' pauses it.",
      D: "There is no difference; 'yield*' is legacy syntax."
    },
    correctOption: "A"
  },
  {
    num: 26,
    question: "What does the following Dart code output?\nvoid main() {\n  List<int>? list;\n  var result = [0, ...?list, 4];\n  print(result);\n}",
    options: {
      A: "Throws NoSuchMethodError or NullThrownError",
      B: "[0, null, 4]",
      C: "[0, 4]",
      D: "Compile error: list cannot be null in spread"
    },
    correctOption: "C"
  },
  {
    num: 27,
    question: "What is printed by this Null-aware Cascade code?\nclass Box { int value = 10; void inc() => value++; }\nvoid main() {\n  Box? b;\n  b?..inc()..inc();\n  print(b?.value);\n}",
    options: {
      A: "12",
      B: "null",
      C: "Throws NullPointer/LateInitializationError",
      D: "10"
    },
    correctOption: "B"
  },
  {
    num: 28,
    question: "Which of the following operators CANNOT be overloaded in Dart?",
    options: {
      A: "[] and []=",
      B: "~ and ^",
      C: "?? and &&",
      D: "== and +"
    },
    correctOption: "C"
  },
  {
    num: 29,
    question: "In Dart constructor execution, what is the exact order of execution among:\n(1) Superclass constructor body\n(2) Initializer list\n(3) Subclass constructor body\n(4) Superclass initializer list",
    options: {
      A: "Subclass Initializer list -> Superclass Initializer list -> Superclass constructor body -> Subclass constructor body",
      B: "Subclass constructor body -> Subclass Initializer list -> Superclass constructor body",
      C: "Superclass Initializer list -> Subclass Initializer list -> Subclass constructor body -> Superclass constructor body",
      D: "Superclass constructor body -> Subclass constructor body -> Initializer list"
    },
    correctOption: "A"
  },
  {
    num: 30,
    question: "What is printed by this code involving Extension methods with identical names?\nextension Ext1 on int { String info() => 'Ext1'; }\nextension Ext2 on int { String info() => 'Ext2'; }\nvoid main() {\n  // How to explicitly invoke Ext1 on number 5?\n  print(Ext1(5).info());\n}",
    options: {
      A: "Ext1",
      B: "Compile Error: Extensions cannot be called explicitly like a constructor wrapper",
      C: "Ext2",
      D: "Throws AmbiguousExtensionException at runtime"
    },
    correctOption: "A"
  },
  {
    num: 31,
    question: "What is the output of the following switch expression in Dart 3?\nvoid main() {\n  Object val = [1, 'Dart'];\n  var res = switch (val) {\n    [int a, String b] => 'Match: $a, $b',\n    [var a, var b] => 'Generic list',\n    _ => 'No match',\n  };\n  print(res);\n}",
    options: {
      A: "Generic list",
      B: "Match: 1, Dart",
      C: "No match",
      D: "Compile error: Object cannot be pattern matched"
    },
    correctOption: "B"
  },
  {
    num: 32,
    question: "What is printed by the following code?\nvoid main() {\n  int? a;\n  int b = 5;\n  a ??= b += 10;\n  print('$a $b');\n  a ??= b += 20;\n  print('$a $b');\n}",
    options: {
      A: "15 15 followed by 15 35",
      B: "15 15 followed by 15 15",
      C: "15 15 followed by 35 35",
      D: "null 5 followed by 15 25"
    },
    correctOption: "B"
  },
  {
    num: 33,
    question: "What is the primary role of a 'factory' constructor in Dart compared to a generative constructor?",
    options: {
      A: "It must always return a subtype or cached/existing instance and doesn't create the instance itself via 'this'.",
      B: "It can only create immutable instances.",
      C: "It is executed before main() starts.",
      D: "It runs asynchronously and returns a Future."
    },
    correctOption: "A"
  },
  {
    num: 34,
    question: "What is the result of running this code?\nvoid main() {\n  var list = List<int>.unmodifiable([1, 2, 3]);\n  try {\n    list[0] = 99;\n  } catch (e) {\n    print(e.runtimeType);\n  }\n}",
    options: {
      A: "RangeError",
      B: "UnsupportedError",
      C: "StateError",
      D: "Compile-time error"
    },
    correctOption: "B"
  },
  {
    num: 35,
    question: "In Dart 3, what does declaring a class with the 'sealed' modifier guarantee?",
    options: {
      A: "The class cannot be extended, implemented, or mixed in anywhere.",
      B: "All subclasses must be defined in the same library/file, enabling exhaustive compile-time checking in switch expressions.",
      C: "The class has no constructors.",
      D: "All methods in the class are automatically final."
    },
    correctOption: "B"
  },
  {
    num: 36,
    question: "What is the output of the following future chaining code?\nFuture<void> main() async {\n  var f = Future.value('Alpha')\n    .then((val) => Future.value('$val-Beta'))\n    .then((val) => '$val-Gamma');\n  print(await f);\n}",
    options: {
      A: "Alpha",
      B: "Alpha-Beta-Gamma",
      C: "Instance of 'Future<String>'",
      D: "Gamma"
    },
    correctOption: "B"
  },
  {
    num: 37,
    question: "What does the 'rethrow' keyword do inside a catch block in Dart?",
    options: {
      A: "Throws a new exception and resets the stack trace to the catch statement.",
      B: "Propagates the originally caught exception preserving its original stack trace.",
      C: "Converts synchronous exceptions into Future.error.",
      D: "Restarts the enclosing try block from the beginning."
    },
    correctOption: "B"
  },
  {
    num: 38,
    question: "What is printed by this tear-off code in Dart?\nvoid main() {\n  var list = ['10', '20', '30'];\n  var parsed = list.map(int.parse).toList();\n  print(parsed.runtimeType);\n}",
    options: {
      A: "List<String>",
      B: "List<int>",
      C: "List<dynamic>",
      D: "Iterable<int>"
    },
    correctOption: "B"
  },
  {
    num: 39,
    question: "Consider this Dart code with Completer:\nvoid main() async {\n  var c = Completer<int>();\n  c.future.then((v) => print('Result: $v'));\n  c.complete(100);\n  print('Done');\n}\nWhat is the printed order?",
    options: {
      A: "Result: 100 followed by Done",
      B: "Done followed by Result: 100",
      C: "Done only",
      D: "Result: 100 only"
    },
    correctOption: "B"
  },
  {
    num: 40,
    question: "What is the output of this equality check between two Records in Dart 3?\nvoid main() {\n  var r1 = (name: 'Alex', age: 25);\n  var r2 = (name: 'Alex', age: 25);\n  print(r1 == r2);\n}",
    options: {
      A: "false (Records check identity by default)",
      B: "true (Records have structural equality by default based on shape and field values)",
      C: "Compile error: operator '==' is not supported on Records",
      D: "Throws NoSuchMethodError"
    },
    correctOption: "B"
  },
  {
    num: 41,
    question: "What happens when executing this code?\nvoid main() {\n  final list = List<int>.filled(3, 0, growable: false);\n  try {\n    list.add(4);\n  } catch (e) {\n    print(e.runtimeType);\n  }\n}",
    options: {
      A: "Prints: RangeError",
      B: "Prints: UnsupportedError",
      C: "Successfully adds 4 to list",
      D: "Prints: StateError"
    },
    correctOption: "B"
  },
  {
    num: 42,
    question: "What is printed by the following code using guard clauses in Dart 3 pattern matching?\nvoid test(num x) {\n  switch (x) {\n    case int n when n.isEven:\n      print('Even Int');\n    case int n:\n      print('Odd Int');\n    case double d:\n      print('Double');\n  }\n}\nvoid main() => test(4);",
    options: {
      A: "Odd Int",
      B: "Even Int",
      C: "Even Int followed by Odd Int",
      D: "Compile error: when clause is invalid in Dart 3"
    },
    correctOption: "B"
  },
  {
    num: 43,
    question: "What is the output of this stream fold operation?\nvoid main() async {\n  var s = Stream.fromIterable([1, 2, 3, 4]);\n  var sum = await s.fold<int>(10, (prev, elem) => prev + elem);\n  print(sum);\n}",
    options: {
      A: "10",
      B: "20",
      C: "24",
      D: "14"
    },
    correctOption: "B"
  },
  {
    num: 44,
    question: "In Dart, what is the role of the 'covariant' keyword when added to a method parameter in a subclass or interface?",
    options: {
      A: "Forces the parameter to be immutable.",
      B: "Tells the analyzer to bypass static type narrowing errors and perform a runtime type check on the argument.",
      C: "Makes the method callable without creating an instance.",
      D: "Converts the parameter into an optional named parameter."
    },
    correctOption: "B"
  },
  {
    num: 45,
    question: "What will the following code output?\nvoid main() {\n  var map = {'a': 1, 'b': 2};\n  var entry = map.putIfAbsent('c', () => 3);\n  var existing = map.putIfAbsent('a', () => 99);\n  print('$entry $existing ${map['a']}');\n}",
    options: {
      A: "3 99 99",
      B: "3 1 1",
      C: "3 1 99",
      D: "null 1 1"
    },
    correctOption: "B"
  },
  {
    num: 46,
    question: "What is printed by this code?\nvoid main() {\n  var list1 = [1, 2, [3, 4]];\n  var list2 = List.of(list1);\n  (list2[2] as List)[0] = 99;\n  print(list1[2]);\n}",
    options: {
      A: "[3, 4] (Deep copy created)",
      B: "[99, 4] (List.of creates a shallow copy, nested collections share references)",
      C: "Throws TypeError",
      D: "[99, 99]"
    },
    correctOption: "B"
  },
  {
    num: 47,
    question: "What does the following Zone code demonstrate?\nvoid main() {\n  runZonedGuarded(() {\n    Future(() => throw Exception('Async crash'));\n  }, (error, stack) {\n    print('Intercepted: ${error.runtimeType}');\n  });\n}",
    options: {
      A: "Program crashes because asynchronous exceptions cannot be caught outside their Future.",
      B: "Prints: Intercepted: _Exception",
      C: "Compile error: runZonedGuarded requires a ZoneSpecification parameter",
      D: "Does nothing because Future executes in root zone"
    },
    correctOption: "B"
  },
  {
    num: 48,
    question: "What is printed by the following code involving Dart 3 class modifiers?\n// In Dart 3, an 'interface class' can be implemented but CANNOT be:\n",
    options: {
      A: "Constructed using 'new'",
      B: "Extended outside its defining library",
      C: "Annotated with metadata",
      D: "Used as a type annotation"
    },
    correctOption: "B"
  },
  {
    num: 49,
    question: "What does the following function return?\nString evaluate(int score) => switch (score) {\n  >= 90 => 'A',\n  >= 75 => 'B',\n  >= 60 => 'C',\n  _ => 'D'\n};\nvoid main() => print(evaluate(80));",
    options: {
      A: "A",
      B: "B",
      C: "C",
      D: "D"
    },
    correctOption: "B"
  },
  {
    num: 50,
    question: "What will be printed by this code exploring StreamController buffering?\nvoid main() async {\n  var controller = StreamController<int>();\n  controller.add(1);\n  controller.add(2);\n  await Future.delayed(Duration(milliseconds: 10));\n  controller.stream.take(1).listen(print);\n  controller.close();\n}",
    options: {
      A: "Nothing is printed because events fired before listening are lost in a StreamController.",
      B: "1 (StreamController buffers events until a listener is attached)",
      C: "Throws StateError: 'Events added before listen'",
      D: "2"
    },
    correctOption: "B"
  }
];

async function createDartChampionTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Training Quiz Certificate - 1
  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Using Certificate Template:", cert.certificateName, cert._id);

  // Default course & year
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();

  // Topic: Dart Programming (50 Questions)
  const topicName = "Dart Programming (50 Questions)";
  let topic = await topicModel.findOne({ topicName });
  if (!topic) {
    topic = await topicModel.create({
      topicName,
      status: true,
      questionCout: 50
    });
    console.log("Created Topic:", topic.topicName, topic._id);
  } else {
    console.log("Found existing Topic:", topic.topicName, topic._id);
  }

  // Insert 50 questions
  const qDocs = [];
  for (const qData of questionsData) {
    let q = await questionModel.findOne({ topic: topic._id, question: qData.question });
    if (!q) {
      q = await questionModel.create({
        topic: topic._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: qData.question,
        options: qData.options,
        correctOption: qData.correctOption
      });
    }
    qDocs.push(q._id);
  }

  await topicModel.findByIdAndUpdate(topic._id, { questionCout: qDocs.length });
  console.log("Dart questions ready in database:", qDocs.length);

  // Timing: 50 minutes duration as requested, active 14 days
  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const endDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Assessment Code: DCT0254
  const code = "DCT0254";

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "Dart Champion Test",
    assessmentCode: code,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 50, // 50 minutes duration as requested!
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "Dart Champion Test",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment._id,
    questionIds: qDocs,
    courseYearGroups: []
  });

  console.log("\n=== DART CHAMPION TEST CREATED SUCCESSFULLY ===");
  console.log({
    _id: assessment._id,
    assessmentId: assessment.assessmentId,
    assessmentName: assessment.assessmentName,
    assessmentCode: assessment.assessmentCode,
    totalQuestions: assessment.totalQuestions,
    timeDuration: assessment.timeDuration + " Minutes",
    generateCertificate: assessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: assessment.status,
    questionsAssigned: qDocs.length
  });

  console.log("\nTest Link: https://assessment.thedigicoders.com/" + assessment.assessmentCode);

  await mongoose.disconnect();
}

createDartChampionTest().catch(err => {
  console.error("Error creating Dart assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

