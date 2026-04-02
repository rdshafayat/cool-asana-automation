# Asana Task Automation 🚀

Automate your Asana workflow using a simple rule-based system.
This project detects new tasks, assigns them to the correct project based on keywords, and automatically sets due dates.

---

## ✨ Features

* ✅ Detects **new tasks** from "My Tasks"
* 🧠 Routes tasks based on **keyword matching**
* 📁 Automatically assigns tasks to the correct **project**
* 📅 Sets **due dates** based on weekday rules
* 🔁 Prevents duplicate processing using local state

---

## ⚙️ How It Works

1. Fetch tasks assigned to you from Asana
2. Check if the task is new (not processed before)
3. Match task name with predefined keywords
4. Assign:

   * Project
   * Due date
5. Mark task as processed

---

## 🧩 Routing Logic

| Keyword  | Project         | Day       |
| -------- | --------------- | --------- |
| nomad    | Unlikely Nomads | Monday    |
| stock    | Stock           | Tuesday   |
| probashi | Probashi        | Wednesday |
| cmo      | Fractional CMO  | Thursday  |
| app / ai | App             | Friday    |

---

## 🛠 Tech Stack

* Node.js
* Asana REST API
* File system (`fs`) for state tracking
* Custom rule-based logic (no AI)

---

## 📦 Setup

### 1. Clone the repository

```bash
git clone https://github.com/rdshafayat/cool-asana-automation.git
cd cool-asana-automation
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create `.env` file

```env
ASANA_API_KEY=your_api_key_here
```

---

### 4. Run the script

```bash
node fetchTasks.js
```

---

## 🔄 Continuous Mode (Optional)

To keep it running automatically:

```javascript
async function run() {
  while (true) {
    await getMyTasks();
    await new Promise((r) => setTimeout(r, 30000));
  }
}

run();
```

---

## 📁 Project Structure

```
.
├── fetchTasks.js
├── processed.json
├── .env
├── .gitignore
└── README.md
```

---

## 🔒 Notes

* `.env` is ignored for security
* `processed.json` prevents duplicate task processing
* Requires an active Asana account and API token

---

## 💡 Example

**Input Task:**

```
Fix nomad landing page
```

**Output:**

```
→ Project: Unlikely Nomads
→ Due Date: Monday
```

---

## 📌 Why This Project?

This demonstrates:

* API integration
* Async JavaScript handling
* Automation system design
* Real-world problem solving

---

## 🙌 Author

Built by Shafayat Hossain
GitHub: https://github.com/rdshafayat

---

## ⭐ If you like it

Give it a star ⭐ — helps others discover it!
