/* auto-generated – do NOT edit */
export default [
  {
    "code": "import random\nclass Adventurer:\n    def __init__(self, name):\n        self.name = name\n        self.inventory = []\n\n    def collect_item(self, item):\n        self.inventory.append(item)\n        print(f\"{self.name} collected {item}!\")\n\ndef random_event():\n    events = [\"find a hidden treasure\", \"fall into a trap\", \"meet a friendly merchant\", \"fight a wild beast\"]\n    return random.choice(events)\n\ndef main():\n    player = Adventurer(\"Aria\")\n    for i in range(3):\n        event = random_event()\n        print(f\"Event #{i+1}: You {event}.\")\n        if \"treasure\" in event:\n            player.collect_item(\"Gold Coin\")\n    print(f\"Final Inventory: {player.inventory}\")\n\nif __name__ == \"__main__\":\n    main()\n",
    "language": "Python"
  },
  {
    "code": "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n\n    def __str__(self):\n        return f\"{self.title} by {self.author}\"\n\ndef load_books(filename):\n    books = []\n    with open(filename, \"r\") as f:\n        for line in f:\n            parts = line.strip().split(\"|\")\n            if len(parts) == 2:\n                books.append(Book(parts[0], parts[1]))\n    return books\n\ndef main():\n    # Suppose we have a file called 'library.txt'\n    books = load_books(\"library.txt\")\n    for b in books:\n        print(b)\n    uppercase_titles = [b.title.upper() for b in books]\n    print(\"Titles in uppercase:\", uppercase_titles)\n\nif __name__ == \"__main__\":\n    main()\n",
    "language": "Python"
  },
  {
    "code": "class Chat {\n  constructor(user) {\n    this.user = user;\n    this.messages = [];\n  }\n\n  sendMessage(msg) {\n    const messageObj = {\n      user: this.user,\n      text: msg,\n      time: new Date().toLocaleTimeString()\n    };\n    this.messages.push(messageObj);\n  }\n\n  displayMessages() {\n    console.clear();\n    console.log(\"----- Chat Messages -----\");\n    this.messages.forEach(m => {\n      console.log(`[${m.time}] ${m.user}: ${m.text}`);\n    });\n  }\n}\n\nconst myChat = new Chat(\"Alice\");\n\n// Mimic receiving messages over time\nsetInterval(() => {\n  myChat.sendMessage(\"Hello from \" + myChat.user);\n  myChat.displayMessages();\n}, 3000);\n",
    "language": "JavaScript"
  },
  {
    "code": "class TodoList {\n  constructor() {\n    this.todos = [];\n  }\n\n  async loadTodos(url) {\n    try {\n      const response = await fetch(url);\n      this.todos = await response.json();\n    } catch (error) {\n      console.error(\"Failed to load todos:\", error);\n    }\n  }\n\n  addTodo(task) {\n    this.todos.push({ title: task, completed: false });\n  }\n\n  completeTask(index) {\n    if (this.todos[index]) {\n      this.todos[index].completed = true;\n    }\n  }\n\n  printTodos() {\n    console.log(\"----- TODOS -----\");\n    this.todos.forEach((t, i) => {\n      console.log(\n        \\`\\${i + 1}: \\${t.title} [\\${t.completed ? \"DONE\" : \"PENDING\"}]\\`\n      );\n    });\n  }\n}\n\n(async function main() {\n  const list = new TodoList();\n  await list.loadTodos(\"https://jsonplaceholder.typicode.com/todos?_limit=5\");\n  list.printTodos();\n  list.addTodo(\"Learn more about async/await\");\n  list.completeTask(0);\n  list.printTodos();\n})();\n",
    "language": "JavaScript"
  },
  {
    "code": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nstruct Item {\n    string name;\n    int quantity;\n};\n\nint main() {\n    vector<Item> inventory;\n    inventory.push_back({\"Potion\", 5});\n    inventory.push_back({\"Elixir\", 2});\n    inventory.push_back({\"Ether\", 1});\n\n    cout << \"Current Inventory:\" << endl;\n    for (const auto &item : inventory) {\n        cout << item.name << \" x \" << item.quantity << endl;\n    }\n\n    cout << \"\\nAdding an item...\\n\";\n    inventory.push_back({\"Phoenix Down\", 1});\n\n    cout << \"Final Inventory:\" << endl;\n    for (const auto &item : inventory) {\n        cout << item.name << \" x \" << item.quantity << endl;\n    }\n\n    return 0;\n}\n",
    "language": "C++"
  },
  {
    "code": "#include <iostream>\n#include <vector>\n#include <memory>\nusing namespace std;\n\nclass Animal {\npublic:\n    virtual void makeSound() {\n        cout << \"Generic animal sound...\" << endl;\n    }\n    virtual ~Animal() {}\n};\n\nclass Dog : public Animal {\npublic:\n    void makeSound() override {\n        cout << \"Woof!\" << endl;\n    }\n};\n\nclass Cat : public Animal {\npublic:\n    void makeSound() override {\n        cout << \"Meow!\" << endl;\n    }\n};\n\nint main() {\n    vector<unique_ptr<Animal>> animals;\n    animals.push_back(make_unique<Dog>());\n    animals.push_back(make_unique<Cat>());\n\n    for (auto &a : animals) {\n        a->makeSound();\n    }\n    return 0;\n}\n",
    "language": "C++"
  },
  {
    "code": "module Greetings\n  def greet(name)\n    puts \"Hello, \\#{@name}! - from Greetings module\"\n  end\nend\n\nclass Wizard\n  include Greetings\n\n  attr_reader :mana\n\n  def initialize(name, mana)\n    @name = name\n    @mana = mana\n  end\n\n  def cast_spell(spell)\n    if @mana > 0\n      puts \"\\#{@name} casts \\#{spell}!\"\n      @mana -= 1\n    else\n      puts \"\\#{@name} is out of mana!\"\n    end\n  end\nend\n\nif __FILE__ == $0\n  merlin = Wizard.new(\"Merlin\", 3)\n  merlin.greet(\"Arthur\")\n  4.times { merlin.cast_spell(\"Fireball\") }\nend\n",
    "language": "Ruby"
  },
  {
    "code": "require 'csv'\n\nclass Customer\n  attr_reader :first_name, :last_name, :email\n\n  def initialize(first, last, email)\n    @first_name = first\n    @last_name = last\n    @email = email\n  end\n\n  def full_name\n    \"\\#{@first_name} \\#{@last_name}\"\n  end\nend\n\ndef load_customers(csv_file)\n  customers = []\n  CSV.foreach(csv_file, headers: true) do |row|\n    customers << Customer.new(row[\"First\"], row[\"Last\"], row[\"Email\"])\n  end\n  customers\nend\n\nif __FILE__ == $0\n  list = load_customers(\"customers.csv\")\n  list.each do |c|\n    puts \"\\#{c.full_name} <\\#{c.email}>\"\n  end\nend\n",
    "language": "Ruby"
  },
  {
    "code": "import java.util.ArrayList;\nimport java.util.List;\n\nclass Employee {\n    private String name;\n    private int id;\n    \n    public Employee(String n, int i) {\n        this.name = n;\n        this.id = i;\n    }\n    \n    public String getName() {\n        return name;\n    }\n    \n    public int getId() {\n        return id;\n    }\n}\n\npublic class Company {\n    public static void main(String[] args) {\n        List<Employee> staff = new ArrayList<>();\n        staff.add(new Employee(\"Alice\", 101));\n        staff.add(new Employee(\"Bob\", 102));\n        staff.add(new Employee(\"Charlie\", 103));\n        \n        System.out.println(\"Employee List:\");\n        for (Employee e : staff) {\n            System.out.println(e.getName() + \" (ID: \" + e.getId() + \")\");\n        }\n    }\n}\n",
    "language": "Java"
  },
  {
    "code": "import java.util.Scanner;\n\npublic class MenuDemo {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        boolean running = true;\n\n        while (running) {\n            System.out.println(\"----- MENU -----\");\n            System.out.println(\"1) Greet\");\n            System.out.println(\"2) Add Numbers\");\n            System.out.println(\"3) Quit\");\n            System.out.print(\"Choose an option: \");\n\n            int choice = sc.nextInt();\n            switch (choice) {\n                case 1:\n                    System.out.print(\"Enter your name: \");\n                    String name = sc.next();\n                    System.out.println(\"Hello, \" + name + \"!\");\n                    break;\n                case 2:\n                    System.out.print(\"Enter first number: \");\n                    int a = sc.nextInt();\n                    System.out.print(\"Enter second number: \");\n                    int b = sc.nextInt();\n                    System.out.println(\"Sum = \" + (a + b));\n                    break;\n                case 3:\n                    System.out.println(\"Goodbye!\");\n                    running = false;\n                    break;\n                default:\n                    System.out.println(\"Invalid choice.\");\n            }\n            System.out.println();\n        }\n        sc.close();\n    }\n}\n",
    "language": "Java"
  },
  {
    "code": "local function taskA()\n    for i = 1, 3 do\n        print(\"Task A - step \" .. i)\n        coroutine.yield()\n    end\nend\n\nlocal function taskB()\n    for i = 1, 5 do\n        print(\"Task B - step \" .. i)\n        coroutine.yield()\n    end\nend\n\nlocal coA = coroutine.create(taskA)\nlocal coB = coroutine.create(taskB)\n\nwhile coroutine.status(coA) ~= \"dead\" or coroutine.status(coB) ~= \"dead\" do\n    if coroutine.status(coA) ~= \"dead\" then\n        coroutine.resume(coA)\n    end\n    if coroutine.status(coB) ~= \"dead\" then\n        coroutine.resume(coB)\n    end\nend\n\nprint(\"All tasks finished!\")\n",
    "language": "Lua"
  },
  {
    "code": "local inventory = {}\n\nlocal function addItem(item, qty)\n    if inventory[item] then\n        inventory[item] = inventory[item] + qty\n    else\n        inventory[item] = qty\n    end\nend\n\nlocal function removeItem(item, qty)\n    if inventory[item] then\n        inventory[item] = inventory[item] - qty\n        if inventory[item] <= 0 then\n            inventory[item] = nil\n        end\n    end\nend\n\nlocal function printInventory()\n    print(\"----- Inventory -----\")\n    for item, count in pairs(inventory) do\n        print(item .. \": \" .. count)\n    end\nend\n\n-- Test usage\naddItem(\"Potion\", 3)\naddItem(\"Elixir\", 1)\naddItem(\"Potion\", 2)\nremoveItem(\"Potion\", 4)\nprintInventory()\n",
    "language": "Lua"
  },
  {
    "code": "#include \"Bios.inc\"\n\nU0 MyRandom(U8 seed)\n{\n   RSeed(seed);\n   Print(\"Random number is: %d\\n\", RNum());\n   Print(\"Another random number: %d\\n\", RNum());\n}\n\nU0 main()\n{\n   Print(\"Welcome to !\\n\");\n   MyRandom(42);\n   Print(\"Done.\\n\");\n}\n",
    "language": "HolyC"
  },
  {
    "code": "#include \"Bios.inc\"\n\nU0 Hello()\n{\n   Print(\"Hello from TempleOS ()!\\n\");\n}\n\nU0 main()\n{\n   Hello();\n   I32 i;\n   for (i = 0; i < 5; i++)\n   {\n      Print(\"i = %d\\n\", i);\n   }\n   Print(\"End of snippet.\\n\");\n}\n",
    "language": "HolyC"
  },
  {
    "code": "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic abstract class Vehicle {\n    public string Model { get; set; }\n    public int Year { get; set; }\n    public Vehicle(string model, int year) {\n        Model = model;\n        Year = year;\n    }\n    public abstract void Drive();\n}\n\npublic class Car : Vehicle {\n    public Car(string model, int year) : base(model, year) {}\n    public override void Drive() {\n        Console.WriteLine($\"Driving car {Model} ({Year}).\");\n    }\n}\n\nclass Program {\n    static void Main(string[] args) {\n        List<Vehicle> garage = new List<Vehicle>() {\n            new Car(\"Sedan\", 2018),\n            new Car(\"Coupe\", 2020),\n            new Car(\"Hatchback\", 2015),\n        };\n        var recentCars = garage.Where(v => v.Year >= 2018);\n        foreach (var car in recentCars) {\n            car.Drive();\n        }\n    }\n}\n",
    "language": "C#"
  },
  {
    "code": "using System;\nusing System.Threading.Tasks;\n\nclass Demo {\n    static async Task Main(string[] args) {\n        Console.WriteLine(\"Starting async demo...\");\n\n        string data = await LoadDataAsync();\n        Console.WriteLine($\"Received data: {data}\");\n\n        Console.WriteLine(\"Press any key to exit...\");\n        Console.ReadKey();\n    }\n\n    static async Task<string> LoadDataAsync() {\n        await Task.Delay(1000); // simulate I/O delay\n        return \"Sample Data from C# Async Method\";\n    }\n}\n",
    "language": "C#"
  },
  {
    "code": "import React, { useState, useEffect } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [items, setItems] = useState([]);\n\n  useEffect(() => {\n    console.log('Component mounted, fetching data...');\n    // Faking an API call\n    setTimeout(() => {\n      setItems(['Apple', 'Banana', 'Cherry']);\n    }, 1000);\n  }, []);\n\n  return (\n    <div>\n      <h1>React Counter</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n\n      <h2>Items</h2>\n      <ul>\n        {items.map((x, i) => <li key={i}>{x}</li>)}\n      </ul>\n    </div>\n  );\n}\n\nexport default App;\n",
    "language": "React"
  },
  {
    "code": "import React, { useState } from 'react';\n\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const [task, setTask] = useState('');\n\n  const addTodo = () => {\n    if (task.trim()) {\n      setTodos([...todos, { text: task, done: false }]);\n      setTask('');\n    }\n  };\n\n  const toggleTodo = (index) => {\n    const newTodos = [...todos];\n    newTodos[index].done = !newTodos[index].done;\n    setTodos(newTodos);\n  };\n\n  return (\n    <div>\n      <h1>React Todo List</h1>\n      <input value={task} onChange={(e) => setTask(e.target.value)} />\n      <button onClick={addTodo}>Add Todo</button>\n      <ul>\n        {todos.map((t, i) => (\n          <li \n            key={i}\n            style={{ textDecoration: t.done ? 'line-through' : 'none' }}\n            onClick={() => toggleTodo(i)}\n          >\n            {t.text}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nexport default TodoList;\n",
    "language": "React"
  },
  {
    "code": "import React from 'react';\n\nexport default function Home({ message, timestamp }) {\n  return (\n    <div style={{ margin: '1rem' }}>\n      <h1>Home Page</h1>\n      <p>{message}</p>\n      <hr />\n      <section>\n        <h2>Extra Content</h2>\n        <ul>\n          <li>This is a Next.js example page.</li>\n          <li>We can fetch data on the server side.</li>\n          <li>Timestamp: {timestamp}</li>\n          <li>Feel free to scroll around!</li>\n        </ul>\n      </section>\n    </div>\n  );\n}\n\nexport async function getServerSideProps() {\n  // Simulate a data fetch\n  const message = 'Hello from the server side!';\n  const timestamp = new Date().toLocaleString();\n\n  // Return these props to the React component\n  return {\n    props: {\n      message,\n      timestamp\n    }\n  };\n}\n",
    "language": "NextJS"
  },
  {
    "code": "export default async function handler(req, res) {\n  if (req.method === 'GET') {\n    // If there's a \"name\" query param, include it in the greeting\n    const { name = 'stranger' } = req.query;\n    res.status(200).json({\n      greeting: `Hello, ${name} from the Next.js API!`,\n      note: 'Feel free to scroll through this snippet.'\n    });\n  } else if (req.method === 'POST') {\n    // In a real app, you might parse JSON or perform DB operations\n    const body = req.body || {};\n    res.status(201).json({\n      success: true,\n      dataReceived: body,\n      message: 'POST data created successfully!'\n    });\n  } else {\n    // Return 405 for other HTTP methods\n    res.setHeader('Allow', ['GET', 'POST']);\n    res.status(405).json({ error: 'Method Not Allowed' });\n  }\n}\n",
    "language": "NextJS"
  },
  {
    "code": "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n\n    def __str__(self):\n        return f\"{self.title} by {self.author}\"\n\ndef load_books(filename):\n    books = []\n    with open(filename, \"r\") as f:\n        for line in f:\n            parts = line.strip().split(\"|\")\n            if len(parts) == 2:\n                books.append(Book(parts[0], parts[1]))\n    return books\n\ndef main():\n    # Suppose we have a file called 'library.txt'\n    books = load_books(\"library.txt\")\n    for b in books:\n        print(b)\n    uppercase_titles = [b.title.upper() for b in books]\n    print(\"Titles in uppercase:\", uppercase_titles)\n\nif __name__ == \"__main__\":\n    main()\n",
    "language": "Python"
  },
  {
    "code": "class Chat {\n  constructor(user) {\n    this.user = user;\n    this.messages = [];\n  }\n\n  sendMessage(msg) {\n    const messageObj = {\n      user: this.user,\n      text: msg,\n      time: new Date().toLocaleTimeString()\n    };\n    this.messages.push(messageObj);\n  }\n\n  displayMessages() {\n    console.clear();\n    console.log(\"----- Chat Messages -----\");\n    this.messages.forEach(m => {\n      console.log(`[${m.time}] ${m.user}: ${m.text}`);\n    });\n  }\n}\n\nconst myChat = new Chat(\"Alice\");\n\n// Mimic receiving messages over time\nsetInterval(() => {\n  myChat.sendMessage(\"Hello from \" + myChat.user);\n  myChat.displayMessages();\n}, 3000);\n",
    "language": "JavaScript"
  },
  {
    "code": "class TodoList {\n  constructor() {\n    this.todos = [];\n  }\n\n  async loadTodos(url) {\n    try {\n      const response = await fetch(url);\n      this.todos = await response.json();\n    } catch (error) {\n      console.error(\"Failed to load todos:\", error);\n    }\n  }\n\n  addTodo(task) {\n    this.todos.push({ title: task, completed: false });\n  }\n\n  completeTask(index) {\n    if (this.todos[index]) {\n      this.todos[index].completed = true;\n    }\n  }\n\n  printTodos() {\n    console.log(\"----- TODOS -----\");\n    this.todos.forEach((t, i) => {\n      console.log(\n        \\`\\${i + 1}: \\${t.title} [\\${t.completed ? \"DONE\" : \"PENDING\"}]\\`\n      );\n    });\n  }\n}\n\n(async function main() {\n  const list = new TodoList();\n  await list.loadTodos(\"https://jsonplaceholder.typicode.com/todos?_limit=5\");\n  list.printTodos();\n  list.addTodo(\"Learn more about async/await\");\n  list.completeTask(0);\n  list.printTodos();\n})();\n",
    "language": "JavaScript"
  },
  {
    "code": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nstruct Item {\n    string name;\n    int quantity;\n};\n\nint main() {\n    vector<Item> inventory;\n    inventory.push_back({\"Potion\", 5});\n    inventory.push_back({\"Elixir\", 2});\n    inventory.push_back({\"Ether\", 1});\n\n    cout << \"Current Inventory:\" << endl;\n    for (const auto &item : inventory) {\n        cout << item.name << \" x \" << item.quantity << endl;\n    }\n\n    cout << \"\\nAdding an item...\\n\";\n    inventory.push_back({\"Phoenix Down\", 1});\n\n    cout << \"Final Inventory:\" << endl;\n    for (const auto &item : inventory) {\n        cout << item.name << \" x \" << item.quantity << endl;\n    }\n\n    return 0;\n}\n",
    "language": "C++"
  },
  {
    "code": "#include <iostream>\n#include <vector>\n#include <memory>\nusing namespace std;\n\nclass Animal {\npublic:\n    virtual void makeSound() {\n        cout << \"Generic animal sound...\" << endl;\n    }\n    virtual ~Animal() {}\n};\n\nclass Dog : public Animal {\npublic:\n    void makeSound() override {\n        cout << \"Woof!\" << endl;\n    }\n};\n\nclass Cat : public Animal {\npublic:\n    void makeSound() override {\n        cout << \"Meow!\" << endl;\n    }\n};\n\nint main() {\n    vector<unique_ptr<Animal>> animals;\n    animals.push_back(make_unique<Dog>());\n    animals.push_back(make_unique<Cat>());\n\n    for (auto &a : animals) {\n        a->makeSound();\n    }\n    return 0;\n}\n",
    "language": "C++"
  },
  {
    "code": "module Greetings\n  def greet(name)\n    puts \"Hello, \\#{@name}! - from Greetings module\"\n  end\nend\n\nclass Wizard\n  include Greetings\n\n  attr_reader :mana\n\n  def initialize(name, mana)\n    @name = name\n    @mana = mana\n  end\n\n  def cast_spell(spell)\n    if @mana > 0\n      puts \"\\#{@name} casts \\#{spell}!\"\n      @mana -= 1\n    else\n      puts \"\\#{@name} is out of mana!\"\n    end\n  end\nend\n\nif __FILE__ == $0\n  merlin = Wizard.new(\"Merlin\", 3)\n  merlin.greet(\"Arthur\")\n  4.times { merlin.cast_spell(\"Fireball\") }\nend\n",
    "language": "Ruby"
  },
  {
    "code": "require 'csv'\n\nclass Customer\n  attr_reader :first_name, :last_name, :email\n\n  def initialize(first, last, email)\n    @first_name = first\n    @last_name = last\n    @email = email\n  end\n\n  def full_name\n    \"\\#{@first_name} \\#{@last_name}\"\n  end\nend\n\ndef load_customers(csv_file)\n  customers = []\n  CSV.foreach(csv_file, headers: true) do |row|\n    customers << Customer.new(row[\"First\"], row[\"Last\"], row[\"Email\"])\n  end\n  customers\nend\n\nif __FILE__ == $0\n  list = load_customers(\"customers.csv\")\n  list.each do |c|\n    puts \"\\#{c.full_name} <\\#{c.email}>\"\n  end\nend\n",
    "language": "Ruby"
  },
  {
    "code": "import java.util.ArrayList;\nimport java.util.List;\n\nclass Employee {\n    private String name;\n    private int id;\n\n    public Employee(String n, int i) {\n        this.name = n;\n        this.id = i;\n    }\n\n    public String getName() {\n        return name;\n    }\n\n    public int getId() {\n        return id;\n    }\n}\n\npublic class Company {\n    public static void main(String[] args) {\n        List<Employee> staff = new ArrayList<>();\n        staff.add(new Employee(\"Alice\", 101));\n        staff.add(new Employee(\"Bob\", 102));\n        staff.add(new Employee(\"Charlie\", 103));\n\n        System.out.println(\"Employee List:\");\n        for (Employee e : staff) {\n            System.out.println(e.getName() + \" (ID: \" + e.getId() + \")\");\n        }\n    }\n}\n",
    "language": "Java"
  },
  {
    "code": "import java.util.Scanner;\n\npublic class MenuDemo {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        boolean running = true;\n\n        while (running) {\n            System.out.println(\"----- MENU -----\");\n            System.out.println(\"1) Greet\");\n            System.out.println(\"2) Add Numbers\");\n            System.out.println(\"3) Quit\");\n            System.out.print(\"Choose an option: \");\n\n            int choice = sc.nextInt();\n            switch (choice) {\n                case 1:\n                    System.out.print(\"Enter your name: \");\n                    String name = sc.next();\n                    System.out.println(\"Hello, \" + name + \"!\");\n                    break;\n                case 2:\n                    System.out.print(\"Enter first number: \");\n                    int a = sc.nextInt();\n                    System.out.print(\"Enter second number: \");\n                    int b = sc.nextInt();\n                    System.out.println(\"Sum = \" + (a + b));\n                    break;\n                case 3:\n                    System.out.println(\"Goodbye!\");\n                    running = false;\n                    break;\n                default:\n                    System.out.println(\"Invalid choice.\");\n            }\n            System.out.println();\n        }\n        sc.close();\n    }\n}\n",
    "language": "Java"
  },
  {
    "code": "local function taskA()\n    for i = 1, 3 do\n        print(\"Task A - step \" .. i)\n        coroutine.yield()\n    end\nend\n\nlocal function taskB()\n    for i = 1, 5 do\n        print(\"Task B - step \" .. i)\n        coroutine.yield()\n    end\nend\n\nlocal coA = coroutine.create(taskA)\nlocal coB = coroutine.create(taskB)\n\nwhile coroutine.status(coA) ~= \"dead\" or coroutine.status(coB) ~= \"dead\" do\n    if coroutine.status(coA) ~= \"dead\" then\n        coroutine.resume(coA)\n    end\n    if coroutine.status(coB) ~= \"dead\" then\n        coroutine.resume(coB)\n    end\nend\n\nprint(\"All tasks finished!\")\n",
    "language": "Lua"
  },
  {
    "code": "local inventory = {}\n\nlocal function addItem(item, qty)\n    if inventory[item] then\n        inventory[item] = inventory[item] + qty\n    else\n        inventory[item] = qty\n    end\nend\n\nlocal function removeItem(item, qty)\n    if inventory[item] then\n        inventory[item] = inventory[item] - qty\n        if inventory[item] <= 0 then\n            inventory[item] = nil\n        end\n    end\nend\n\nlocal function printInventory()\n    print(\"----- Inventory -----\")\n    for item, count in pairs(inventory) do\n        print(item .. \": \" .. count)\n    end\nend\n\n-- Test usage\naddItem(\"Potion\", 3)\naddItem(\"Elixir\", 1)\naddItem(\"Potion\", 2)\nremoveItem(\"Potion\", 4)\nprintInventory()\n",
    "language": "Lua"
  },
  {
    "code": "#include \"Bios.inc\"\n\nU0 MyRandom(U8 seed)\n{\n   RSeed(seed);\n   Print(\"Random number is: %d\\n\", RNum());\n   Print(\"Another random number: %d\\n\", RNum());\n}\n\nU0 main()\n{\n   Print(\"Welcome to !\\n\");\n   MyRandom(42);\n   Print(\"Done.\\n\");\n}\n",
    "language": "HolyC"
  },
  {
    "code": "#include \"Bios.inc\"\n\nU0 Hello()\n{\n   Print(\"Hello from TempleOS ()!\\n\");\n}\n\nU0 main()\n{\n   Hello();\n   I32 i;\n   for (i = 0; i < 5; i++)\n   {\n      Print(\"i = %d\\n\", i);\n   }\n   Print(\"End of snippet.\\n\");\n}\n",
    "language": "HolyC"
  },
  {
    "code": "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic abstract class Vehicle {\n    public string Model { get; set; }\n    public int Year { get; set; }\n    public Vehicle(string model, int year) {\n        Model = model;\n        Year = year;\n    }\n    public abstract void Drive();\n}\n\npublic class Car : Vehicle {\n    public Car(string model, int year) : base(model, year) {}\n    public override void Drive() {\n        Console.WriteLine($\"Driving car {Model} ({Year}).\");\n    }\n}\n\nclass Program {\n    static void Main(string[] args) {\n        List<Vehicle> garage = new List<Vehicle>() {\n            new Car(\"Sedan\", 2018),\n            new Car(\"Coupe\", 2020),\n            new Car(\"Hatchback\", 2015),\n        };\n        var recentCars = garage.Where(v => v.Year >= 2018);\n        foreach (var car in recentCars) {\n            car.Drive();\n        }\n    }\n}\n",
    "language": "C#"
  },
  {
    "code": "using System;\nusing System.Threading.Tasks;\n\nclass Demo {\n    static async Task Main(string[] args) {\n        Console.WriteLine(\"Starting async demo...\");\n\n        string data = await LoadDataAsync();\n        Console.WriteLine($\"Received data: {data}\");\n\n        Console.WriteLine(\"Press any key to exit...\");\n        Console.ReadKey();\n    }\n\n    static async Task<string> LoadDataAsync() {\n        await Task.Delay(1000); // simulate I/O delay\n        return \"Sample Data from C# Async Method\";\n    }\n}\n",
    "language": "C#"
  },
  {
    "code": "import React, { useState, useEffect } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [items, setItems] = useState([]);\n\n  useEffect(() => {\n    console.log('Component mounted, fetching data...');\n    // Faking an API call\n    setTimeout(() => {\n      setItems(['Apple', 'Banana', 'Cherry']);\n    }, 1000);\n  }, []);\n\n  return (\n    <div>\n      <h1>React Counter</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n\n      <h2>Items</h2>\n      <ul>\n        {items.map((x, i) => <li key={i}>{x}</li>)}\n      </ul>\n    </div>\n  );\n}\n\nexport default App;\n",
    "language": "React"
  },
  {
    "code": "import React, { useState } from 'react';\n\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const [task, setTask] = useState('');\n\n  const addTodo = () => {\n    if (task.trim()) {\n      setTodos([...todos, { text: task, done: false }]);\n      setTask('');\n    }\n  };\n\n  const toggleTodo = (index) => {\n    const newTodos = [...todos];\n    newTodos[index].done = !newTodos[index].done;\n    setTodos(newTodos);\n  };\n\n  return (\n    <div>\n      <h1>React Todo List</h1>\n      <input value={task} onChange={(e) => setTask(e.target.value)} />\n      <button onClick={addTodo}>Add Todo</button>\n      <ul>\n        {todos.map((t, i) => (\n          <li\n            key={i}\n            style={{ textDecoration: t.done ? 'line-through' : 'none' }}\n            onClick={() => toggleTodo(i)}\n          >\n            {t.text}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nexport default TodoList;\n",
    "language": "React"
  },
  {
    "code": "import React from 'react';\n\nexport default function Home({ message, timestamp }) {\n  return (\n    <div style={{ margin: '1rem' }}>\n      <h1>Home Page</h1>\n      <p>{message}</p>\n      <hr />\n      <section>\n        <h2>Extra Content</h2>\n        <ul>\n          <li>This is a Next.js example page.</li>\n          <li>We can fetch data on the server side.</li>\n          <li>Timestamp: {timestamp}</li>\n          <li>Feel free to scroll around!</li>\n        </ul>\n      </section>\n    </div>\n  );\n}\n\nexport async function getServerSideProps() {\n  // Simulate a data fetch\n  const message = 'Hello from the server side!';\n  const timestamp = new Date().toLocaleString();\n\n  // Return these props to the React component\n  return {\n    props: {\n      message,\n      timestamp\n    }\n  };\n}\n",
    "language": "NextJS"
  },
  {
    "code": "export default async function handler(req, res) {\n  if (req.method === 'GET') {\n    // If there's a \"name\" query param, include it in the greeting\n    const { name = 'stranger' } = req.query;\n    res.status(200).json({\n      greeting: `Hello, ${name} from the Next.js API!`,\n      note: 'Feel free to scroll through this snippet.'\n    });\n  } else if (req.method === 'POST') {\n    // In a real app, you might parse JSON or perform DB operations\n    const body = req.body || {};\n    res.status(201).json({\n      success: true,\n      dataReceived: body,\n      message: 'POST data created successfully!'\n    });\n  } else {\n    // Return 405 for other HTTP methods\n    res.setHeader('Allow', ['GET', 'POST']);\n    res.status(405).json({ error: 'Method Not Allowed' });\n  }\n}\n",
    "language": "NextJS"
  }
];
