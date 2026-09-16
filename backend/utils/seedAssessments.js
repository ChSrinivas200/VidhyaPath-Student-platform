const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

async function seedAssessments() {
  try {
    // 1. Find or create master verified tutor
    let tutor = await User.findOne({ email: 'tutor.lead@vidyapath.edu' });
    if (!tutor) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      tutor = new User({
        name: 'Prof. Alex Rivera (Lead Technical Tutor)',
        email: 'tutor.lead@vidyapath.edu',
        password: hashedPassword,
        role: 'tutor',
        isTutorVerified: true,
        specialization: 'Computer Science & Software Engineering',
      });
      await tutor.save();
      console.log('✅ Master Tutor created: tutor.lead@vidyapath.edu');
    }

    // Check if 30-MCQ Foundational Base Exam exists
    const existingBase = await Assessment.findOne({ title: /DSA & Web Dev Practice Quiz|30 MCQs|Foundational Base/i });
    if (!existingBase) {
      const thirtyMcqsExam = new Assessment({
        title: 'DSA & Web Dev Practice Quiz — 30 MCQs (Foundational Base Exam)',
        description: 'Official 30-MCQ Diagnostic Base Exam evaluating Arrays, Math & Logic, Strings, Trees & BST, Linked List, Dynamic Programming, Graphs, Hashing, Web Dev & JS, and Gen AI & RAG.',
        domain: 'Data Structures & Algorithms',
        difficulty: 'Intermediate',
        timeLimitMinutes: 35,
        passingPercentage: 70,
        tutorId: tutor._id,
        tutorName: tutor.name,
        questions: [
          // 1. Arrays
          { question: 'What is the time complexity of accessing an element by index in an array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 'O(1)', skillTag: 'Arrays', explanation: 'Direct indexing via address calculation is constant time.' },
          { question: 'Which technique reverses an array in-place with O(1) extra space?', options: ['Two-pointer swap', 'Extra array copy', 'Recursion with stack', 'Hash map lookup'], correctAnswer: 'Two-pointer swap', skillTag: 'Arrays', explanation: 'Swapping elements from both ends moving inward uses O(1) extra space.' },
          
          // 2. Math & Logic
          { question: "Kadane's algorithm is used to solve which problem?", options: ['Maximum subarray sum', 'Longest common subsequence', 'Shortest path', 'Binary search'], correctAnswer: 'Maximum subarray sum', skillTag: 'Math & Logic', explanation: "Kadane's algorithm finds the maximum sum contiguous subarray in O(n) time." },
          { question: 'GCD(48, 18) equals?', options: ['6', '12', '18', '3'], correctAnswer: '6', skillTag: 'Math & Logic', explanation: 'Euclidean algorithm: 48 -> 18 -> 12 -> 6 -> 0.' },
          { question: 'How many trailing zeros does 10! have?', options: ['2', '1', '3', '0'], correctAnswer: '2', skillTag: 'Math & Logic', explanation: 'Count factors of 5 (from 5 and 10).' },

          // 3. Strings
          { question: 'Which algorithm efficiently checks if a string is a palindrome?', options: ['Two-pointer comparison from both ends', 'Sorting the string', 'Hashing each character separately', 'Building a suffix tree'], correctAnswer: 'Two-pointer comparison from both ends', skillTag: 'Strings', explanation: 'Two-pointer comparison from both ends checks palindromes in linear time.' },
          { question: 'What data structure is most efficient for checking if two strings are anagrams?', options: ['Frequency array/hash map', 'Stack', 'Linked list', 'Binary tree'], correctAnswer: 'Frequency array/hash map', skillTag: 'Strings', explanation: 'Frequency array or hash map counts character occurrences efficiently.' },
          { question: 'Which pattern-matching algorithm achieves O(n+m) time using a failure function?', options: ['KMP (Knuth-Morris-Pratt)', 'Brute force', 'Rabin-Karp with weak hashing', 'Bubble matching'], correctAnswer: 'KMP (Knuth-Morris-Pratt)', skillTag: 'Strings', explanation: 'KMP algorithm uses a failure function table to avoid re-matching characters.' },

          // 4. Trees & BST
          { question: 'In a BST, in-order traversal visits nodes in what order?', options: ['Sorted ascending order', 'Random order', 'Sorted descending order', 'Level by level'], correctAnswer: 'Sorted ascending order', skillTag: 'Trees & BST', explanation: 'In-order traversal visits BST keys in sorted ascending order.' },
          { question: 'Worst-case time complexity of search in an unbalanced BST?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correctAnswer: 'O(n)', skillTag: 'Trees & BST', explanation: 'Degenerates to a linked list with sorted insertions.' },
          { question: 'Which traversal safely deletes a binary tree (children freed before parent)?', options: ['Post-order', 'Pre-order', 'In-order', 'Level-order'], correctAnswer: 'Post-order', skillTag: 'Trees & BST', explanation: 'Post-order traversal processes children before freeing parent nodes.' },
          { question: 'What self-balancing property does an AVL tree maintain?', options: ['Height difference between left/right subtrees ≤ 1', 'All leaves at same depth', 'Every node has exactly two children', 'Root is always the median'], correctAnswer: 'Height difference between left/right subtrees ≤ 1', skillTag: 'Trees & BST', explanation: 'Height difference between left/right subtrees is maintained at most 1.' },

          // 5. Linked List
          { question: 'Main advantage of a doubly linked list over singly linked?', options: ['Traversal in both directions', 'Less memory usage', 'O(1) random access', 'Faster insertion at head only'], correctAnswer: 'Traversal in both directions', skillTag: 'Linked List', explanation: 'Pointers to next and prev allow traversal in both directions.' },
          { question: "Floyd's cycle detection (tortoise and hare) detects what?", options: ['A cycle/loop', 'The middle node', 'Duplicate values', "The list's length"], correctAnswer: 'A cycle/loop', skillTag: 'Linked List', explanation: 'Two pointers moving at different speeds detect cycles/loops.' },

          // 6. Dynamic Programming
          { question: 'Core principle behind Dynamic Programming?', options: ['Storing results of overlapping subproblems to avoid recomputation', 'Always choosing the locally optimal choice', 'Dividing into completely independent parts', 'Randomly sampling solutions'], correctAnswer: 'Storing results of overlapping subproblems to avoid recomputation', skillTag: 'Dynamic Programming', explanation: 'Storing results of overlapping subproblems avoids recomputation.' },
          { question: 'Time complexity of standard 0/1 Knapsack DP (n items, capacity W)?', options: ['O(n*W)', 'O(n+W)', 'O(2^n)', 'O(n log W)'], correctAnswer: 'O(n*W)', skillTag: 'Dynamic Programming', explanation: '0/1 Knapsack DP table has size n x W.' },
          { question: 'In LCS DP, when characters match (s1[i]==s2[j]), what\'s the recurrence?', options: ['dp[i][j] = 1 + dp[i-1][j-1]', 'dp[i][j] = dp[i-1][j] + dp[i][j-1]', 'dp[i][j] = max(dp[i-1][j], dp[i][j-1])', 'dp[i][j] = 0'], correctAnswer: 'dp[i][j] = 1 + dp[i-1][j-1]', skillTag: 'Dynamic Programming', explanation: 'When characters match, add 1 to the diagonal previous state.' },
          { question: 'Which DP pattern solves "coin change – minimum coins"?', options: ['Unbounded knapsack', '0/1 knapsack', 'Interval DP', 'Bitmask DP'], correctAnswer: 'Unbounded knapsack', skillTag: 'Dynamic Programming', explanation: 'Coins can be reused unlimited times (unbounded knapsack).' },

          // 7. Graphs
          { question: 'Which graph traversal uses a queue, level by level?', options: ['BFS', 'DFS', "Dijkstra's without a priority queue", 'Topological sort via DFS'], correctAnswer: 'BFS', skillTag: 'Graphs', explanation: 'Breadth-First Search uses a queue to visit nodes level by level.' },
          { question: 'Which algorithm finds shortest path with non-negative weights?', options: ["Dijkstra's algorithm", 'DFS', "Kruskal's algorithm", 'Union-Find alone'], correctAnswer: "Dijkstra's algorithm", skillTag: 'Graphs', explanation: "Dijkstra's algorithm finds shortest paths with non-negative weights." },
          { question: 'What does a topological sort of a DAG produce?', options: ['A linear ordering where every edge u→v has u before v', 'Shortest path between all pairs', 'Minimum spanning tree', 'Cycle detection only'], correctAnswer: 'A linear ordering where every edge u→v has u before v', skillTag: 'Graphs', explanation: 'Topological sort orders DAG vertices linearly such that u precedes v.' },
          { question: "Kruskal's algorithm relies on which structure to detect cycles efficiently?", options: ['Union-Find (Disjoint Set)', 'Binary heap only', 'Hash map', 'Trie'], correctAnswer: 'Union-Find (Disjoint Set)', skillTag: 'Graphs', explanation: 'Union-Find / Disjoint Set detects cycles efficiently in Kruskal algorithm.' },

          // 8. Hashing
          { question: 'Average time complexity of hash table insert/delete/lookup?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 'O(1)', skillTag: 'Hashing', explanation: 'Direct key hashing enables average O(1) operations.' },
          { question: 'Which collision resolution stores multiple elements in a list per bucket?', options: ['Chaining', 'Open addressing', 'Perfect hashing', 'Cuckoo hashing removal'], correctAnswer: 'Chaining', skillTag: 'Hashing', explanation: 'Chaining maintains a linked list of elements at each bucket.' },
          { question: 'What causes hash table performance to degrade toward O(n)?', options: ['High load factor causing many collisions', 'Using too few keys', 'Using a balanced tree internally', 'Small key sizes'], correctAnswer: 'High load factor causing many collisions', skillTag: 'Hashing', explanation: 'High load factor leads to frequent collisions and longer chain lookups.' },

          // 9. Web Dev & JS
          { question: "In JavaScript, what does '===' check that '==' does not?", options: ['Type, in addition to value', 'Only value, ignoring type', 'Reference equality for primitives', 'Nothing different'], correctAnswer: 'Type, in addition to value', skillTag: 'Web Dev & JS', explanation: 'Strict equality (===) checks data type as well as value.' },
          { question: 'What does the JavaScript event loop primarily manage?', options: ['Coordinating call stack, callback queue, and microtask queue for async execution', 'Compiling JS to machine code', 'Garbage collection only', 'CSS rendering order'], correctAnswer: 'Coordinating call stack, callback queue, and microtask queue for async execution', skillTag: 'Web Dev & JS', explanation: 'Event loop coordinates call stack, callback queue, and microtasks for async execution.' },
          { question: 'In React, what triggers a component to re-render?', options: ['A change in state or props', 'Only a page refresh', 'Changing a global CSS file', 'Restarting the dev server'], correctAnswer: 'A change in state or props', skillTag: 'Web Dev & JS', explanation: 'State or prop modifications trigger component re-renders in React.' },

          // 10. Gen AI & RAG
          { question: 'In RAG, what is the primary purpose of the retrieval step?', options: ["Fetch relevant external documents/context to ground the LLM's response", 'Fine-tune model weights in real time', 'Compress the model for faster inference', 'Generate random training data'], correctAnswer: "Fetch relevant external documents/context to ground the LLM's response", skillTag: 'Gen AI & RAG', explanation: 'Retrieval fetches external documents/context to ground LLM responses.' },
          { question: 'What technique converts text into vectors capturing semantic meaning, used in RAG?', options: ['Embeddings', 'One-hot encoding', 'Tokenization alone', 'Checksum hashing'], correctAnswer: 'Embeddings', skillTag: 'Gen AI & RAG', explanation: 'Dense vector embeddings represent text semantic meaning in vector space.' }
        ]
      });

      await thirtyMcqsExam.save();
      console.log('✅ Seeded 30-MCQ Foundational Base Exam into MongoDB!');
    }

    const existingCount = await Assessment.countDocuments();
    if (existingCount >= 5) {
      console.log(`ℹ️ Skill assessments already seeded (${existingCount} available).`);
      return;
    }

    // 2. Prepare 4 Comprehensive Assessments
    const sampleAssessments = [
      {
        title: 'Data Structures & Algorithm Optimization',
        description: 'Comprehensive evaluation covering computational complexity, tree traversals, dynamic programming paradigms, and graph algorithms.',
        domain: 'Data Structures & Algorithms',
        difficulty: 'Intermediate',
        timeLimitMinutes: 20,
        passingPercentage: 70,
        tutorId: tutor._id,
        tutorName: tutor.name,
        questions: [
          {
            question: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?',
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
            correctAnswer: 'O(N)',
            skillTag: 'Tree Data Structures',
            explanation: 'In an unbalanced BST that degrades into a linked list (skewed tree), searching takes linear time O(N).',
          },
          {
            question: 'Which algorithmic paradigm solves subproblems just once and stores their solutions in a lookup table or array?',
            options: ['Greedy Choice', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'],
            correctAnswer: 'Dynamic Programming',
            skillTag: 'Dynamic Programming',
            explanation: 'Dynamic Programming uses memoization (top-down) or tabulation (bottom-up) to avoid redundant computation of overlapping subproblems.',
          },
          {
            question: 'When analyzing nested loops where the outer loop runs N times and the inner loop doubles its step each iteration (j *= 2), what is the tight upper bound?',
            options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(log N)'],
            correctAnswer: 'O(N log N)',
            skillTag: 'Big-O Complexity',
            explanation: 'The inner loop takes O(log N) operations for each of the N outer iterations, yielding an overall bound of O(N log N).',
          },
          {
            question: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue and is optimal for finding the shortest path in an unweighted graph?',
            options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra with negative weights', 'Topological Sort'],
            correctAnswer: 'Breadth-First Search (BFS)',
            skillTag: 'Graph Algorithms',
            explanation: 'BFS explores neighbor nodes level by level using a queue, guaranteeing the minimum edge count to any reachable target.',
          },
          {
            question: 'What technique in hash table implementation resolves collisions by maintaining a linked list of entries at each bucket index?',
            options: ['Linear Probing', 'Double Hashing', 'Separate Chaining', 'Quadratic Probing'],
            correctAnswer: 'Separate Chaining',
            skillTag: 'Hashing & Hash Tables',
            explanation: 'Separate chaining stores collided key-value pairs in a linked list or secondary tree structure at the hashed bucket index.',
          },
        ],
      },
      {
        title: 'Full-Stack React & Modern Web Architecture',
        description: 'Assesses mastery of modern React component lifecycle, hook dependencies, asynchronous state flow, and web API security.',
        domain: 'Full Stack Development',
        difficulty: 'Intermediate',
        timeLimitMinutes: 20,
        passingPercentage: 70,
        tutorId: tutor._id,
        tutorName: tutor.name,
        questions: [
          {
            question: 'In a React functional component, what happens if an empty dependency array [] is passed to useEffect?',
            options: [
              'The effect runs on every single render.',
              'The effect runs once after the initial mount.',
              'The effect never executes.',
              'The component triggers an infinite loop.',
            ],
            correctAnswer: 'The effect runs once after the initial mount.',
            skillTag: 'React Hooks',
            explanation: 'Passing [] signifies that the effect depends on no state or props, causing it to run only after the initial component mount.',
          },
          {
            question: 'Why does React require state to be treated as immutable rather than mutating objects directly (e.g. state.count++)?',
            options: [
              'To reduce memory consumption in the browser heap.',
              'Because shallow comparison cannot detect in-place mutations to trigger re-renders.',
              'Direct mutations are forbidden by JavaScript strict mode.',
              'Because React only supports primitive strings and numbers.',
            ],
            correctAnswer: 'Because shallow comparison cannot detect in-place mutations to trigger re-renders.',
            skillTag: 'State Immutability',
            explanation: 'React compares object references; mutating properties in place keeps the memory reference unchanged, so React skips re-rendering.',
          },
          {
            question: 'How does React Virtual DOM optimize DOM updates during UI state changes?',
            options: [
              'It completely reloads the HTML document from the server.',
              'It computes a diff between virtual trees and executes minimal batch updates on the real DOM.',
              'It compiles all JSX into raw WebAssembly binaries.',
              'It uses synchronous browser redraw blocking.',
            ],
            correctAnswer: 'It computes a diff between virtual trees and executes minimal batch updates on the real DOM.',
            skillTag: 'Virtual DOM & Rendering',
            explanation: 'The reconciliation algorithm compares the previous and new virtual DOM trees to compute the minimum diff required on the real DOM.',
          },
          {
            question: 'In token-based authentication, which header is standard for transmitting a signed JWT to protected API endpoints?',
            options: [
              'Content-Encoding: gzip',
              'Authorization: Bearer <token>',
              'X-Forwarded-Proto: https',
              'Accept-Charset: utf-8',
            ],
            correctAnswer: 'Authorization: Bearer <token>',
            skillTag: 'Web Security & JWT',
            explanation: 'The HTTP Authorization header with the Bearer schema is the universal RFC standard for JWT bearer tokens.',
          },
          {
            question: 'What is the primary architectural benefit of maintaining normalized component state over deeply nested objects?',
            options: [
              'Eliminates the need for any CSS styling.',
              'Simplifies update logic and prevents redundant re-renders of sibling trees.',
              'Enforces database schema migrations automatically.',
              'Makes all API responses synchronous.',
            ],
            correctAnswer: 'Simplifies update logic and prevents redundant re-renders of sibling trees.',
            skillTag: 'API Architecture',
            explanation: 'Normalized state treats items as IDs and lookup tables, preventing cumbersome deep mutations and localized re-render cascades.',
          },
        ],
      },
      {
        title: 'Database Systems & SQL Optimization',
        description: 'Evaluates relational database design, B-Tree indexes, transaction isolation levels, and high-performance SQL querying.',
        domain: 'Database Engineering',
        difficulty: 'Advanced',
        timeLimitMinutes: 25,
        passingPercentage: 70,
        tutorId: tutor._id,
        tutorName: tutor.name,
        questions: [
          {
            question: 'Which underlying data structure do relational databases like PostgreSQL and MySQL predominantly use for primary index lookups?',
            options: ['Skip Lists', 'B+ Trees', 'Red-Black Trees', 'Linked Queues'],
            correctAnswer: 'B+ Trees',
            skillTag: 'SQL Indexing & Execution',
            explanation: 'B+ Trees provide high fan-out, shallow tree depth, and sequential leaf node linking ideal for disk block reads and range scans.',
          },
          {
            question: 'In the ACID transaction model, which property guarantees that database changes survive power losses or system crashes once committed?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            correctAnswer: 'Durability',
            skillTag: 'ACID Transactions',
            explanation: 'Durability guarantees that committed transactions are written to non-volatile storage (WAL / disk) and survive crashes.',
          },
          {
            question: 'What database normalization form requires all non-key attributes to be fully functionally dependent on the primary key, eliminating partial dependencies?',
            options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd (BCNF)'],
            correctAnswer: 'Second Normal Form (2NF)',
            skillTag: 'Database Normalization',
            explanation: '2NF requires 1NF compliance and mandates that every non-prime attribute is fully dependent on the primary key without partial dependency on composite keys.',
          },
          {
            question: 'Why does wrapping an indexed column in a function (e.g. WHERE YEAR(created_at) = 2024) often cause slow queries?',
            options: [
              'Because SQL prohibits functions in WHERE clauses.',
              'It invalidates index range scan usage (non-sargable), forcing a full table scan.',
              'Because the YEAR function terminates the database connection.',
              'Indexed columns cannot hold timestamps.',
            ],
            correctAnswer: 'It invalidates index range scan usage (non-sargable), forcing a full table scan.',
            skillTag: 'Query Optimization',
            explanation: 'Evaluating a function on every row prevents the query planner from performing an index seek or range scan (sargable predicate).',
          },
          {
            question: 'What is a Foreign Key constraint primarily designed to maintain between relational tables?',
            options: ['Faster arithmetic summation', 'Referential Integrity', 'Automatic encryption', 'Distributed sharding'],
            correctAnswer: 'Referential Integrity',
            skillTag: 'Relational Modeling',
            explanation: 'Foreign keys enforce referential integrity by ensuring an attribute value strictly references an existing row in the parent table.',
          },
        ],
      },
      {
        title: 'Applied AI Engineering & RAG Architecture',
        description: 'Tests understanding of Retrieval-Augmented Generation, vector embeddings, transformer attention, and evaluation metrics.',
        domain: 'Artificial Intelligence & ML',
        difficulty: 'Advanced',
        timeLimitMinutes: 25,
        passingPercentage: 75,
        tutorId: tutor._id,
        tutorName: tutor.name,
        questions: [
          {
            question: 'In a Retrieval-Augmented Generation (RAG) system, what is the purpose of semantic chunking prior to embedding generation?',
            options: [
              'To encrypt documents against unauthorized extraction.',
              'To keep passage context cohesive while staying within the embedding model token window.',
              'To convert all PDF text into low-resolution PNG images.',
              'To delete all punctuation marks from the corpus.',
            ],
            correctAnswer: 'To keep passage context cohesive while staying within the embedding model token window.',
            skillTag: 'RAG Architecture',
            explanation: 'Semantic chunking divides documents into meaningful contextual units that fit embedding model context limits while preserving thematic cohesion.',
          },
          {
            question: 'Which mathematical metric measures semantic similarity between two normalized text embedding vectors by taking their dot product?',
            options: ['Manhattan Distance', 'Cosine Similarity', 'Hamming Distance', 'Jaccard Index'],
            correctAnswer: 'Cosine Similarity',
            skillTag: 'Vector Embeddings',
            explanation: 'Cosine similarity measures the cosine of the angle between two vectors in multi-dimensional space, capturing orientation similarity regardless of magnitude.',
          },
          {
            question: 'What attention mechanism allows Transformer models to dynamically weight the importance of different words in a sentence simultaneously?',
            options: ['Recurrent Feedback Loop', 'Multi-Head Self-Attention', 'Convolutional Pooling', 'Markov Transition Gate'],
            correctAnswer: 'Multi-Head Self-Attention',
            skillTag: 'Transformer Attention',
            explanation: 'Multi-Head Self-Attention projects queries, keys, and values into multiple representation subspaces, capturing diverse contextual interactions in parallel.',
          },
          {
            question: 'When a model exhibits very low training loss but drastically higher validation loss, what phenomenon is occurring?',
            options: ['Underfitting', 'Overfitting', 'High Bias', 'Vanishing Gradients'],
            correctAnswer: 'Overfitting',
            skillTag: 'Model Generalization',
            explanation: 'Overfitting happens when a model memorizes noise and idiosyncrasies of the training data at the expense of generalizability on unseen data.',
          },
          {
            question: 'In medical disease detection or critical fraud identification, why is Recall typically prioritized over Precision?',
            options: [
              'Because false negatives (missing a disease) carry far more severe risk than false positives.',
              'Because Recall requires less computational power to evaluate.',
              'Precision cannot be calculated when accuracy is high.',
              'Recall always produces values greater than 1.0.',
            ],
            correctAnswer: 'Because false negatives (missing a disease) carry far more severe risk than false positives.',
            skillTag: 'Evaluation Metrics',
            explanation: 'Recall measures the proportion of actual positive cases successfully caught. In life-critical contexts, failing to detect a case (false negative) is disastrous.',
          },
        ],
      },
    ];

    await Assessment.insertMany(sampleAssessments);
    console.log('✅ Successfully seeded 4 Tutor Skill Assessments into MongoDB Atlas!');
  } catch (err) {
    console.warn('⚠️ Assessment seeding skipped or error:', err.message);
  }
}

module.exports = seedAssessments;
